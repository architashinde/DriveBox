import React from 'react';
import Image from 'next/image';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <section className='bg-brand p-10'>
        <div>
            <Image src="/logo.png" alt="DriveBox logo" width={16} height={16} className="h-auto" />
            <div className="space-y-5 text-white">
              <h1 className='h1'>Manage Files The Best Way</h1>
              <p className='body-1'>A Place Where You Can Store All Your Documents</p>
            </div>
        </div>
      {children}
      </section>    
    </div>
  );
};

export default Layout;