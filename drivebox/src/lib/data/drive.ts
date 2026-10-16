import { Account, Client, ID, Permission, Query, Role } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { categoryMeta, MAX_FILE_SIZE, TOTAL_SPACE, type CategoryKey } from "@/constants";
import {
  clearSessionCookie,
  createAdminClient,
  createSessionClient,
  readSessionSecret,
  setSessionCookie,
} from "@/lib/appwrite";
import {
  appwriteConfig,
  constructFileUrl,
  isAppwriteConfigured,
} from "@/lib/appwrite/config";
import {
  createId,
  createOtpCode,
  readBlob,
  readLocal,
  removeBlob,
  updateLocal,
  writeBlob,
} from "@/lib/data/local-store";
import { getFileType, isEmail } from "@/lib/utils";
import type { AuthPayload, DriveFile, DriveUser, UsageSummary } from "@/types";

const OTP_TTL = 10 * 60 * 1000;
const AVATAR = "/avatar.svg";

const categoryOrder: CategoryKey[] = ["documents", "images", "media", "others"];

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function mapUser(doc: {
  $id: string;
  fullName: string;
  email: string;
  avatar?: string;
  accountId: string;
}): DriveUser {
  return {
    $id: doc.$id,
    fullName: doc.fullName,
    email: doc.email,
    avatar: doc.avatar || AVATAR,
    accountId: doc.accountId,
  };
}

function mapFile(doc: {
  $id: string;
  $createdAt: string;
  name?: unknown;
  url?: unknown;
  extension?: unknown;
  size?: unknown;
  type?: unknown;
  owner?: unknown;
  accountId?: unknown;
  users?: unknown;
  bucketFileId?: unknown;
  bucketfield?: unknown;
}): DriveFile {
  const type = doc.type === "image" || doc.type === "document" || doc.type === "video" || doc.type === "audio" || doc.type === "other"
    ? doc.type
    : "other";
  return {
    $id: doc.$id,
    name: String(doc.name ?? ""),
    url: String(doc.url ?? ""),
    extension: String(doc.extension ?? ""),
    size: Number(doc.size) || 0,
    type,
    owner: String(doc.owner || doc.accountId || ""),
    users: readSharedUsers(doc.users),
    $createdAt: doc.$createdAt,
    bucketFileId: storedFileId(doc),
  };
}

const bucketAttributeNames = ["bucketFileId", "bucketfield", "bucketFileID", "bucket_file_id"];

function storedFileId(doc: { bucketFileId?: unknown; bucketfield?: unknown }) {
  const record = doc as Record<string, unknown>;
  for (const key of bucketAttributeNames) {
    if (record[key]) return String(record[key]);
  }
  return "";
}

function fileBelongsTo(file: DriveFile, user: DriveUser) {
  return file.owner === user.$id || file.owner === user.accountId || file.users.includes(user.email);
}

function fileOwnedBy(file: DriveFile, user: DriveUser) {
  return file.owner === user.$id || file.owner === user.accountId;
}

type FileAttribute = {
  key: string;
  type: string;
  required: boolean;
  array: boolean;
  relationType: string;
};

let cachedFileAttributes: FileAttribute[] | null = null;

function readSharedUsers(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "$id" in item) return String(item.$id);
      return "";
    }).filter(Boolean);
  }
  if (typeof value === "string" && value) return [value];
  if (value && typeof value === "object" && "$id" in value) return [String(value.$id)];
  return [];
}

function relationshipAcceptsArray(relationType: string) {
  return relationType === "oneToMany" || relationType === "manyToMany";
}

async function fileAttributes() {
  if (cachedFileAttributes) return cachedFileAttributes;
  const { databases } = await createAdminClient();
  const collection = await databases.getCollection(
    appwriteConfig.databaseId,
    appwriteConfig.filesCollectionId,
  );
  cachedFileAttributes = collection.attributes.flatMap((attribute) => {
    if (!attribute || typeof attribute !== "object" || !("key" in attribute) || typeof attribute.key !== "string") {
      return [];
    }
    const relationType = "relationType" in attribute && typeof attribute.relationType === "string" ? attribute.relationType : "";
    return [{
      key: attribute.key,
      type: "type" in attribute && typeof attribute.type === "string" ? attribute.type : "",
      required: "required" in attribute && attribute.required === true,
      array: "array" in attribute && attribute.array === true,
      relationType,
    }];
  });
  return cachedFileAttributes;
}

async function fileAttributeKeys() {
  const attributes = await fileAttributes();
  return new Set(attributes.map((attribute) => attribute.key));
}

