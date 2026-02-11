import React from "react";
import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      
      {/* LEFT PANEL */}
      <section className="w-1/2 bg-brand p-12 flex flex-col justify-center text-white">
        <div className="mb-8">
          <Image 
            src="/logoo.png"
            alt="DriveBox Logo" 
            width={60} 
            height={60}
            className="h-auto"
          />
        </div>
        
        <div className="space-y-5 text-white">
          <h1 className="text-4xl font-bold">Manage Files The Best Way</h1>
          
          <div className="bg-white rounded-2xl p-8">
            <Image 
              src="/storage.jpg"
              alt="File storage illustration" 
              width={400}
              height={300}
              className="w-full h-auto rounded-xl"
            />
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