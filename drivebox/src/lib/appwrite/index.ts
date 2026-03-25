"use server";
//node-appwrite 
import {appwriteConfig} from "@/lib/appwrite/config";
import { cookies } from "next/headers";
import { Client, Account, Databases, Storage, Avatars } from "node-appwrite";

export const createSessionClient = async () => {
    const client = new Client()
      .setEndpoint(appwriteConfig.endpointUrl)
      .setProject(appwriteConfig.projectId);

      const cookieStore = await cookies();
     const session = cookieStore.get("appwrite-session");

      if (!session?.value) {
      throw new Error("No session found");
      }

      // 🔥 THIS WAS MISSING
      client.setSession(session.value);

  return {
    account: new Account(client),
    databases: new Databases(client),
  };
};

export const createAdminClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)   // NOT NEXT_PUBLIC
    .setProject(appwriteConfig.projectId!)
    .setKey(appwriteConfig.secretKey);        // 🔥 THIS IS REQUIRED
    return {
        get account(){
            return new Account(client);
        },
        get databases(){
            return new Databases(client);
        },
        get storage(){
            return new Storage(client);
        },
        get avatars(){
            return new Avatars(client); 
        }
    };
};