import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "./NotificationBell";
import { Helmet } from "react-helmet-async";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardLayout = ({ children, title = "Dashboard" }: DashboardLayoutProps) => {
  return (
    <>
      <Helmet>
        <title>{title} | Alsamos Corporation</title>
      </Helmet>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar />
          
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
              <SidebarTrigger className="-ml-2" />
              <div className="flex-1" />
              <NotificationBell />
              <ThemeToggle />
            </header>

            <main className="flex-1 p-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
};
