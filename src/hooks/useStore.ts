import { create } from 'zustand';
import { mockContainers, mockHostStats, mockResourceUsage, mockSummary, mockContainerDetails, mockImages, mockVolumes, mockNetworks, mockAlerts, mockHostDetails, mockRecentActivity } from '@/lib/mockData';
import { Container, HostStats, ResourceUsage, ContainerDetails, DockerImage, DockerVolume, DockerNetwork, ContainerSummary, Alert, HostDetails as HostDetailsType, ActivityEvent, ContainerStatus } from '@/lib/types';
import { toast } from 'sonner';
import React from 'react';
type DialogState = {
  isOpen: boolean;
  title: string;
  description: string;
  summary?: React.ReactNode;
  onConfirm: () => void;
};
type ModalState = {
  isNewContainerOpen: boolean;
  isPullImageOpen: boolean;
  isNewVolumeOpen: boolean;
  isNewNetworkOpen: boolean;
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
  detailsSheetDefaultTab: string;
  containerFilter: string;
  imageFilter: string;
  imageDisplayFilter: 'all' | 'dangling';
  volumeFilter: string;
  networkFilter: string;
  dialog: DialogState;
  modals: ModalState;
  isFetchingContainers: boolean;
  isFetchingImages: boolean;
  isFetchingVolumes: boolean;
  isFetchingNetworks: boolean;
  connectionStatus: 'connected' | 'disconnected';
  lastUpdate: Date | null;
  fetchContainers: () => void;
  fetchImages: () => void;
  fetchVolumes: () => void;
  fetchNetworks: () => void;
  selectContainer: (id: string | null) => void;
  setDetailsPanelOpen: (isOpen: boolean) => void;
  setDetailsSheetDefaultTab: (tab: string) => void;
  selectContainerAndOpenDetails: (id: string, tab: string) => void;
  setContainerFilter: (filter: string) => void;
  setImageFilter: (filter: string) => void;
  setImageDisplayFilter: (filter: 'all' | 'dangling') => void;
  setVolumeFilter: (filter: string) => void;
  setNetworkFilter: (filter: string) => void;
  showDialog: (options: Omit<DialogState, 'isOpen'>) => void;
  hideDialog: () => void;
  toggleContainerStatus: (id: string, status: ContainerStatus) => void;
  deleteContainer: (id: string) => void;
  deleteImage: (id: string) => void;
  pruneImages: () => void;
  deleteVolume: (name: string) => void;
  deleteNetwork: (id: string) => void;
  pruneSystem: () => void;
  setModalOpen: (modal: keyof ModalState, isOpen: boolean) => void;
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
  detailsSheetDefaultTab: 'overview',
  containerFilter: '',
  imageFilter: '',
  imageDisplayFilter: 'all',
  volumeFilter: '',
  networkFilter: '',
  isFetchingContainers: true,
  isFetchingImages: true,
  isFetchingVolumes: true,
  isFetchingNetworks: true,
  connectionStatus: 'connected',
  lastUpdate: null,
  dialog: {
    isOpen: false,
    title: '',
    description: '',
    summary: undefined,
    onConfirm: () => {},
  },
  modals: {
    isNewContainerOpen: false,
    isPullImageOpen: false,
    isNewVolumeOpen: false,
    isNewNetworkOpen: false,
  },
  fetchContainers: () => {
    set({ isFetchingContainers: true });
    setTimeout(() => {
      set({ containers: mockContainers, isFetchingContainers: false, lastUpdate: new Date() });
    }, 500);
  },
  fetchImages: () => {
    set({ isFetchingImages: true });
    setTimeout(() => {
      set({ images: mockImages, isFetchingImages: false, lastUpdate: new Date() });
    }, 500);
  },
  fetchVolumes: () => {
    set({ isFetchingVolumes: true });
    setTimeout(() => {
      set({ volumes: mockVolumes, isFetchingVolumes: false, lastUpdate: new Date() });
    }, 500);
  },
  fetchNetworks: () => {
    set({ isFetchingNetworks: true });
    setTimeout(() => {
      set({ networks: mockNetworks, isFetchingNetworks: false, lastUpdate: new Date() });
    }, 500);
  },
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
  setDetailsSheetDefaultTab: (tab) => set({ detailsSheetDefaultTab: tab }),
  selectContainerAndOpenDetails: (id, tab) => {
    get().selectContainer(id);
    get().setDetailsSheetDefaultTab(tab);
    get().setDetailsPanelOpen(true);
  },
  setContainerFilter: (filter: string) => set({ containerFilter: filter }),
  setImageFilter: (filter: string) => set({ imageFilter: filter }),
  setImageDisplayFilter: (filter) => set({ imageDisplayFilter: filter }),
  setVolumeFilter: (filter: string) => set({ volumeFilter: filter }),
  setNetworkFilter: (filter: string) => set({ networkFilter: filter }),
  showDialog: ({ title, description, onConfirm, summary }) => set({
    dialog: { isOpen: true, title, description, onConfirm, summary }
  }),
  hideDialog: () => set(state => ({
    dialog: { ...state.dialog, isOpen: false }
  })),
  toggleContainerStatus: (id, status) => set(state => ({
    containers: state.containers.map(c => c.id === id ? { ...c, status } : c)
  })),
  deleteContainer: (id) => set(state => ({
    containers: state.containers.filter(c => c.id !== id)
  })),
  deleteImage: (id) => set(state => ({
    images: state.images.filter(i => i.id !== id)
  })),
  pruneImages: () => {
    const danglingImages = get().images.filter(i => i.name === '<none>');
    get().showDialog({
      title: 'Prune Unused Images?',
      description: 'This will remove all dangling images (images not tagged or associated with a container). This action cannot be undone.',
      summary: (<p>{danglingImages.length} dangling image(s) will be removed.</p>),
      onConfirm: () => {
        set(state => ({
          images: state.images.filter(i => i.name !== '<none>')
        }));
        toast.success('Unused images pruned successfully.');
      },
    });
  },
  deleteVolume: (name) => set(state => ({
    volumes: state.volumes.filter(v => v.name !== name)
  })),
  deleteNetwork: (id) => set(state => ({
    networks: state.networks.filter(n => n.id !== id)
  })),
  pruneSystem: () => {
    const danglingImages = get().images.filter(i => i.name === '<none>');
    get().showDialog({
      title: 'Prune System?',
      description: 'This will remove all stopped containers, dangling images, and unused networks and volumes. This action is irreversible.',
      summary: (
        <ul className="list-disc pl-5 text-sm">
          <li>{danglingImages.length} dangling image(s) will be removed.</li>
          <li>(Mock) Stopped containers will be removed.</li>
          <li>(Mock) Unused networks will be removed.</li>
        </ul>
      ),
      onConfirm: () => {
        set(state => ({
          images: state.images.filter(i => i.name !== '<none>')
        }));
        toast.success('System pruned successfully.');
      },
    });
  },
  setModalOpen: (modal, isOpen) => {
    set(state => ({
      modals: {
        ...state.modals,
        [modal]: isOpen,
      }
    }));
  },
}));
// Initialize store with data
useStore.getState().fetchContainers();
useStore.getState().fetchImages();
useStore.getState().fetchVolumes();
useStore.getState().fetchNetworks();