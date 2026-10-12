export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid place-items-center rounded-[28px] border border-dashed border-[#E0D3C2] bg-white/70 px-6 py-16 text-center">
      <svg viewBox="0 0 120 80" className="mb-4 h-20 w-28" aria-hidden="true">
        <rect x="8" y="16" width="70" height="50" rx="10" fill="#F3E4D4" />
        <rect x="34" y="10" width="76" height="52" rx="10" fill="#1C2B27" />
        <path d="M48 32h40M48 42h28" stroke="#F6F1E8" strokeWidth="3" strokeLinecap="round" />
        <circle cx="96" cy="48" r="8" fill="#C4622D" />
      </svg>
      <h2 className="font-display text-3xl text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-[#5E6A64]">{body}</p>
    </div>
  );
}