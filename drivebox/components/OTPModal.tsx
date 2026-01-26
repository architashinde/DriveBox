import React, { useState } from 'react';
import Image from "next/image";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog" 
import { Button } from '@/components/ui/button';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"  
import { email } from 'zod';

const OtpModal = () => {

    const [isOpen,setIsOpen] = useState(true);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e:React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsLoading(true);


        try{

        }catch(error){
            console.log("Failed to verify OTP",error);
        }
        setIsLoading(false);
    };

    const handleResendOtp = async () => {

    };
    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
  <AlertDialogContent className='shad-alert-dialog'>
    <AlertDialogHeader className='relative flex justify-center-safe-center'>
      <AlertDialogTitle className='h2 text-center'>Enter Your OTP
        <Image 
        src="/close.png" 
        alt="close" 
        width={20} 
        height={20} 
        onClick={() => setIsOpen(false)} 
        className="otp-close-button"/>
      </AlertDialogTitle>
      <AlertDialogDescription className='subtitle-2 text-center text-light-100'>
        We have sent a code <span>{email}</span>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>



    )
};



export default OtpModal;