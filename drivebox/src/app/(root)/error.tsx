"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-[#E0D3C2] bg-white p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A33B32]">Something stalled</p>
      <h1 className="mt-2 font-display text-4xl text-ink">The box did not open.</h1>
      <p className="mt-3 max-w-lg text-sm text-[#5E6A64]">
        {error.message || "Try again. If Appwrite keys are set, confirm the database and bucket ids."}
      </p>
      <button type="button" onClick={reset} className="mt-6 rounded-full bg-ink px-5 py-3 text-sm text-white">
        Try again
      </button>
    </div>
  );
}