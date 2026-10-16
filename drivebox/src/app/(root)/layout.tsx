import { redirect } from "next/navigation";
import { DemoBanner } from "@/components/DemoBanner";
import { Header } from "@/components/Header";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Sidebar } from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/actions/user.actions";

export const dynamic = "force-dynamic";

export default async function RootAppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex h-dvh flex-col">
      <DemoBanner />
      <div className="flex min-h-0 flex-1">
        <Sidebar user={user} />
        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <MobileNavigation user={user} />
          <Header />
          <div className="main-content">{children}</div>
        </section>
      </div>
    </div>
  );
}