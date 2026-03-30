'use client';
import React, { useState } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { usePathname } from "next/dist/client/components/navigation";
import { avatarPlaceholderUrl } from "../constants";
const MobileNavigation = ({ownerId, accountId, fullName, avatar, email}:{ownerId: string; accountId: string; fullName: string; avatar: string; email: string}) => {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    return<header className="mobile-header flex items-center justify-between px-5">
        <Image src = "/logoo.svg" alt="DriveBox Logo" width={32} height={32} className="h-auto" />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>
            <Image src = "/menu.svg" alt="Menu Icon" width={30} height={30} className="h-auto" />
          </SheetTrigger>
          <SheetContent className="shad-sheet h-screen px-3">
             <SheetTitle>
                <div className="header-user">
                    <Image src={avatar || avatarPlaceholderUrl} alt="User Avatar" width={44} height={44} className="h-auto rounded-full" />
                </div>
                <div className="sm:hidenn lg:block ">
                    <p className="subtitle-2 capitalize">{fullName}</p>
                    <p className="caption">{email}</p>

                </div>
             </SheetTitle>
             <SheetDescription>This action cannot be undone.</SheetDescription>
         </SheetContent>
       </Sheet>
    </header>
};
export default MobileNavigation;