import React from "react";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import MobileNavigation from "../../../components/MobileNavigation";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  let currentUser = null;

  try {
    currentUser = await getCurrentUser();
  } catch (error) {
    currentUser = null; // prevent crash
  }

  if (!currentUser) {
    console.log("no current user");
  }

  return (
    <main className="flex min-h-screen">
      {currentUser && <Sidebar {...currentUser} />}
      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation />
        <Header />
        <div className="main-content">{children}</div>
      </section>
    </main>
  );
};

export default Layout; 