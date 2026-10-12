import { randomInt, randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { DriveFile, DriveUser } from "../../types";

type OtpRecord = {
  email: string;
  accountId: string;
  code: string;
  expiresAt: number;
};

type SessionRecord = {
  secret: string;
  accountId: string;
};

type DatabaseShape = {
  users: DriveUser[];
  files: DriveFile[];
  otps: OtpRecord[];
  sessions: SessionRecord[];
};

const root = path.join(process.cwd(), ".data");
const dbPath = path.join(root, "db.json");
const blobRoot = path.join(root, "blobs");

const emptyDb = (): DatabaseShape => ({
  users: [],
  files: [],
  otps: [],
  sessions: [],
});

let queue: Promise<unknown> = Promise.resolve();

async function ensure() {
  await mkdir(blobRoot, { recursive: true });
  try {
    await readFile(dbPath, "utf8");
  } catch {
    await writeFile(dbPath, JSON.stringify(emptyDb(), null, 2));
  }
}

async function load(): Promise<DatabaseShape> {
  await ensure();
  const raw = await readFile(dbPath, "utf8");
  return { ...emptyDb(), ...JSON.parse(raw) };
}

async function save(db: DatabaseShape) {
  await writeFile(dbPath, JSON.stringify(db, null, 2));
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function updateLocal<T>(fn: (db: DatabaseShape) => Promise<T> | T) {
  return enqueue(async () => {
    const db = await load();
    const result = await fn(db);
    await save(db);
    return result;
  });
}

export function readLocal<T>(fn: (db: DatabaseShape) => Promise<T> | T) {
  return enqueue(async () => {
    const db = await load();
    return fn(db);
  });
}

export function createId() {
  return randomUUID();
}

export function createOtpCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function blobPath(id: string) {
  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    throw new Error("Invalid file id");
  }
  return path.join(blobRoot, id);
}

export async function writeBlob(id: string, bytes: Buffer) {
  await ensure();
  await writeFile(blobPath(id), bytes);
}

export async function readBlob(id: string) {
  return readFile(blobPath(id));
}

export async function removeBlob(id: string) {
  const { rm } = await import("fs/promises");
  await rm(blobPath(id), { force: true });
}