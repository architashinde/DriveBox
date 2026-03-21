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
        <aside className="sidebar">
            <Link href="/">
            <Image 
            src="/logoo.svg" 
            alt="logo" width={50} height={50} className="hidden h-auto lg:block" />
            <Image src ="/logoo.svg" alt="logo" width={32} height={32} className="lg:hidden" />
            </Link> 

            <nav className="sidebar-nav">
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

        </aside>
    )
};
export default Sidebar;