import { create } from 'zustand';
import { mockContainers, mockHostStats, mockResourceUsage, mockSummary, mockContainerDetails, mockImages, mockVolumes, mockNetworks, mockAlerts, mockHostDetails, mockRecentActivity } from '@/lib/mockData';
import { Container, HostStats, ResourceUsage, ContainerDetails, DockerImage, DockerVolume, DockerNetwork, ContainerSummary, Alert, HostDetails as HostDetailsType, ActivityEvent } from '@/lib/types';
import { toast } from 'sonner';
type DialogState = {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
};
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
  containerFilter: string;
  imageFilter: string;
  volumeFilter: string;
  networkFilter: string;
  dialog: DialogState;
  fetchContainers: () => void;
  fetchImages: () => void;
  fetchVolumes: () => void;
  fetchNetworks: () => void;
  selectContainer: (id: string | null) => void;
  setDetailsPanelOpen: (isOpen: boolean) => void;
  setContainerFilter: (filter: string) => void;
  setImageFilter: (filter: string) => void;
  setVolumeFilter: (filter: string) => void;
  setNetworkFilter: (filter: string) => void;
  showDialog: (options: Omit<DialogState, 'isOpen'>) => void;
  hideDialog: () => void;
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
  containerFilter: '',
  imageFilter: '',
  volumeFilter: '',
  networkFilter: '',
  dialog: {
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  },
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
  setContainerFilter: (filter: string) => set({ containerFilter: filter }),
  setImageFilter: (filter: string) => set({ imageFilter: filter }),
  setVolumeFilter: (filter: string) => set({ volumeFilter: filter }),
  setNetworkFilter: (filter: string) => set({ networkFilter: filter }),
  showDialog: ({ title, description, onConfirm }) => set({
    dialog: { isOpen: true, title, description, onConfirm }
  }),
  hideDialog: () => set(state => ({
    dialog: { ...state.dialog, isOpen: false }
  })),
}));
// Initialize store with data
useStore.getState().fetchContainers();
useStore.getState().fetchImages();
useStore.getState().fetchVolumes();
useStore.getState().fetchNetworks();