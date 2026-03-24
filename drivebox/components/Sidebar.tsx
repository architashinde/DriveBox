"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";   
import { navItems } from "../constants";
import { usePathname } from "next/dist/client/components/navigation";
import { cn } from "@/lib/utils";

const Sidebar = () => {
    const pathname = usePathname();
    return(
        <aside className="sidebar flex flex-col h-screen">
            <Link href="/" className="flex items-center gap-3 px-4 py-1">
              <Image
                src="/logoo.svg"
                alt="DriveBox Logo"
                width={32}
                height={32}
                className="h-auto"
              />

             <span className="text-lg font-semibold text-blue-600 hidden lg:block">
               DriveBox
             </span>
            </Link> 

            <nav className="sidebar-nav py-4">
                <ul className="flex flex-1 flex-col gap-6">
                    {navItems.map(({ name, icon, url }) => (
                        <Link key={name} href={url} className="lg:w-full">
                            <li className="sidebar-nav-item">
                                <Image src = {icon} alt={name} width={24} height={24}
                                className={cn("nav-icon", pathname === url && "nav-icon-active")} />
                                <p className="hidden lg:block">{name}</p>
                            </li>
                        </Link>
                    ))}
                </ul>
            </nav>
            <Image src ="/file.svg" alt="logo" width={506} height={418} className="w-full mt-auto"/>

        </aside>
    )
};
export default Sidebar;