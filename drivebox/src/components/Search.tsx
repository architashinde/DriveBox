"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";

export function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const paramsRef = useRef(params);
  const [value, setValue] = useState(params.get("query") ?? "");

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = new URLSearchParams(paramsRef.current.toString());
      const current = next.get("query") ?? "";
      if (current === value) return;
      if (value) next.set("query", value);
      else next.delete("query");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 300);
    return () => clearTimeout(handle);
  }, [pathname, router, value]);

  return (
    <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full border border-[#E0D3C2] bg-white px-4">
      <SearchIcon className="h-4 w-4 text-[#8C7B68]" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search files by name"
        className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-[#8C7B68]"
      />
    </label>
  );
}