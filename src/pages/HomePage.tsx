import { Outlet } from 'react-router-dom';
import { HarborPilotSidebar } from '@/components/HarborPilotSidebar';
import { HarborPilotHeader } from '@/components/HarborPilotHeader';
import { Toaster } from '@/components/ui/sonner';
import { useTheme } from '@/hooks/use-theme';
import { useEffect } from 'react';
export function HomePage() {
  const { isDark } = useTheme();
  useEffect(() => {
    // Force dark theme for this application
    if (!isDark) {
      document.documentElement.classList.add('dark');
    }
  }, [isDark]);
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex">
      <HarborPilotSidebar />
      <main className="flex-1 md:ml-64 flex flex-col">
        <HarborPilotHeader />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
      <Toaster richColors theme="dark" />
    </div>
  );
}