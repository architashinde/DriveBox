"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { sortTypes } from "@/constants";

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("sort") || "$createdAt-desc";

  return (
    <label className="flex items-center gap-2 text-sm text-[#5E6A64]">
      Sort
      <select
        value={current}
        onChange={(event) => {
          const next = new URLSearchParams(params.toString());
          next.set("sort", event.target.value);
          router.replace(`${pathname}?${next.toString()}`);
        }}
        className="h-10 rounded-full border border-[#E0D3C2] bg-white px-3 text-ink outline-none"
      >
        {sortTypes.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}