import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/EmptyState";
import { FileGrid } from "@/components/FileCard";
import { SortSelect } from "@/components/SortSelect";
import { categoryMeta, type CategoryKey } from "@/constants";
import { listFiles } from "@/lib/actions/file.action";
import { getCurrentUser } from "@/lib/actions/user.actions";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ query?: string; sort?: string }>;
}) {
  const { type } = await params;
  if (!(type in categoryMeta)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const meta = categoryMeta[type as CategoryKey];
  const queryParams = await searchParams;
  const query = queryParams.query?.trim() || "";
  const sort = queryParams.sort || "$createdAt-desc";
  const files = await listFiles({
    user,
    types: [...meta.types],
    search: query,
    sort,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Drawer</p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">{meta.label}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {query ? `Matching “${query}”. ` : ""}
            {meta.blurb}
          </p>
        </div>
        <Suspense>
          <SortSelect />
        </Suspense>
      </div>

      {files.length ? (
        <FileGrid files={files} viewerIds={[user.$id, user.accountId]} />
      ) : (
        <EmptyState
          title={query ? "Nothing in this drawer" : `No ${meta.label.toLowerCase()} yet`}
          body="Upload a file and DriveBox will file it here by its type."
        />
      )}
    </div>
  );
}