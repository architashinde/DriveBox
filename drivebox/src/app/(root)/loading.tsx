export default function Loading() {
  return (
    <div className="space-y-4 py-6">
      <div className="h-8 w-40 animate-pulse rounded-full bg-[#E7DCCB]" />
      <div className="h-16 w-72 animate-pulse rounded-2xl bg-[#E7DCCB]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-56 animate-pulse rounded-3xl bg-[#E7DCCB]" />
        ))}
      </div>
    </div>
  );
}