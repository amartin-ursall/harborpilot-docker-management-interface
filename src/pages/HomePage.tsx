import { Outlet } from 'react-router-dom';
import { HarborPilotSidebar } from '@/components/HarborPilotSidebar';
import { HarborPilotHeader } from '@/components/HarborPilotHeader';
import { Toaster } from '@/components/ui/sonner';
import { useTheme } from '@/hooks/use-theme';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { NewContainerDialog } from '@/components/modals/NewContainerDialog';
import { PullImageDialog } from '@/components/modals/PullImageDialog';
import { NewVolumeDialog } from '@/components/modals/NewVolumeDialog';
import { NewNetworkDialog } from '@/components/modals/NewNetworkDialog';
import { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
export function HomePage() {
  const { isDark } = useTheme();
  const fetchOverview = useStore((s) => s.fetchOverview);
  const fetchContainers = useStore((s) => s.fetchContainers);
  const fetchImages = useStore((s) => s.fetchImages);
  const fetchVolumes = useStore((s) => s.fetchVolumes);
  const fetchNetworks = useStore((s) => s.fetchNetworks);
  useEffect(() => {
    fetchOverview();
    fetchContainers();
    fetchImages();
    fetchVolumes();
    fetchNetworks();
  }, [fetchOverview, fetchContainers, fetchImages, fetchVolumes, fetchNetworks]);
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
      <ConfirmationDialog />
      <NewContainerDialog />
      <PullImageDialog />
      <NewVolumeDialog />
      <NewNetworkDialog />
    </div>
  );
}