function identityQueries(attributes: FileAttribute[], user: DriveUser) {
  const keys = new Set(attributes.map((attribute) => attribute.key));
  const usersAttribute = attributes.find((attribute) => attribute.key === "users");
  const parts: string[] = [];
  if (keys.has("owner")) parts.push(Query.equal("owner", [user.$id]));
  if (keys.has("accountId") && user.accountId) parts.push(Query.equal("accountId", [user.accountId]));
  if (usersAttribute?.type === "relationship" && !relationshipAcceptsArray(usersAttribute.relationType)) {
    parts.push(Query.equal("users", [user.$id]));
  } else if (usersAttribute && usersAttribute.type !== "relationship" && user.email) {
    parts.push(Query.contains("users", [user.email]));
  }
  if (parts.length > 1) return [Query.or(parts), Query.limit(100)];
  if (parts.length === 1) return [parts[0], Query.limit(100)];
  return [Query.limit(100)];
}

function sortFiles(files: DriveFile[], sort?: string) {
  const [field, direction] = splitSort(sort);
  const factor = direction === "asc" ? 1 : -1;
  return [...files].sort((a, b) => {
    if (field === "name") return a.name.localeCompare(b.name) * factor;
    if (field === "size") return (a.size - b.size) * factor;
    return (new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()) * factor;
  });
}

function splitSort(sort?: string): [string, "asc" | "desc"] {
  if (!sort) return ["$createdAt", "desc"];
  const index = sort.lastIndexOf("-");
  const field = sort.slice(0, index) || "$createdAt";
  const direction = sort.slice(index + 1) === "asc" ? "asc" : "desc";
  return [field, direction];
}

function summarize(files: DriveFile[]): UsageSummary {
  const categories = categoryOrder.map((key) => {
    const meta = categoryMeta[key];
    const group = files.filter((file) => (meta.types as readonly string[]).includes(file.type));
    const latest = group
      .map((file) => file.$createdAt)
      .sort()
      .at(-1);
    return {
      key,
      label: meta.label,
      size: group.reduce((sum, file) => sum + file.size, 0),
      latest,
    };
  });

  return {
    used: files.reduce((sum, file) => sum + file.size, 0),
    total: TOTAL_SPACE,
    categories,
  };
}

async function sendAppwriteOtp(email: string, accountId?: string) {
  const { account } = await createAdminClient();
  const token = await account.createEmailToken({
    userId: accountId || ID.unique(),
    email,
  });
  return token.userId;
}

async function findUserDocument(identity: { $id: string; email: string }) {
  const { databases } = await createAdminClient();
  const databaseId = appwriteConfig.databaseId;
  const collectionId = appwriteConfig.usersCollectionId;

  const matches = async (queries: string[]) => {
    const list = await databases.listDocuments(databaseId, collectionId, queries);
    return list.documents[0] ?? null;
  };

  try {
    const byAccount = await matches([Query.equal("accountId", identity.$id), Query.limit(1)]);
    if (byAccount) return byAccount;
  } catch (error) {
    console.error("Account lookup by id failed", error);
  }

  try {
    const byEmail = await matches([Query.equal("email", identity.email), Query.limit(1)]);
    if (byEmail) return byEmail;
  } catch (error) {
    console.error("Account lookup by email failed", error);
  }

  const listed = await databases.listDocuments(databaseId, collectionId, [Query.limit(100)]);
  return (
    listed.documents.find(
      (doc) => doc.accountId === identity.$id || doc.email === identity.email,
    ) ?? null
  );
}

async function ensureAppwriteProfile(secret: string) {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId)
    .setSession(secret);
  const identity = await new Account(client).get();
  const { databases } = await createAdminClient();
  const existing = await findUserDocument(identity);

  if (!existing) {
    const created = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName: identity.name || identity.email.split("@")[0] || "DriveBox user",
        email: identity.email,
        avatar: AVATAR,
        accountId: identity.$id,
      },
    );
    return mapUser(created as unknown as DriveUser);
  }

  if (existing.accountId !== identity.$id) {
    try {
      const updated = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        existing.$id,
        { accountId: identity.$id },
      );
      return mapUser(updated as unknown as DriveUser);
    } catch (error) {
      console.error("Could not refresh account id", error);
    }
  }

  return mapUser(existing as unknown as DriveUser);
}

export async function getCurrentUser(): Promise<DriveUser | null> {
  if (!isAppwriteConfigured()) {
    const secret = await readSessionSecret();
    if (!secret) return null;
    return readLocal((db) => {
      const session = db.sessions.find((item) => item.secret === secret);
      if (!session) return null;
      return db.users.find((user) => user.accountId === session.accountId) ?? null;
    });
  }

  try {
    const { account } = await createSessionClient();
    const identity = await account.get();
    const doc = await findUserDocument(identity);
    return doc ? mapUser(doc as unknown as DriveUser) : null;
  } catch (error) {
    console.error("Could not read the signed-in user", error);
    return null;
  }
}

