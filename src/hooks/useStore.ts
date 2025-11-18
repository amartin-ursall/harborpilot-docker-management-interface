import { create } from 'zustand';
import { mockContainers, mockHostStats, mockResourceUsage, mockSummary, mockContainerDetails } from '@/lib/mockData';
import { Container, HostStats, ResourceUsage, ContainerDetails } from '@/lib/types';
type AppState = {
  containers: Container[];
  hostStats: HostStats;
  resourceUsage: ResourceUsage[];
  summary: {
    containers: { running: number; total: number };
    images: number;
    volumes: number;
    networks: number;
  };
  selectedContainer: ContainerDetails | null;
  isDetailsPanelOpen: boolean;
  fetchContainers: () => void;
  selectContainer: (id: string | null) => void;
  setDetailsPanelOpen: (isOpen: boolean) => void;
};
export const useStore = create<AppState>((set, get) => ({
  containers: [],
  hostStats: mockHostStats,
  resourceUsage: mockResourceUsage,
  summary: mockSummary,
  selectedContainer: null,
  isDetailsPanelOpen: false,
  fetchContainers: () => {
    set({ containers: mockContainers });
  },
  selectContainer: (id: string | null) => {
    if (id === null) {
      set({ selectedContainer: null });
      return;
    }
    // In a real app, you'd fetch details for the specific container id.
    // Here, we'll just use the same mock details for any selected container.
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