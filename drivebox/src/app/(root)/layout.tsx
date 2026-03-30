import React from "react";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import MobileNavigation from "../../../components/MobileNavigation";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser;

  if (!currentUser) {
    redirect("/login");
  }


  return (
    <main className="flex min-h-screen">
      <Sidebar fullName={""} avatar={""} email={""} {...currentUser} />
      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation {...currentUser}/>
        <Header />
        <div className="main-content">{children}</div>
      </section>
    </main>
  );
};

export default Layout; 