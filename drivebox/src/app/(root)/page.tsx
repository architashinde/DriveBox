import { redirect } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { FileGrid } from "@/components/FileCard";
import { SortSelect } from "@/components/SortSelect";
import { StorageChart } from "@/components/StorageChart";
import { getTotalSpaceUsed, listFiles } from "@/lib/actions/file.action";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { greetingForHour } from "@/lib/utils";
import { Suspense } from "react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; sort?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const params = await searchParams;
  const query = params.query?.trim() || "";
  const sort = params.sort || "$createdAt-desc";
  const [files, usage] = await Promise.all([
    listFiles({ user, search: query, sort, limit: query ? undefined : 8 }),
    getTotalSpaceUsed(user),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Dashboard</p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
            {query ? "Search results" : `${greetingForHour()}, ${user.fullName.split(" ")[0]}`}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {query ? `Files with “${query}” in the name.` : "Recent uploads across every drawer."}
          </p>
        </div>
        <Suspense>
          <SortSelect />
        </Suspense>
      </div>

      {query ? null : <StorageChart usage={usage} />}

      {files.length ? (
        <FileGrid files={files} viewerIds={[user.$id]} />
      ) : (
        <EmptyState
          title={query ? "Nothing matches" : "The box is empty"}
          body={
            query
              ? "Try another name, or clear the search to see everything again."
              : "Upload a document, photo, or clip. It will land in the matching drawer."
          }
        />
      )}
    </div>
  );
}