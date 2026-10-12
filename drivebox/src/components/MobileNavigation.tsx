"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, Clapperboard, Files, ImageIcon, LayoutDashboard, LogOut, Menu, type LucideIcon } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { navItems } from "@/constants";
import { signOutUser } from "@/lib/actions/user.actions";
import { cn } from "@/lib/utils";
import type { DriveUser } from "@/types";

const icons: Record<string, LucideIcon> = {
  layout: LayoutDashboard,
  files: Files,
  image: ImageIcon,
  clapperboard: Clapperboard,
  archive: Archive,
};

export function MobileNavigation({ user }: { user: DriveUser }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="mobile-header">
      <Logo wordClassName="text-ink" />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button type="button" aria-label="Open menu" className="grid h-11 w-11 place-items-center rounded-full border border-[#E0D3C2] bg-white">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-ink text-[#F6F1E8]">
          <SheetTitle className="text-[#F6F1E8]">
            <span className="flex items-center gap-3 pr-8">
              <Image src={user.avatar} alt="" width={44} height={44} unoptimized className="h-11 w-11 rounded-full" />
              <span className="min-w-0 text-left">
                <span className="block truncate text-base capitalize">{user.fullName}</span>
                <span className="block truncate text-xs font-normal text-[#D9CBB8]">{user.email}</span>
              </span>
            </span>
          </SheetTitle>
          <nav className="mt-8">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = icons[item.icon];
                const active = pathname === item.url;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.url}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-3 text-[#D9CBB8]",
                        active && "bg-[#C4622D] text-white",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-8 flex flex-col gap-3">
            <FileUploader className="w-full" />
            <form action={signOutUser}>
              <Button type="submit" variant="outline" className="h-12 w-full rounded-full border-white/20 bg-transparent text-[#F6F1E8]">
                <LogOut />
                Sign out
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}