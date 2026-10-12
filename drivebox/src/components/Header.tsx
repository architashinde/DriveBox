import { LogOut } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import { Search } from "@/components/Search";
import { Button } from "@/components/ui/button";
import { signOutUser } from "@/lib/actions/user.actions";
import { Suspense } from "react";

export function Header() {
  return (
    <header className="header">
      <Suspense fallback={<div className="h-12 flex-1 rounded-full bg-white" />}>
        <Search />
      </Suspense>
      <div className="flex items-center gap-3">
        <FileUploader />
        <form action={signOutUser}>
          <Button type="submit" variant="outline" className="h-12 w-12 rounded-full border-[#E0D3C2] bg-white" aria-label="Sign out">
            <LogOut />
          </Button>
        </form>
      </div>
    </header>
  );
}




