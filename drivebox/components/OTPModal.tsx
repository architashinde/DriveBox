"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { X } from "lucide-react";

const OtpModal = ({ accountId, email }: { accountId: string; email: string }) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setMessage("Please enter a 6-digit code");
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, password: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Failed to verify OTP");
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setMessage("Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Failed to resend OTP");
      } else {
        setMessage("✓ Verification code resent to your email");
      }
    } catch {
      setMessage("Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader className="relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-0 top-0 otp-close-button"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <AlertDialogTitle className="text-2xl font-bold text-center mb-2">
            Enter Your OTP
          </AlertDialogTitle>
          
          <AlertDialogDescription className="text-center text-gray-600">
            We sent a verification code to<br />
            <span className="font-semibold text-brand">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
            >
              <InputOTPGroup className="shad-otp">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="shad-otp-slot"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button 
            type="submit" 
            className="shad-submit-btn w-full" 
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? "Verifying..." : "Submit"}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Didn&apos;t get a code?</p>
          <Button 
            variant="ghost" 
            onClick={onResend} 
            disabled={isLoading}
            className="text-brand hover:text-brand-100"
          >
            Click to resend
          </Button>
        </div>

        {message && (
          <p className={`text-sm text-center ${
            message.startsWith("✓") ? "text-green-600" : "text-red-600"
          }`}>
            {message}
          </p>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OtpModal;