export async function createAccount(input: {
  fullName: string;
  email: string;
}): Promise<AuthPayload> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  if (fullName.length < 2) return { error: "Enter your full name." };
  if (!isEmail(email)) return { error: "Enter a valid email address." };

  if (!isAppwriteConfigured()) {
    return updateLocal((db) => {
      let user = db.users.find((item) => item.email === email);
      if (!user) {
        user = {
          $id: createId(),
          fullName,
          email,
          avatar: AVATAR,
          accountId: createId(),
        };
        db.users.push(user);
      }
      const code = createOtpCode();
      db.otps = db.otps.filter((item) => item.email !== email);
      db.otps.push({
        email,
        accountId: user.accountId,
        code,
        expiresAt: Date.now() + OTP_TTL,
      });
      return { accountId: user.accountId, demoCode: code };
    });
  }

  try {
    const { databases } = await createAdminClient();
    const existing = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("email", [email])],
    );
    const current = existing.documents[0] as { accountId?: string } | undefined;
    const accountId = await sendAppwriteOtp(email, current?.accountId);

    if (!current) {
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        ID.unique(),
        {
          fullName,
          email,
          avatar: AVATAR,
          accountId,
        },
      );
    }

    return { accountId };
  } catch (error) {
    return { error: errorMessage(error, "Could not send a verification code.") };
  }
}

export async function signInAccount(emailInput: string): Promise<AuthPayload> {
  const email = emailInput.trim().toLowerCase();
  if (!isEmail(email)) return { error: "Enter a valid email address." };

  if (!isAppwriteConfigured()) {
    return updateLocal((db) => {
      const user = db.users.find((item) => item.email === email);
      if (!user) return { error: "No box exists for that email. Create one first." };
      const code = createOtpCode();
      db.otps = db.otps.filter((item) => item.email !== email);
      db.otps.push({
        email,
        accountId: user.accountId,
        code,
        expiresAt: Date.now() + OTP_TTL,
      });
      return { accountId: user.accountId, demoCode: code };
    });
  }

  try {
    const { databases } = await createAdminClient();
    const existing = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("email", [email])],
    );
    const current = existing.documents[0] as { $id?: string; accountId?: string } | undefined;
    if (!current?.accountId || !current.$id) {
      return { error: "No box exists for that email. Create one first." };
    }
    const accountId = await sendAppwriteOtp(email, current.accountId);
    if (accountId && accountId !== current.accountId) {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        current.$id,
        { accountId },
      );
    }
    return { accountId };
  } catch (error) {
    return { error: errorMessage(error, "Could not send a verification code.") };
  }
}

export async function verifyOtp(accountId: string, password: string): Promise<AuthPayload> {
  const code = password.replace(/\s+/g, "").trim();
  if (!accountId || code.length < 6) {
    return { error: "Enter the 6-digit code." };
  }

  if (!isAppwriteConfigured()) {
    const result = await updateLocal((db) => {
      const otp = db.otps.find((item) => item.accountId === accountId && item.code === code);
      if (!otp || otp.expiresAt < Date.now()) {
        return { error: "That code is not valid. Request a new one." };
      }
      db.otps = db.otps.filter((item) => item !== otp);
      const secret = createId();
      db.sessions = db.sessions.filter((item) => item.accountId !== accountId);
      db.sessions.push({ secret, accountId });
      return { secret };
    });
    if ("error" in result && result.error) return { error: result.error };
    if (!("secret" in result) || !result.secret) return { error: "Could not open a session." };
    await setSessionCookie(result.secret);
    return { accountId };
  }

  try {
    const { account } = await createAdminClient();
    const session = await account.createSession({ userId: accountId, secret: code });
    if (!session.secret) {
      return {
        error: "Appwrite accepted the code but did not return a session. Check that the API key is a server key.",
      };
    }
    await ensureAppwriteProfile(session.secret);
    await setSessionCookie(session.secret);
    return { accountId: session.userId || accountId };
  } catch (error) {
    return { error: errorMessage(error, "That code is not valid. Request a new one.") };
  }
}

