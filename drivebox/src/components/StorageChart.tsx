import { chartColors } from "@/constants";
import { convertFileSize } from "@/lib/utils";
import type { UsageSummary } from "@/types";

export function StorageChart({ usage }: { usage: UsageSummary }) {
  const slices = usage.categories.filter((item) => item.size > 0 && usage.used > 0);
  const stops = slices.reduce<{ cursor: number; parts: string[] }>(
    (acc, item) => {
      const start = acc.cursor;
      const end = start + (item.size / usage.used) * 100;
      return {
        cursor: end,
        parts: [...acc.parts, `${chartColors[item.key]} ${start}% ${end}%`],
      };
    },
    { cursor: 0, parts: [] },
  ).parts;
  const raw = usage.total ? (usage.used / usage.total) * 100 : 0;
  const label = usage.used === 0 ? "0%" : raw < 1 ? "<1%" : `${Math.round(raw)}%`;
  const bar = usage.used === 0 ? 0 : Math.min(100, Math.max(raw, 2));

  return (
    <section className="grid items-center gap-6 rounded-[28px] border border-[#E0D3C2] bg-white p-5 shadow-card lg:grid-cols-[220px_1fr] lg:p-7">
      <div className="mx-auto grid h-44 w-44 place-items-center">
        {stops.length ? (
          <div
            className="grid h-40 w-40 place-items-center rounded-full"
            style={{ background: `conic-gradient(${stops.join(", ")})` }}
          >
            <div className="grid h-26 w-26 place-items-center rounded-full bg-white text-center">
              <div>
                <p className="font-display text-3xl text-ink">{label}</p>
                <p className="text-xs text-[#8C7B68]">of 2 GB</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid h-40 w-40 place-items-center rounded-full border-14 border-dashed border-[#E0D3C2] text-center">
            <div>
              <p className="font-display text-3xl text-ink">0%</p>
              <p className="text-xs text-[#8C7B68]">of 2 GB</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Storage</p>
        <h2 className="mt-2 font-display text-3xl text-ink">{convertFileSize(usage.used)} used</h2>
        <p className="mt-1 text-sm text-[#5E6A64]">{convertFileSize(Math.max(usage.total - usage.used, 0))} still open.</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F3E4D4]">
          <div className="h-full rounded-full bg-brand" style={{ width: `${bar}%` }} />
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {usage.categories.map((item) => (
            <li key={item.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-ink">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: chartColors[item.key] }} />
                {item.label}
              </span>
              <span className="text-[#5E6A64]">{convertFileSize(item.size)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}