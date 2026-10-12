import Image from "next/image";
import { FileArchive, FileAudio, FileText, FileVideo, Image as ImageIcon } from "lucide-react";
import { FileActions } from "@/components/FileActions";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import type { DriveFile } from "@/types";

const typeIcon = {
  document: FileText,
  image: ImageIcon,
  video: FileVideo,
  audio: FileAudio,
  other: FileArchive,
};

export function FileCard({ file, viewerId }: { file: DriveFile; viewerId: string }) {
  const Icon = typeIcon[file.type];
  const isOwner = file.owner === viewerId;

  return (
    <article className="flex h-full flex-col rounded-[24px] border border-[#E0D3C2] bg-white shadow-card">
      <div className="relative grid h-36 place-items-center overflow-hidden rounded-t-[24px] bg-[#F6F1E8]">
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
      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-ink" title={file.name}>{file.name}</h3>
          <p className="mt-1 text-xs text-[#8C7B68]">
            {formatDateTime(file.$createdAt)} · {convertFileSize(file.size)}
          </p>
        </div>
        <FileActions file={file} isOwner={isOwner} />
      </div>
    </article>
  );
}

export function FileGrid({ files, viewerId }: { files: DriveFile[]; viewerId: string }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {files.map((file) => (
        <li key={file.$id}>
          <FileCard file={file} viewerId={viewerId} />
        </li>
      ))}
    </ul>
  );
}