export async function resendOtp(emailInput: string): Promise<AuthPayload> {
  const email = emailInput.trim().toLowerCase();
  if (!isAppwriteConfigured()) {
    return updateLocal((db) => {
      const user = db.users.find((item) => item.email === email);
      if (!user) return { error: "No box exists for that email." };
      const code = createOtpCode();
      db.otps = db.otps.filter((item) => item.email !== email);
      db.otps.push({
        email,
        accountId: user.accountId,
        code,
        expiresAt: Date.now() + OTP_TTL,
      });
      return { accountId: user.accountId, demoCode: code };
    });
  }

  try {
    const { databases } = await createAdminClient();
    const existing = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("email", [email])],
    );
    const current = existing.documents[0] as { accountId?: string } | undefined;
    const accountId = await sendAppwriteOtp(email, current?.accountId);
    return { accountId };
  } catch (error) {
    return { error: errorMessage(error, "Could not resend the code.") };
  }
}

export async function signOut() {
  if (!isAppwriteConfigured()) {
    const secret = await readSessionSecret();
    if (secret) {
      await updateLocal((db) => {
        db.sessions = db.sessions.filter((item) => item.secret !== secret);
      });
    }
  } else {
    try {
      const { account } = await createSessionClient();
      await account.deleteSession("current");
    } catch {
      // The cookie is cleared even if Appwrite already dropped the session.
    }
  }
  await clearSessionCookie();
}

async function ownedFiles(user: DriveUser) {
  if (!isAppwriteConfigured()) {
    return readLocal((db) =>
      db.files.filter((file) => file.owner === user.$id || file.users.includes(user.email)),
    );
  }

  const { databases } = await createAdminClient();
  const attributes = await fileAttributes();
  const visible = (documents: DriveFile[]) => documents.filter((file) => fileBelongsTo(file, user));

  try {
    const list = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      identityQueries(attributes, user),
    );
    return visible(list.documents.map((doc) => mapFile(doc)));
  } catch {
    // A missing index rejects the filtered query. The plain list below still works.
  }

  try {
    const list = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.limit(100)],
    );
    return visible(list.documents.map((doc) => mapFile(doc)));
  } catch {
    return [];
  }
}

export async function listFiles(options: {
  user: DriveUser;
  types?: string[];
  search?: string;
  sort?: string;
  limit?: number;
}) {
  let files = await ownedFiles(options.user);
  if (options.types?.length) {
    files = files.filter((file) => options.types!.includes(file.type));
  }
  if (options.search) {
    const needle = options.search.toLowerCase();
    files = files.filter((file) => file.name.toLowerCase().includes(needle));
  }
  files = sortFiles(files, options.sort);
  if (options.limit) files = files.slice(0, options.limit);
  return files;
}

export async function getUsage(user: DriveUser) {
  const files = await ownedFiles(user);
  return summarize(files.filter((file) => fileOwnedBy(file, user)));
}

async function getOwnedFile(user: DriveUser, fileId: string) {
  const files = await ownedFiles(user);
  return files.find((file) => file.$id === fileId && fileOwnedBy(file, user)) ?? null;
}

export async function uploadFiles(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Sign in again to upload." };

    const incoming = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (!incoming.length) return { error: "Choose at least one file." };

    let remaining = TOTAL_SPACE;
    try {
      const usage = await getUsage(user);
      remaining = usage.total - usage.used;
    } catch {
      // Storage totals are optional. A failed count must not block the upload.
    }

    const prepared: { file: File; bytes: Buffer; type: DriveFile["type"]; extension: string }[] = [];

    for (const file of incoming) {
      if (file.size > MAX_FILE_SIZE) {
        return { error: `${file.name} is larger than 50 MB.` };
      }
      if (file.size > remaining) {
        return { error: "That upload would pass your 2 GB limit." };
      }
      remaining -= file.size;
      const info = getFileType(file.name);
      prepared.push({
        file,
        bytes: Buffer.from(await file.arrayBuffer()),
        type: info.type,
        extension: info.extension,
      });
    }

    if (!isAppwriteConfigured()) {
      await updateLocal(async (db) => {
        for (const item of prepared) {
          const bucketFileId = createId();
          await writeBlob(bucketFileId, item.bytes);
          db.files.push({
            $id: createId(),
            name: item.file.name,
            url: `/api/blob/${bucketFileId}`,
            extension: item.extension,
            size: item.file.size,
            type: item.type,
            owner: user.$id,
            users: [],
            $createdAt: new Date().toISOString(),
            bucketFileId,
          });
        }
      });
      return { uploaded: prepared.length };
    }

    const { databases, storage } = await createAdminClient();
    const keys = await fileAttributeKeys();
    if (!keys.has("owner") && !keys.has("accountId")) {
      return {
        error: "Add an accountId or owner attribute on the files collection, then upload again.",
      };
    }
    for (const item of prepared) {
      const bucketFileId = ID.unique();
      await storage.createFile(
        appwriteConfig.bucketId,
        bucketFileId,
        InputFile.fromBuffer(item.bytes, item.file.name),
        [Permission.read(Role.any())],
      );
      const fields: Record<string, unknown> = {
        type: item.type,
        name: item.file.name,
        url: constructFileUrl(bucketFileId),
        extension: item.extension,
        size: item.file.size,
        owner: user.$id,
        accountId: user.accountId,
      };
      const usersAttribute = (await fileAttributes()).find((attribute) => attribute.key === "users");
      if (usersAttribute?.type === "relationship" && !relationshipAcceptsArray(usersAttribute.relationType)) {
        fields.users = user.$id;
      } else if (usersAttribute && usersAttribute.type !== "relationship") {
        fields.users = [];
      }
      for (const key of bucketAttributeNames) {
        if (keys.has(key)) fields[key] = bucketFileId;
      }
      const data: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(fields)) {
        if (keys.has(key)) data[key] = value;
      }
      try {
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.filesCollectionId,
          ID.unique(),
          data,
        );
      } catch (error) {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFileId).catch(() => undefined);
        throw error;
      }
    }
    return { uploaded: prepared.length };
  } catch (error) {
    return { error: errorMessage(error, "Upload failed.") };
  }
}

