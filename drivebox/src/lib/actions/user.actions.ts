"use server";

import { redirect } from "next/navigation";
import {
  createAccount as createAccountRecord,
  getCurrentUser,
  resendOtp,
  signInAccount,
  signOut,
  verifyOtp,
} from "@/lib/data/drive";

export { getCurrentUser };

export async function createAccount(input: { fullName: string; email: string }) {
  return createAccountRecord(input);
}

export async function signInUser(email: string) {
  return signInAccount(email);
}

export async function verifySecret(accountId: string, password: string) {
  return verifyOtp(accountId, password);
}

export async function sendEmailOTP(email: string) {
  return resendOtp(email);
}

export async function signOutUser() {
  await signOut();
  redirect("/sign-in");
}