import { create } from 'zustand';
import { mockContainers, mockHostStats, mockResourceUsage, mockSummary } from '@/lib/mockData';
import { Container, HostStats, ResourceUsage } from '@/lib/types';
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
  fetchContainers: () => void;
};
export const useStore = create<AppState>((set) => ({
  containers: [],
  hostStats: mockHostStats,
  resourceUsage: mockResourceUsage,
  summary: mockSummary,
  fetchContainers: () => {
    // In a real app, this would be an API call
    set({ containers: mockContainers });
  },
}));
// Initialize store with data
useStore.getState().fetchContainers();