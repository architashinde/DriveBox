import React from "react";
import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      
      {/* LEFT PANEL */}
      <section className="w-1/2 bg-blue-500 p-12 flex flex-col justify-center text-white">
       <div className="mb-8">
         <Image
           src="/logoo.png"
           alt="DriveBox logo"
           width={32}
           height={32}
           className="mb-6"
          />
        </div>
        <div className="space-y-5 text-white">
          <h1 className="text-4xl font-bold">Manage Files The Best Way
          </h1>
          <Image src="/storage.jpg" alt="DriveBox" width={700} height={700} />
  
          <p className="text-lg">
            A Place Where You Can Store All Your Documents
          </p>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className="w-1/2 flex items-center justify-center">
        {children}
      </section>

    </div>
  );
};

export default Layout;
