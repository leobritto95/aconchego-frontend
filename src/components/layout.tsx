import { ReactNode } from "react";
import { BottomMenu } from "./bottom-menu";
import { SideMenu } from "./side-menu";
import { UserProfile } from "./user-profile";
import logo from "../assets/logo.png";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen bg-zinc-100 flex flex-col overflow-hidden">
      <SideMenu />
      <div className="md:ml-64 flex flex-col flex-1 min-h-0">
        <header className="bg-white shadow-sm flex-shrink-0 md:shadow-md border-b-2 border-gray-300 md:border-b md:border-gray-200 relative z-40">
          <div className="flex items-center h-20 px-4 relative">
            <div className="md:hidden">
              <img 
                src={logo} 
                alt="Aconchego" 
                className="h-20 w-auto object-contain"
              />
            </div>
            <div className="w-full flex justify-end">
              <UserProfile />
            </div>
          </div>
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto bg-zinc-100 md:bg-zinc-100">
          <div className="flex flex-col p-0 pt-0 pb-[72px] md:p-4 md:pt-6 md:pb-4 h-full">
            {children}
          </div>
        </main>
      </div>
      <BottomMenu />
    </div>
  );
}
