import { Outlet } from 'react-router-dom';
import { HarborPilotSidebar } from '@/components/HarborPilotSidebar';
import { HarborPilotHeader } from '@/components/HarborPilotHeader';
import { Toaster } from '@/components/ui/sonner';
import { useTheme } from '@/hooks/use-theme';
export function HomePage() {
  const { isDark } = useTheme();
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex">
      <HarborPilotSidebar />
      <main className="flex-1 md:ml-64 flex flex-col">
        <HarborPilotHeader />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
      <Toaster richColors theme={isDark ? 'dark' : 'light'} />
    </div>
  );
}