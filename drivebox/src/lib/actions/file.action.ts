"use server";

import { revalidatePath } from "next/cache";
import {
  deleteFile as removeFile,
  getUsage,
  listFiles as queryFiles,
  renameFile as renameStoredFile,
  shareFile as shareStoredFile,
  unshareFile as unshareStoredFile,
  uploadFiles as storeFiles,
} from "@/lib/data/drive";
import type { DriveUser } from "@/types";

function refresh(path: string) {
  revalidatePath(path || "/");
  revalidatePath("/");
}

export async function listFiles(options: {
  user: DriveUser;
  types?: string[];
  search?: string;
  sort?: string;
  limit?: number;
}) {
  return queryFiles(options);
}

export async function getTotalSpaceUsed(user: DriveUser) {
  return getUsage(user);
}

export async function uploadFiles(formData: FormData) {
  const result = await storeFiles(formData);
  if (!result.error) refresh(String(formData.get("path") || "/"));
  return result;
}

export async function renameFile(fileId: string, name: string, path: string) {
  const result = await renameStoredFile(fileId, name);
  if (!("error" in result && result.error)) refresh(path);
  return result;
}

export async function shareFile(fileId: string, email: string, path: string) {
  const result = await shareStoredFile(fileId, email);
  if (!("error" in result && result.error)) refresh(path);
  return result;
}

export async function unshareFile(fileId: string, email: string, path: string) {
  const result = await unshareStoredFile(fileId, email);
  if (!("error" in result && result.error)) refresh(path);
  return result;
}

export async function deleteFile(fileId: string, path: string) {
  const result = await removeFile(fileId);
  if (!("error" in result && result.error)) refresh(path);
  return result;
}