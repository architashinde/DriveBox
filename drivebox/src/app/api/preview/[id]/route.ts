import { NextResponse } from "next/server";
import { readStoredPreview } from "@/lib/data/drive";

const mimeByExtension: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  txt: "text/plain; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  csv: "text/csv; charset=utf-8",
  json: "application/json",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const result = await readStoredPreview(id);
  if (!result) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const mime = mimeByExtension[result.file.extension.toLowerCase()] || "application/octet-stream";
  const disposition = `${download ? "attachment" : "inline"}; filename="${result.file.name.replace(/"/g, "")}"`;

  return new NextResponse(new Uint8Array(result.bytes), {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": disposition,
      "Cache-Control": "private, no-store",
    },
  });
}