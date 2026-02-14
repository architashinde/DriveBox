import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import Search from "./Search";
import FileUploader from "./FileUploader";


const Header = () => {
    return(
        <header className="header">
            <Search />
            <div className="header-wrapper">
                <FileUploader />
                <form>
                    <Button type="submit" className="sign-out-button">
                        <Image src="/logout.png" alt="logo" width={30} height={30} className="w-6" />
                    </Button>
                </form>
            </div>
        </header>
    )
};
export default Header;