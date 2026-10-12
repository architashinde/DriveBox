import { ID, Permission, Query, Role } from "node-appwrite";
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
  name: string;
  url: string;
  extension: string;
  size: number;
  type: DriveFile["type"];
  owner: string;
  users?: string[] | null;
  $createdAt: string;
  bucketFileId: string;
}): DriveFile {
  return {
    $id: doc.$id,
    name: doc.name,
    url: doc.url,
    extension: doc.extension,
    size: Number(doc.size) || 0,
    type: doc.type,
    owner: doc.owner,
    users: doc.users ?? [],
    $createdAt: doc.$createdAt,
    bucketFileId: doc.bucketFileId,
  };
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
  const token = await account.createEmailToken(accountId || ID.unique(), email);
  return token.userId;
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
    const { databases } = await createAdminClient();
    const list = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", [identity.$id])],
    );
    const doc = list.documents[0];
    return doc ? mapUser(doc as unknown as DriveUser) : null;
  } catch {
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
    const current = existing.documents[0] as { accountId?: string } | undefined;
    if (!current?.accountId) {
      return { error: "No box exists for that email. Create one first." };
    }
    const accountId = await sendAppwriteOtp(email, current.accountId);
    return { accountId };
  } catch (error) {
    return { error: errorMessage(error, "Could not send a verification code.") };
  }
}

export async function verifyOtp(accountId: string, password: string): Promise<AuthPayload> {
  if (!accountId || password.length !== 6) {
    return { error: "Enter the 6-digit code." };
  }

  if (!isAppwriteConfigured()) {
    const result = await updateLocal((db) => {
      const otp = db.otps.find((item) => item.accountId === accountId && item.code === password);
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
    const session = await account.createSession(accountId, password);
    await setSessionCookie(session.secret);
    return { accountId };
  } catch {
    return { error: "That code is not valid. Request a new one." };
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
  const list = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.filesCollectionId,
    [
      Query.or([
        Query.equal("owner", [user.$id]),
        Query.contains("users", [user.email]),
      ]),
      Query.limit(200),
    ],
  );
  return list.documents.map((doc) => mapFile(doc as unknown as DriveFile));
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
  const ownFiles = files.filter((file) => file.owner === user.$id);
  return summarize(ownFiles);
}

async function getOwnedFile(user: DriveUser, fileId: string) {
  const files = await ownedFiles(user);
  return files.find((file) => file.$id === fileId && file.owner === user.$id) ?? null;
}

export async function uploadFiles(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Sign in again to upload." };

  const incoming = formData
    .getAll("files")
    .filter((item): item is File => item instanceof File && item.size > 0);

  if (!incoming.length) return { error: "Choose at least one file." };

  const usage = await getUsage(user);
  let remaining = usage.total - usage.used;
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

  try {
    const { databases, storage } = await createAdminClient();
    for (const item of prepared) {
      const bucketFileId = ID.unique();
      await storage.createFile(
        appwriteConfig.bucketId,
        bucketFileId,
        InputFile.fromBuffer(item.bytes, item.file.name),
        [Permission.read(Role.any())],
      );
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        {
          type: item.type,
          name: item.file.name,
          url: constructFileUrl(bucketFileId),
          extension: item.extension,
          size: item.file.size,
          owner: user.$id,
          accountId: user.accountId,
          users: [],
          bucketFileId,
        },
      );
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