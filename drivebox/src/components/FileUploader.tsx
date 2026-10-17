"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { convertFileSize } from "@/lib/utils";
import { MAX_FILE_SIZE } from "@/constants";

export function FileUploader({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [picked, setPicked] = useState<File[]>([]);

  const dropzone = useDropzone({
    multiple: true,
    maxSize: MAX_FILE_SIZE,
    onDrop: (accepted, rejected) => {
      setMessage(rejected.length ? "Skipped files larger than 50 MB." : null);
      setPicked(accepted);
    },
  });

  const close = () => {
    if (isUploading) return;
    setOpen(false);
    setPicked([]);
    setMessage(null);
  };

  const submit = async () => {
    if (!picked.length) {
      setMessage("Choose at least one file.");
      return;
    }
    setIsUploading(true);
    setMessage(null);
    const formData = new FormData();
    picked.forEach((file) => formData.append("files", file));
    formData.set("path", pathname);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(90_000),
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok || result?.error) {
        setMessage(
          result?.error ||
            (response.status === 413
              ? "That file is too large to send in one request."
              : "That file did not finish uploading. Try it once more."),
        );
        return;
      }
      setOpen(false);
      setPicked([]);
      router.refresh();
    } catch {
      setMessage("That file did not finish uploading. Try it once more.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} className={`h-12 rounded-full bg-brand px-5 text-white hover:bg-brand-100 ${className}`}>
        <Upload className="h-4 w-4" />
        Upload
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1C2B27]/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#FFFBF6] p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl text-ink">Add to the box</h2>
                <p className="mt-1 text-sm text-muted-foreground">Up to 50 MB each. 2 GB total.</p>
              </div>
              <button type="button" onClick={close} aria-label="Close upload" className="text-ink/60">
                <X />
              </button>
            </div>

            <div
              {...dropzone.getRootProps()}
              className={`mt-5 cursor-pointer rounded-2xl border-2 border-dashed px-4 py-10 text-center ${
                dropzone.isDragActive ? "border-brand bg-accent" : "border-[#E0D3C2] bg-white"
              }`}
            >
              <input {...dropzone.getInputProps()} />
              <p className="font-medium text-ink">Drop files here, or click to browse</p>
              <p className="mt-1 text-sm text-[#8C7B68]">Documents, images, video, audio, and the rest.</p>
            </div>

            {picked.length ? (
              <ul className="mt-4 max-h-40 space-y-2 overflow-auto text-sm">
                {picked.map((file) => (
                  <li key={`${file.name}-${file.size}`} className="flex justify-between gap-3 rounded-xl bg-[#F6F1E8] px-3 py-2">
                    <span className="truncate">{file.name}</span>
                    <span className="shrink-0 text-muted-foreground">{convertFileSize(file.size)}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {message ? <p className="mt-3 text-sm text-destructive">{message}</p> : null}

            <Button type="button" onClick={submit} disabled={isUploading} className="mt-5 h-11 w-full bg-ink text-white hover:bg-ink/90">
              {isUploading ? "Uploading..." : "Save to DriveBox"}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}