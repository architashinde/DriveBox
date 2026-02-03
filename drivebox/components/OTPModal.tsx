"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * NOTE:
 * This is a minimal client-side UI for entering OTP.
 * You must implement server-side API routes (e.g. /api/verify-otp and /api/resend-otp)
 * that call your server functions (verifySecret, sendEmailOTP) securely.
 */

const OtpModal = ({ accountId, email }: { accountId: string; email: string }) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      // POST to your server endpoint that verifies OTP and creates a session.
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, password: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Failed to verify OTP");
      } else {
        // success: redirect or update UI
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
        setMessage("Verification code resent");
      }
    } catch {
      setMessage("Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shad-alert-dialog" role="dialog" aria-modal="true">
      <h2>Enter Your OTP</h2>
      <p>We sent a code to {email}</p>

      <form onSubmit={onSubmit}>
        <div className="shad-otp">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="shad-otp-slot"
            aria-label="OTP"
          />
        </div>

        <Button type="submit" className="shad-submit-btn" disabled={isLoading}>
          Submit
        </Button>
      </form>

      <div>
        <p>Didn&apos;t get a code?</p>
        <Button variant="ghost" onClick={onResend} disabled={isLoading}>
          Resend
        </Button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
};

export default OtpModal;
