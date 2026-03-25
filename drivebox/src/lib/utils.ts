import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parseStringify = (value:unknown)=>{
  return JSON.parse(JSON.stringify(value));

}
import { Client, Account, Databases } from "node-appwrite";
import { cookies } from "next/dist/server/request/cookies";


export const createSessionClient = async () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

  const cookieStore = await cookies();
  const session = cookieStore.get("appwrite-session");

  if (!session || !session.value) {
    throw new Error("No session found");
  }

  client.setSession(session.value); // ⭐ THIS IS IMPORTANT

  return {
    account: new Account(client),
    databases: new Databases(client),
  };
};