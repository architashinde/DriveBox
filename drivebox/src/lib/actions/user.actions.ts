"use server"

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";
import {cookies} from "next/headers"
import { avatarPlaceholderUrl } from "../../../constants";
import { create } from "domain";
import { parse } from "path";

export const getUserByEmail = async (email: string) => {
    const {databases} = await createAdminClient();

    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("email", [email])]
    );

    return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
    console.error(message, error);
    throw error;
};

export const sendEmailOTP = async ({email}: {email: string}) => {
    console.log("SIGN UP FUNCTION HIT");
    const {account} = await createAdminClient();
    try{
        const session = await account.createEmailToken(ID.unique(), email);
        return session.userId;
    }
    catch(error){
        handleError(error, "Failed to send email OTP");
    }
}

type createAccountParams ={
    fullName: string;
    email: string;
};

export const createAccount = async ({
    fullName,
    email,
}:createAccountParams) => {

    const existingUser = await getUserByEmail(email);
    
    const accountId = await sendEmailOTP({email});
    if (!accountId) throw new Error('Failed to send an OTP');
    if (!existingUser) {
        const {databases} = await createAdminClient();
        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: avatarPlaceholderUrl,
                accountId,
            },
        );
    };

    return parseStringify({accountId});

};
export async function verifySecret(formData: FormData) {
  const accountId = formData.get("accountId") as string;
  const password = formData.get("password") as string;

  try {
    const { account } = await createAdminClient();
    const session = await account.createSession(accountId, password);

    const cookieStore = await cookies(); // ⭐ FIXED HERE

    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return parseStringify({ sessionId: session.$id }); // also fixed (see below)
  } catch (error) {
    throw new Error("Failed to verify OTP");
  }
}

export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();
    const result = await account.get();

    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", [result.$id])]
    );

    if (user.total <= 0) return null;

    return user.documents[0];
  } catch (error) {
    return null; // 🔥 prevents redirect loop
  }
};

/* fhewihfuhuh */



