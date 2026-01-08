import React from "react";
import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <section className="bg-brand p-10 ">
        <div>
          <Image
            src="/favicon.ico"
            alt="DriveBox Logo"
            width={100}
            height={100}
          />
          <div className="space-y-5 text-white">
            <h1 className="h1">Manage FILES in the best way</h1>
            <p className="body-1">A place where you can store and manage your files efficiently.</p>
          </div>
        </div>
      </section>

      {children}
    </div>
  );
};

export default Layout;
