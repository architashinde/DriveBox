import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">404</p>
        <h1 className="mt-3 font-display text-5xl text-ink">That drawer does not exist.</h1>
        <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-5 py-3 text-sm text-white">
          Back to the dashboard
        </Link>
      </div>
    </div>
  );
}