import Image from "next/image";
import Link from "next/link";
import React from "react";   

const Sidebar = () => {
    return(
        <aside className="sidebar">
            <Link href="/">
            <Image 
            src="/logoo.png" 
            alt="logo" width={50} height={50} className="hidden h-auto lg:block" />
            <Image src ="/logoo.png" alt="logo" width={32} height={32} className="lg:hidden" />
            </Link> 

            <nav className="mt-10">
                <ul className="flex flex-1 flex-col gap-6">
                    {[
                        
                    ]}
                </ul>
            </nav>

        </aside>
    )
};
export default Sidebar;