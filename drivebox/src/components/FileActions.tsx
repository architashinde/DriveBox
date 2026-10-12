"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Download, Info, MoreHorizontal, Pencil, Share2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteFile, renameFile, shareFile, unshareFile } from "@/lib/actions/file.action";
import { convertFileSize, formatDateTime, toDownloadUrl } from "@/lib/utils";
import type { DriveFile } from "@/types";

type Panel = "menu" | "rename" | "share" | "details" | null;

export function FileActions({ file, isOwner }: { file: DriveFile; isOwner: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>(null);
  const [name, setName] = useState(file.name);
  const [email, setEmail] = useState("");
  const [people, setPeople] = useState(file.users);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const refresh = () => router.refresh();

  useEffect(() => {
    if (panel !== "menu") return;
    const close = () => setPanel(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [panel]);

  const saveName = async () => {
    setBusy(true);
    setMessage(null);
    const result = await renameFile(file.$id, name, pathname);
    setBusy(false);
    if ("error" in result && result.error) {
      setMessage(result.error);
      return;
    }
    setPanel(null);
    refresh();
  };

  const addPerson = async () => {
    setBusy(true);
    setMessage(null);
    const result = await shareFile(file.$id, email, pathname);
    setBusy(false);
    if ("error" in result && result.error) {
      setMessage(result.error);
      return;
    }
    if ("users" in result && result.users) setPeople(result.users);
    setEmail("");
    refresh();
  };

  const removePerson = async (person: string) => {
    const result = await unshareFile(file.$id, person, pathname);
    if ("error" in result && result.error) {
      setMessage(result.error);
      return;
    }
    if ("users" in result && result.users) setPeople(result.users);
    refresh();
  };

  const remove = async () => {
    setBusy(true);
    const result = await deleteFile(file.$id, pathname);
    setBusy(false);
    if ("error" in result && result.error) {
      setMessage(result.error);
      setConfirmDelete(false);
      return;
    }
    setConfirmDelete(false);
    refresh();
  };

  return (
    <div className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        aria-label={`Actions for ${file.name}`}
        onClick={() => {
          setPanel(panel === "menu" ? null : "menu");
          setMessage(null);
        }}
        className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#F3E4D4]"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {panel === "menu" ? (
        <div className="absolute right-0 z-20 mt-1 w-44 rounded-2xl border border-[#E0D3C2] bg-white p-1 shadow-card">
          {isOwner ? (
            <MenuButton icon={<Pencil className="h-4 w-4" />} label="Rename" onClick={() => setPanel("rename")} />
          ) : null}
          <MenuButton icon={<Info className="h-4 w-4" />} label="Details" onClick={() => setPanel("details")} />
          {isOwner ? (
            <MenuButton icon={<Share2 className="h-4 w-4" />} label="Share" onClick={() => setPanel("share")} />
          ) : null}
          <a href={toDownloadUrl(file.url)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-[#F6F1E8]">
            <Download className="h-4 w-4" />
            Download
          </a>
          {isOwner ? (
            <MenuButton icon={<Trash2 className="h-4 w-4" />} label="Delete" onClick={() => { setPanel(null); setConfirmDelete(true); }} danger />
          ) : null}
        </div>
      ) : null}

      {panel && panel !== "menu" ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#1C2B27]/40 p-4" onClick={() => setPanel(null)}>
          <div className="w-full max-w-md rounded-3xl bg-[#FFFBF6] p-6" onClick={(event) => event.stopPropagation()}>
            {panel === "rename" ? (
              <>
                <h3 className="font-display text-3xl text-ink">Rename</h3>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-4 h-12 w-full rounded-2xl border border-[#E0D3C2] bg-white px-4 outline-none"
                />
                <DialogActions busy={busy} label="Save name" onCancel={() => setPanel(null)} onSave={saveName} />
              </>
            ) : null}

            {panel === "share" ? (
              <>
                <h3 className="font-display text-3xl text-ink">Share</h3>
                <p className="mt-1 text-sm text-[#5E6A64]">Anyone with this email can open the file after they sign in.</p>
                <div className="mt-4 flex gap-2">
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@email.com"
                    className="h-12 flex-1 rounded-2xl border border-[#E0D3C2] bg-white px-4 outline-none"
                  />
                  <button type="button" onClick={addPerson} disabled={busy} className="rounded-full bg-brand px-4 text-sm text-white">
                    Add
                  </button>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {people.length ? people.map((person) => (
                    <li key={person} className="flex items-center justify-between rounded-xl bg-[#F6F1E8] px-3 py-2">
                      {person}
                      <button type="button" onClick={() => removePerson(person)} className="text-[#A33B32]">
                        Remove
                      </button>
                    </li>
                  )) : <li className="text-[#8C7B68]">Not shared yet.</li>}
                </ul>
              </>
            ) : null}

            {panel === "details" ? (
              <>
                <h3 className="font-display text-3xl text-ink">Details</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <Detail label="Name" value={file.name} />
                  <Detail label="Type" value={file.type} />
                  <Detail label="Size" value={convertFileSize(file.size)} />
                  <Detail label="Added" value={formatDateTime(file.$createdAt)} />
                  <Detail label="Shared with" value={people.length ? people.join(", ") : "Only you"} />
                </dl>
              </>
            ) : null}

            {message ? <p className="mt-3 text-sm text-[#A33B32]">{message}</p> : null}
            {panel !== "rename" ? (
              <button type="button" onClick={() => setPanel(null)} className="mt-5 text-sm font-medium text-ink">
                Close
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-[#FFFBF6]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-3xl">Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              {file.name} will leave your box. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-[#A33B32] text-white hover:bg-[#8d3129]" disabled={busy}>
              {busy ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-[#F6F1E8] ${danger ? "text-[#A33B32]" : ""}`}
    >
      {icon}
      {label}
    </button>
  );
}

function DialogActions({
  busy,
  label,
  onCancel,
  onSave,
}: {
  busy: boolean;
  label: string;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="mt-5 flex justify-end gap-3">
      <button type="button" onClick={onCancel} className="text-sm text-[#5E6A64]">
        Cancel
      </button>
      <button type="button" onClick={onSave} disabled={busy} className="rounded-full bg-ink px-4 py-2 text-sm text-white">
        {busy ? "Saving..." : label}
      </button>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[#8C7B68]">{label}</dt>
      <dd className="text-right capitalize text-ink">{value}</dd>
    </div>
  );
}