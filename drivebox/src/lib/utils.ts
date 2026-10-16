import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DriveFile } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseStringify = <T,>(value: T): T => {
  return JSON.parse(JSON.stringify(value));
};

const documentExtensions = ["pdf", "doc", "docx", "txt", "csv", "xls", "xlsx", "ppt", "pptx", "md", "rtf"];
const imageExtensions = ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "heic", "avif"];
const videoExtensions = ["mp4", "avi", "mov", "mkv", "webm", "m4v"];
const audioExtensions = ["mp3", "wav", "ogg", "flac", "m4a", "aac"];

export function getFileType(fileName: string): {
  type: DriveFile["type"];
  extension: string;
} {
  const parts = fileName.split(".");
  const extension = parts.length > 1 ? parts.pop()!.toLowerCase() : "";

  if (documentExtensions.includes(extension)) return { type: "document", extension };
  if (imageExtensions.includes(extension)) return { type: "image", extension };
  if (videoExtensions.includes(extension)) return { type: "video", extension };
  if (audioExtensions.includes(extension)) return { type: "audio", extension };
  return { type: "other", extension };
}

export function convertFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / 1024 ** index;
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

export function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function toDownloadUrl(url: string) {
  if (url.startsWith("/api/blob/") || url.startsWith("/api/preview/")) {
    return url.includes("?") ? `${url}&download=1` : `${url}?download=1`;
  }
  return url.replace("/view?", "/download?").replace("/view", "/download");
}

export function greetingForHour(hour = new Date().getHours()) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}