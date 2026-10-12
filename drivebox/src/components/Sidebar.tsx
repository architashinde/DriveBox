"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, Clapperboard, Files, ImageIcon, LayoutDashboard, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { navItems } from "@/constants";
import { cn } from "@/lib/utils";
import type { DriveUser } from "@/types";

const icons: Record<string, LucideIcon> = {
  layout: LayoutDashboard,
  files: Files,
  image: ImageIcon,
  clapperboard: Clapperboard,
  archive: Archive,
};

export function Sidebar({ user }: { user: DriveUser }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="px-2">
        <Logo wordClassName="hidden text-[#F6F1E8] lg:inline" />
      </Link>

      <nav className="mt-8">
        <ul className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = icons[item.icon];
            const active = pathname === item.url;
            return (
              <li key={item.name}>
                <Link
                  href={item.url}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-[#D9CBB8] transition hover:bg-white/10 hover:text-white",
                    active && "bg-[#C4622D] text-white",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto hidden rounded-2xl bg-white/10 p-4 lg:block">
        <p className="font-display text-lg text-[#F6F1E8]">Two gigabytes, neatly shelved.</p>
        <p className="mt-1 text-xs leading-5 text-[#D9CBB8]">Documents, pictures, and clips stay in their own drawers.</p>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Image src={user.avatar} alt="" width={44} height={44} unoptimized className="h-11 w-11 rounded-full bg-[#F3E4D4] object-cover" />
        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-sm font-medium capitalize text-[#F6F1E8]">{user.fullName}</p>
          <p className="truncate text-xs text-[#D9CBB8]">{user.email}</p>
        </div>
      </div>
    </aside>
  );
}