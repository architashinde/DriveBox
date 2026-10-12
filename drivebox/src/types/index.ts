export type DriveUser = {
  $id: string;
  fullName: string;
  email: string;
  avatar: string;
  accountId: string;
};

export type DriveFile = {
  $id: string;
  name: string;
  url: string;
  extension: string;
  size: number;
  type: "document" | "image" | "video" | "audio" | "other";
  owner: string;
  users: string[];
  $createdAt: string;
  bucketFileId: string;
};

export type UsageCategory = {
  key: "documents" | "images" | "media" | "others";
  label: string;
  size: number;
  latest?: string;
};

export type UsageSummary = {
  used: number;
  total: number;
  categories: UsageCategory[];
};

export type AuthPayload = {
  accountId?: string;
  demoCode?: string;
  error?: string;
};