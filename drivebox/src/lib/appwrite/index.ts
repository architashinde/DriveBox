import { Account, Avatars, Client, Databases, Storage } from "node-appwrite";
import { cookies } from "next/headers";
import { appwriteConfig } from "@/lib/appwrite/config";

export const SESSION_COOKIE = "appwrite-session";

const sessionCookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
};

export async function setSessionCookie(secret: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, secret, sessionCookieOptions);
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function readSessionSecret() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId);

  const secret = await readSessionSecret();
  if (!secret) throw new Error("No session found");
  client.setSession(secret);

  return {
    account: new Account(client),
    databases: new Databases(client),
  };
}

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId)
    .setKey(appwriteConfig.secretKey);

  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    avatars: new Avatars(client),
  };
}