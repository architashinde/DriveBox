"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OTPModal } from "@/components/OTPModal";
import { createAccount, signInUser } from "@/lib/actions/user.actions";

const schema = z.object({
  fullName: z.string().optional(),
  email: z.string().email("Enter a valid email address."),
});

type FormValues = z.infer<typeof schema>;

export function AuthForm({ formType }: { formType: "sign-in" | "sign-up" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [emailForOtp, setEmailForOtp] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    if (formType === "sign-up" && (values.fullName || "").trim().length < 2) {
      form.setError("fullName", { message: "Enter your full name." });
      setIsLoading(false);
      return;
    }

    const result =
      formType === "sign-up"
        ? await createAccount({
            fullName: values.fullName || "",
            email: values.email,
          })
        : await signInUser(values.email);

    if (result.error || !result.accountId) {
      setErrorMessage(result.error || "Could not continue. Try again.");
      setIsLoading(false);
      return;
    }

    setAccountId(result.accountId);
    setDemoCode(result.demoCode ?? null);
    setEmailForOtp(values.email.trim().toLowerCase());
    setIsLoading(false);
  };

  const title = formType === "sign-in" ? "Welcome back" : "Open a DriveBox";
  const lead =
    formType === "sign-in"
      ? "We will email a 6-digit code. No password to remember."
      : "Create the box, then confirm it with a one-time code.";

  return (
    <>
      <div className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Account</p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">{title}</h1>
        <p className="mt-3 text-[#5E6A64]">{lead}</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          {formType === "sign-up" ? (
            <label className="block space-y-2 text-sm font-medium text-ink">
              Full name
              <Input placeholder="Archita Shinde" {...form.register("fullName")} />
              {form.formState.errors.fullName ? (
                <span className="block text-xs font-normal text-[#A33B32]">
                  {form.formState.errors.fullName.message}
                </span>
              ) : null}
            </label>
          ) : null}

          <label className="block space-y-2 text-sm font-medium text-ink">
            Email
            <Input type="email" placeholder="you@studio.com" {...form.register("email")} />
            {form.formState.errors.email ? (
              <span className="block text-xs font-normal text-[#A33B32]">
                {form.formState.errors.email.message}
              </span>
            ) : null}
          </label>

          <Button type="submit" className="h-12 w-full bg-brand text-white hover:bg-brand-100" disabled={isLoading}>
            {isLoading ? "Sending code..." : formType === "sign-in" ? "Send sign-in code" : "Create my box"}
          </Button>

          {errorMessage ? (
            <p className="rounded-xl bg-[#F8E6E2] px-3 py-2 text-sm text-[#A33B32]">{errorMessage}</p>
          ) : null}
        </form>

        <p className="mt-6 text-sm text-[#5E6A64]">
          {formType === "sign-in" ? "New here?" : "Already have a box?"}{" "}
          <Link href={formType === "sign-in" ? "/sign-up" : "/sign-in"} className="font-semibold text-brand">
            {formType === "sign-in" ? "Create one" : "Sign in"}
          </Link>
        </p>
      </div>

      {accountId && emailForOtp ? (
        <OTPModal
          accountId={accountId}
          email={emailForOtp}
          demoCode={demoCode}
          onClose={() => setAccountId(null)}
          onAccountChange={(nextId, nextCode) => {
            setAccountId(nextId);
            setDemoCode(nextCode ?? null);
          }}
        />
      ) : null}
    </>
  );
}