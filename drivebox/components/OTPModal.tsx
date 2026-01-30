"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { verifySecret, sendEmailOTP } from "@/lib/actions/user.actions";

const OtpModal = ({ accountId, email }: { accountId: string; email: string }) => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AlertDialog open>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="h2 text-center">
            Enter Your OTP
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center">
            We sent a code to <span className="text-brand">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* ✅ THIS FORM IS THE FIX */}
        <form
          action={async (formData) => {
            setIsLoading(true);
            formData.set("accountId", accountId);
            await verifySecret(formData);
            router.push("/");
          }}
        >
          <InputOTP maxLength={6} value={password} onChange={setPassword}>
            <InputOTPGroup>
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <input type="hidden" name="password" value={password} />

          <AlertDialogFooter className="mt-4">
            <AlertDialogAction type="submit">
              Submit
              {isLoading && (
                <Image
                  src="/assets/icons/loader.png"
                  alt="loader"
                  width={20}
                  height={20}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>

        <div className="text-center mt-2">
          Didn&apos;t get a code?
          <Button
            variant="link"
            onClick={() => sendEmailOTP({ email })}
          >
            Resend
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OtpModal;
