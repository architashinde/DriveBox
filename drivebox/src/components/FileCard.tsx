"use client";

import { useState } from "react";
import Image from "next/image";
import { FileArchive, FileAudio, FileText, FileVideo, Image as ImageIcon, X } from "lucide-react";
import { FileActions } from "@/components/FileActions";
import { convertFileSize, formatDateTime, toDownloadUrl } from "@/lib/utils";
import type { DriveFile } from "@/types";

const typeIcon = {
  document: FileText,
  image: ImageIcon,
  video: FileVideo,
  audio: FileAudio,
  other: FileArchive,
};

const textExtensions = new Set(["txt", "md", "csv", "json"]);

export function FileCard({ file, viewerIds }: { file: DriveFile; viewerIds: string[] }) {
  const Icon = typeIcon[file.type];
  const isOwner = viewerIds.some((id) => Boolean(id) && (id === file.owner || file.users.includes(id)));
  const [open, setOpen] = useState(false);

  return (
    <article className="relative flex h-full flex-col rounded-3xl border border-[#E0D3C2] bg-white shadow-card">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-w-0 flex-1 flex-col text-left"
        aria-label={`View ${file.name}`}
      >
        <div className="relative grid h-36 place-items-center overflow-hidden rounded-t-3xl bg-[#F6F1E8]">
          {file.type === "image" ? (
            <Image src={file.url} alt="" fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
          ) : (
            <div className="grid place-items-center text-ink">
              <Icon className="h-10 w-10" />
              <span className="mt-2 text-xs uppercase tracking-[0.16em] text-[#8C7B68]">
                {file.extension || file.type}
              </span>
            </div>
          )}
          {!isOwner ? (
            <span className="absolute left-3 top-3 rounded-full bg-ink px-2 py-1 text-[11px] text-[#F6F1E8]">
              Shared with you
            </span>
          ) : null}
        </div>
        <div className="min-w-0 p-4 pr-14">
          <h3 className="truncate font-medium text-ink" title={file.name}>{file.name}</h3>
          <p className="mt-1 text-xs text-[#8C7B68]">
            {formatDateTime(file.$createdAt)} · {convertFileSize(file.size)}
          </p>
        </div>
      </button>
      <div className="absolute bottom-3 right-3">
        <FileActions file={file} isOwner={isOwner} />
      </div>
      {open ? <FileViewer file={file} onClose={() => setOpen(false)} /> : null}
    </article>
  );
}

function FileViewer({ file, onClose }: { file: DriveFile; onClose: () => void }) {
  const extension = file.extension.toLowerCase();
  const previewable = file.type === "image" || file.type === "video" || file.type === "audio" || extension === "pdf" || textExtensions.has(extension);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#1C2B27]/60 p-4" onClick={onClose}>
      <div
        className="flex h-[min(90vh,860px)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#FFFBF6] shadow-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={file.name}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#E0D3C2] px-5 py-4">
          <h2 className="truncate font-display text-2xl text-ink">{file.name}</h2>
          <div className="flex shrink-0 items-center gap-3">
            <a href={toDownloadUrl(file.url)} className="text-sm font-medium text-brand">
              Download
            </a>
            <button type="button" onClick={onClose} aria-label="Close preview" className="text-ink/70">
              <X />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 bg-[#F6F1E8]">
          {file.type === "image" ? (
            <div className="relative h-full w-full">
              <Image src={file.url} alt={file.name} fill unoptimized className="object-contain" />
            </div>
          ) : null}
          {extension === "pdf" || textExtensions.has(extension) ? (
            <iframe title={file.name} src={file.url} className="h-full w-full bg-white" />
          ) : null}
          {file.type === "video" ? (
            <video src={file.url} controls className="h-full w-full bg-black" />
          ) : null}
          {file.type === "audio" ? (
            <div className="grid h-full place-items-center px-6">
              <audio src={file.url} controls className="w-full max-w-lg" />
            </div>
          ) : null}
          {previewable ? null : (
            <div className="grid h-full place-items-center px-6 text-center">
              <div>
                <p className="font-display text-3xl text-ink">This file opens after download.</p>
                <p className="mt-2 text-sm text-muted-foreground">Word, Excel, and PowerPoint files stay in the box, then open in their own app.</p>
                <a href={toDownloadUrl(file.url)} className="mt-5 inline-block rounded-full bg-ink px-5 py-3 text-sm text-white">
                  Download {file.name}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FileGrid({ files, viewerIds }: { files: DriveFile[]; viewerIds: string[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {files.map((file) => (
        <li key={file.$id}>
          <FileCard file={file} viewerIds={viewerIds} />
        </li>
      ))}
    </ul>
  );
}