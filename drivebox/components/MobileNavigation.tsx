'use client';
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
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
import { avatarPlaceholderUrl, navItems } from "../constants";
import Link from "next/dist/client/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FileUploader from "./FileUploader";
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
                <Separator className="mb-4 bg-light-200/20"  /> 
             </SheetTitle>
             <nav className="mobile-nav">
              <ul className="mobile-nav-list">
                {navItems.map(({ name, icon, url }) => (
                        <Link key={name} href={url} className="lg:w-full">
                            <li className="sidebar-nav-item">
                                <Image src = {icon} alt={name} width={24} height={24}
                                className={cn("mobile-nav-item", pathname === url && "nav-icon-active")} />
                                <p>{name}</p>
                            </li>
                        </Link>
                    ))}
              </ul>
             </nav>
             <Separator className="my-5 bg-light-200/20"/>
             <div className="flex flex-col justify-between gap-5 pb-5">
              <FileUploader />
                  <Button type="submit" className="mobile-sign-out-button" onClick={() => {}}>
                        <Image src="/logoutt.svg" alt="logo" width={30} height={30} />
                        <p>Logout</p>
                  </Button>
             </div>
         </SheetContent>
       </Sheet>
    </header>
};
export default MobileNavigation;