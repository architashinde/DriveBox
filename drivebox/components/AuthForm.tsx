"use client"

import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import OTPModal from "./OTPModal";
import { createAccount } from "@/lib/actions/user.actions";

const formSchema = z.object({
  fullName: z.string().min(2).max(50).optional(),
  email: z.string().email("Invalid email address"),
});

type AuthFormProps = {
  formType: "sign-in" | "sign-up";
};

const AuthForm = ({ formType }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [emailForOtp, setEmailForOtp] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: "", email: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
       // createAccount is server-side in your codebase; if it's not exposed to client,
       // you should call an API route that wraps createAccount.
       const user = await createAccount({
        fullName: values.fullName || "",
        email: values.email,
      } as { fullName: string; email: string });

      // user should contain accountId per your implementation
      if (user?.accountId) {
        setAccountId(user.accountId);
        setEmailForOtp(values.email);
      } else {
        setErrorMessage("Failed to create an account. Please try again.");
      }
    } catch (err: unknown) {
      setErrorMessage("Failed to create an account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

return (
  <>
    <div className="auth-form bg-white p-8 rounded-xl shadow-lg">
      <h1 className="form-title text-brand">
        {formType === "sign-in" ? "Sign In" : "Sign Up"}
      </h1>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        {formType === "sign-up" && (
          <div className="shad-form-item">
            <label className="shad-form-label" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              {...form.register("fullName")}
              className="shadn-input"
              placeholder="Your full name"
            />
            {form.formState.errors.fullName && (
              <p className="shad-form-message">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>
        )}

        <div className="shad-form-item">
          <label className="shad-form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...form.register("email")}
            className="shadn-input"
            placeholder="you@example.com"
          />
          {form.formState.errors.email && (
            <p className="shad-form-message">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button type="submit" className="form-submit-button" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {formType === "sign-in" ? "Signing In..." : "Signing Up..."}
            </span>
          ) : (
            formType === "sign-in" ? "Sign In" : "Sign Up"
          )}
        </Button>

        {errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}
      </form>

      <div className="mt-6 text-center">
        <p className="body-2 text-gray-600">
          {formType === "sign-in" ? "Don't have an account? " : "Already have an account? "}
          <a 
            href={formType === "sign-in" ? "/sign-up" : "/sign-in"}
            className="text-brand hover:text-brand-100 font-semibold"
          >
            {formType === "sign-in" ? "Sign Up" : "Sign In"}
          </a>
        </p>
      </div>
    </div>

    {accountId && emailForOtp && (
      <OTPModal accountId={accountId} email={emailForOtp} />
    )}
  </>
);
};

export default AuthForm;