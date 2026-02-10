import React from "react";
import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      
      {/* LEFT PANEL */}
      <section className="w-1/2 bg-brand p-12 flex flex-col justify-center text-white">
       <div className="mb-8">
         <div className="flex items-center gap-3 mb-6">
           <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
             <span className="text-2xl">📦</span>
           </div>
           <h2 className="text-2xl font-bold">DriveBox</h2>
         </div>
        </div>
        <div className="space-y-5 text-white">
          <h1 className="text-4xl font-bold">Manage Files The Best Way</h1>
          
          <div className="bg-white/10 rounded-2xl p-8 backdrop-blur">
            <div className="w-full h-64 bg-white/5 rounded-xl flex items-center justify-center">
              <span className="text-6xl">☁️</span>
            </div>
          </div>
  
          <p className="text-lg">
            A Place Where You Can Store All Your Documents
          </p>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className="w-1/2 flex items-center justify-center bg-gray-50">
        {children}
      </section>

    </div>
  );
};

export default Layout;