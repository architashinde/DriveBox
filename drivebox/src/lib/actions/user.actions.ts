

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";
import { string } from "zod";

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
                avatar:"https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg",
                accountId,
            },
        );
    };

    return parseStringify({accountId});

};

export const verifySecret = async({ accountId, password }: { accountId: string; password: string; }) => {
    try{
        const {account} = await createAdminClient();
        const session = await account.createSession(accountId,password);
        (await cookies()).set('appwrite-session', session.secret, {path:'/', httpOnly:true, sameSite:'strict', secure:true})
        return parseStringify({sessionId:session.$id});
    } catch(error){
        handleError(error, "Failed to verify OTP")
    }
    

};




function cookies() {
    throw new Error("Function not implemented.");
}

