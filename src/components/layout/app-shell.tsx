import type { ReactNode } from "react";
import { Footer } from "./footer";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 px-4 py-6 pb-24 md:px-6 lg:px-8">{children}</main>
        <Footer />
      </div>
      <MobileNav />
    </div>
  );
}
