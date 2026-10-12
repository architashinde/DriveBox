import { redirect } from "next/navigation";
import { ArchiveArt } from "@/components/ArchiveArt";
import { DemoBanner } from "@/components/DemoBanner";
import { Logo } from "@/components/Logo";
import { getCurrentUser } from "@/lib/actions/user.actions";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="min-h-screen">
      <DemoBanner />
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="bg-ink px-6 py-8 text-[#F6F1E8] lg:px-12 lg:py-12">
          <Logo wordClassName="text-[#F6F1E8]" />
          <div className="mx-auto mt-8 max-w-md lg:mt-16">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D6A24A]">Your shelf</p>
            <h1 className="mt-3 font-display text-4xl leading-tight lg:text-5xl">
              Keep every file in one quiet box.
            </h1>
            <div className="mt-8">
              <ArchiveArt />
            </div>
            <p className="mt-6 max-w-sm text-sm leading-6 text-[#D9CBB8]">
              Upload, sort, rename, and share by email. Documents, pictures, and clips each have a drawer.
            </p>
          </div>
        </section>
        <section className="flex items-center justify-center px-6 py-12">{children}</section>
      </div>
    </div>
  );
}