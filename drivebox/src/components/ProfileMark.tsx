export function ProfileMark({ name, email }: { name?: string; email?: string }) {
  const source = (name || email || "?").trim();
  const initials = source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

  return (
    <span
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F6F1E8] text-sm font-semibold tracking-wide text-[#1C2B27] ring-2 ring-[#C4622D]"
      aria-label={source === "?" ? "Your profile" : source}
      title={source === "?" ? "Your profile" : source}
    >
      {initials}
    </span>
  );
}