export async function renameFile(fileId: string, name: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in again." };
  const file = await getOwnedFile(user, fileId);
  if (!file) return { error: "Only the owner can rename this file." };

  const trimmed = name.trim();
  if (!trimmed) return { error: "Name cannot be empty." };
  const base = trimmed.replace(/\.[^/.]+$/, "");
  const nextName = file.extension ? `${base}.${file.extension}` : base;

  if (!isAppwriteConfigured()) {
    await updateLocal((db) => {
      const match = db.files.find((item) => item.$id === fileId);
      if (match) match.name = nextName;
    });
    return { name: nextName };
  }

  try {
    const { databases } = await createAdminClient();
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { name: nextName },
    );
    return { name: nextName };
  } catch (error) {
    return { error: errorMessage(error, "Could not rename the file.") };
  }
}

export async function shareFile(fileId: string, emailInput: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in again." };
  const file = await getOwnedFile(user, fileId);
  if (!file) return { error: "Only the owner can share this file." };

  const email = emailInput.trim().toLowerCase();
  if (!isEmail(email)) return { error: "Enter a valid email address." };
  if (email === user.email) return { error: "You already own this file." };
  if (file.users.includes(email)) return { error: "That person already has access." };

  const users = [...file.users, email];
  return updateUsers(fileId, users);
}

export async function unshareFile(fileId: string, emailInput: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in again." };
  const file = await getOwnedFile(user, fileId);
  if (!file) return { error: "Only the owner can change sharing." };
  const email = emailInput.trim().toLowerCase();
  return updateUsers(
    fileId,
    file.users.filter((item) => item !== email),
  );
}

async function updateUsers(fileId: string, users: string[]) {
  if (!isAppwriteConfigured()) {
    await updateLocal((db) => {
      const match = db.files.find((item) => item.$id === fileId);
      if (match) match.users = users;
    });
    return { users };
  }

  try {
    const { databases } = await createAdminClient();
    const usersAttribute = (await fileAttributes()).find((attribute) => attribute.key === "users");
    if (usersAttribute?.type === "relationship") {
      return { error: "This files collection links users as a relationship, so sharing by email is not available." };
    }
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { users },
    );
    return { users };
  } catch (error) {
    return { error: errorMessage(error, "Could not update sharing.") };
  }
}

export async function deleteFile(fileId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in again." };
  const file = await getOwnedFile(user, fileId);
  if (!file) return { error: "Only the owner can delete this file." };

  if (!isAppwriteConfigured()) {
    await updateLocal((db) => {
      db.files = db.files.filter((item) => item.$id !== fileId);
    });
    await removeBlob(file.bucketFileId);
    return { deleted: true };
  }

  try {
    const { databases, storage } = await createAdminClient();
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );
    await storage.deleteFile(appwriteConfig.bucketId, file.bucketFileId);
    return { deleted: true };
  } catch (error) {
    return { error: errorMessage(error, "Could not delete the file.") };
  }
}

export async function readSharedBlob(id: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!/^[a-zA-Z0-9-]+$/.test(id)) return null;

  const file = await readLocal((db) =>
    db.files.find(
      (item) =>
        item.bucketFileId === id &&
        (item.owner === user.$id || item.users.includes(user.email)),
    ),
  );
  if (!file) return null;
  const bytes = await readBlob(id);
  return { file, bytes };
}