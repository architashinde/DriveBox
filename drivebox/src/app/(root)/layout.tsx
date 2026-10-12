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
    <div className="min-h-screen">
      <DemoBanner />
      <div className="flex min-h-screen">
        <Sidebar user={user} />
        <section className="min-w-0 flex-1">
          <MobileNavigation user={user} />
          <Header />
          <div className="main-content">{children}</div>
        </section>
      </div>
    </div>
  );
}