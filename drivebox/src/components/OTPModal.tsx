"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type OTPModalProps = {
  accountId: string;
  email: string;
  demoCode?: string | null;
  onClose: () => void;
  onAccountChange: (accountId: string, demoCode?: string | null) => void;
};

export function OTPModal({
  accountId,
  email,
  demoCode,
  onClose,
  onAccountChange,
}: OTPModalProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (otp.length !== 6) {
      setMessage("Enter all 6 digits.");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, password: otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || "That code did not match.");
      } else {
        window.location.href = "/";
      }
    } catch {
      setMessage("Could not verify the code.");
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || "Could not send a new code.");
      } else {
        if (data.accountId) onAccountChange(data.accountId, data.demoCode);
        setOtp("");
        setMessage("A fresh code is ready.");
      }
    } catch {
      setMessage("Could not send a new code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md border-[#E0D3C2] bg-[#FFFBF6]">
        <AlertDialogHeader>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-ink/60 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <AlertDialogTitle className="font-display text-3xl text-ink">
            Enter the 6-digit code
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-[#5E6A64]">
            Sent for <span className="font-medium text-ink">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {demoCode ? (
          <div className="rounded-2xl border border-dashed border-[#C4622D] bg-[#F3E4D4] px-4 py-3 text-sm text-ink">
            Local mailbox: <span className="font-semibold tracking-[0.3em]">{demoCode}</span>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-5">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup className="w-full justify-between gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot key={index} index={index} className="h-12 w-11 rounded-xl border-[#E0D3C2] text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <Button type="submit" className="h-11 w-full bg-brand text-white hover:bg-brand-100" disabled={isLoading || otp.length !== 6}>
            {isLoading ? "Checking..." : "Open my box"}
          </Button>
        </form>

        <div className="text-center">
          <button type="button" onClick={onResend} disabled={isLoading} className="text-sm font-medium text-brand hover:underline">
            Send another code
          </button>
          {message ? <p className="mt-3 text-sm text-[#5E6A64]">{message}</p> : null}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}