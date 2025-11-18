import { create } from 'zustand';
import { mockContainers, mockHostStats, mockResourceUsage, mockSummary, mockContainerDetails, mockImages, mockVolumes, mockNetworks, mockAlerts, mockHostDetails, mockRecentActivity } from '@/lib/mockData';
import { Container, HostStats, ResourceUsage, ContainerDetails, DockerImage, DockerVolume, DockerNetwork, ContainerSummary, Alert, HostDetails as HostDetailsType, ActivityEvent } from '@/lib/types';
type AppState = {
  containers: Container[];
  images: DockerImage[];
  volumes: DockerVolume[];
  networks: DockerNetwork[];
  hostStats: HostStats;
  resourceUsage: ResourceUsage[];
  summary: {
    containers: ContainerSummary;
    images: number;
    volumes: number;
    networks: number;
  };
  alerts: Alert[];
  hostDetails: HostDetailsType;
  recentActivity: ActivityEvent[];
  selectedContainer: ContainerDetails | null;
  isDetailsPanelOpen: boolean;
  fetchContainers: () => void;
  fetchImages: () => void;
  fetchVolumes: () => void;
  fetchNetworks: () => void;
  selectContainer: (id: string | null) => void;
  setDetailsPanelOpen: (isOpen: boolean) => void;
};
export const useStore = create<AppState>((set, get) => ({
  containers: [],
  images: [],
  volumes: [],
  networks: [],
  hostStats: mockHostStats,
  resourceUsage: mockResourceUsage,
  summary: mockSummary,
  alerts: mockAlerts,
  hostDetails: mockHostDetails,
  recentActivity: mockRecentActivity,
  selectedContainer: null,
  isDetailsPanelOpen: false,
  fetchContainers: () => set({ containers: mockContainers }),
  fetchImages: () => set({ images: mockImages }),
  fetchVolumes: () => set({ volumes: mockVolumes }),
  fetchNetworks: () => set({ networks: mockNetworks }),
  selectContainer: (id: string | null) => {
    if (id === null) {
      set({ selectedContainer: null });
      return;
    }
    const container = get().containers.find(c => c.id === id);
    if (container) {
      set({ selectedContainer: { ...mockContainerDetails, ...container } });
    }
  },
  setDetailsPanelOpen: (isOpen: boolean) => {
    set({ isDetailsPanelOpen: isOpen });
    if (!isOpen) {
      set({ selectedContainer: null });
    }
  },
}));
// Initialize store with data
useStore.getState().fetchContainers();
useStore.getState().fetchImages();
useStore.getState().fetchVolumes();
useStore.getState().fetchNetworks();