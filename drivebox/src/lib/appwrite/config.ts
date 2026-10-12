export const appwriteConfig = {
  endpointUrl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT || "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE || "",
  usersCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_USERS ||
    process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION ||
    "",
  filesCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_FILES ||
    process.env.NEXT_PUBLIC_APPWRITE_FILES_COLLECTION ||
    "",
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET || "",
  secretKey: process.env.NEXT_APPWRITE_KEY || "",
};

export const isAppwriteConfigured = () =>
  Boolean(
    appwriteConfig.endpointUrl &&
      appwriteConfig.projectId &&
      appwriteConfig.databaseId &&
      appwriteConfig.usersCollectionId &&
      appwriteConfig.filesCollectionId &&
      appwriteConfig.bucketId &&
      appwriteConfig.secretKey,
  );

export const constructFileUrl = (bucketFileId: string) =>
  `${appwriteConfig.endpointUrl}/storage/buckets/${appwriteConfig.bucketId}/files/${bucketFileId}/view?project=${appwriteConfig.projectId}`;

export const constructDownloadUrl = (bucketFileId: string) =>
  `${appwriteConfig.endpointUrl}/storage/buckets/${appwriteConfig.bucketId}/files/${bucketFileId}/download?project=${appwriteConfig.projectId}`;