export const navItems = [
  { name: "Dashboard", url: "/", icon: "layout" },
  { name: "Documents", url: "/documents", icon: "files" },
  { name: "Images", url: "/images", icon: "image" },
  { name: "Media", url: "/media", icon: "clapperboard" },
  { name: "Others", url: "/others", icon: "archive" },
] as const;

export const sortTypes = [
  { label: "Newest first", value: "$createdAt-desc" },
  { label: "Oldest first", value: "$createdAt-asc" },
  { label: "Name (A–Z)", value: "name-asc" },
  { label: "Name (Z–A)", value: "name-desc" },
  { label: "Largest first", value: "size-desc" },
  { label: "Smallest first", value: "size-asc" },
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024;
export const TOTAL_SPACE = 2 * 1024 * 1024 * 1024;

export const categoryMeta = {
  documents: {
    label: "Documents",
    types: ["document"],
    blurb: "PDFs, spreadsheets, slides, and text.",
  },
  images: {
    label: "Images",
    types: ["image"],
    blurb: "Photos, scans, and illustrations.",
  },
  media: {
    label: "Media",
    types: ["video", "audio"],
    blurb: "Video and audio in one shelf.",
  },
  others: {
    label: "Others",
    types: ["other"],
    blurb: "Everything that is not a doc, image, or clip.",
  },
} as const;

export type CategoryKey = keyof typeof categoryMeta;

export const chartColors: Record<CategoryKey, string> = {
  documents: "#1F6F5B",
  images: "#C4622D",
  media: "#D6A24A",
  others: "#3E4C66",
};