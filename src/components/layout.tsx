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
    <div className="min-h-screen bg-zinc-100">
      <SideMenu />
      <div className="md:ml-64">
        <header className="bg-white shadow-sm">
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
        <main>
          <div className="p-4 pt-10 pb-16 md:pb-4">
            {children}
          </div>
        </main>
      </div>
      <BottomMenu />
    </div>
  );
} 