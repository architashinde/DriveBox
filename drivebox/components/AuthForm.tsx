
"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from 'next/link';


const formSchema = z.object({
  fullName: z.string().min(2).max(50).optional(),
  email: z.string().email("Invalid email address"),
})

type AuthFormProps = {
  formType: "sign-in" | "sign-up"
}

const AuthForm = ({ formType }: AuthFormProps) => {
    
   const [isLoading] = useState(false);
   const [errorMessage] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "", email: "",
    },
  })
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values)
  }

  return(
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form space-y-8">
        <h1 className='form-title font-bold'>{formType === "sign-in" ? "Sign In" : "Sign Up"}</h1>
        {formType === "sign-up" && (
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <div className='shad-form-item'>
                  <FormLabel className='shad-form-label'>Full Name</FormLabel>
                </div>
                <FormControl>
                  <Input placeholder="Enter Your Full Name" className='shadn-input' {...field} />
                </FormControl>
                <FormMessage className='shad-form-message' />
              </FormItem>
            )}
          /> 
        )}
        <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className='shad-form-item'>
                  <FormLabel className='shad-form-label'>Email</FormLabel>
                </div>
                <FormControl>
                  <Input placeholder="Enter Your Email ID" className='shadn-input' {...field} />
                </FormControl>
                <FormMessage className='shad-form-message'/>
              </FormItem>
            )}
          />
        <Button type="submit" className='form-submit-button' disabled={isLoading}>{formType === "sign-in" ? "Sign In" : "Sign Up"}
            {isLoading && (
                <Image src="/assets/icons/loader.svg" alt="Loading" width={20} height={20} className='ml-2 animate-spin' />
            )}
        </Button>

        {errorMessage && (
            <p className='error-message'>*{errorMessage}</p>
        )}
        <div className='body-2 flex justify-center'>
            <p className='text-light-100'>
                {formType === "sign-in" ? "Don't have an account? " : "Already have an account? "}
            </p>
            <Link href={formType === "sign-in" ? "/sign-up" : "/sign-in"} className='ml-1 font-medium text-brand'>{formType === "sign-in" ? "Sign Up" : "Sign In"}</Link>
        </div>
      </form>
    </Form>

     {/* Otp verification */}

    </>
  )

};

export default AuthForm;