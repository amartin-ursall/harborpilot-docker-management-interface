import { create } from 'zustand';
import React from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  ActivityEvent,
  Alert,
  Container,
  ContainerDetails,
  ContainerStatus,
  ContainerSummary,
  DockerImage,
  DockerNetwork,
  DockerVolume,
  HostDetails,
  HostStats,
  OverviewData,
  ResourceUsage,
} from '@/lib/types';

const defaultHostStats: HostStats = {
  cpuUsage: 0,
  memoryUsage: 0,
  memoryTotal: 0,
  diskUsage: 0,
  diskTotal: 0,
  networkIngress: 0,
  networkEgress: 0,
};

const defaultHostDetails: HostDetails = {
  hostname: 'unknown',
  os: 'unknown',
  dockerVersion: 'unknown',
  uptime: 'unknown',
  connectionMode: 'Remote API',
};

const defaultSummary: OverviewData['summary'] = {
  containers: { running: 0, exited: 0, paused: 0, total: 0 },
  images: 0,
  volumes: 0,
  networks: 0,
};

const emptyContainerDetails = (container?: Container): ContainerDetails => ({
  id: container?.id ?? '',
  name: container?.name ?? '',
  image: container?.image ?? '',
  status: container?.status ?? 'created',
  ports: container?.ports ?? [],
  cpuUsage: container?.cpuUsage ?? 0,
  memoryUsage: container?.memoryUsage ?? 0,
  memoryLimit: container?.memoryLimit ?? 0,
  uptime: container?.uptime ?? 'unknown',
  restartPolicy: 'no',
  environment: {},
  volumes: [],
  network: {
    ipAddress: 'N/A',
    gateway: 'N/A',
    macAddress: 'N/A',
  },
});

const createPruneSystemSummary = (danglingImagesCount: number) =>
  React.createElement(
    'ul',
    { className: 'list-disc pl-5 text-sm space-y-1' },
    React.createElement(
      'li',
      { key: 'images' },
      `${danglingImagesCount} dangling image(s) will be removed.`,
    ),
    React.createElement(
      'li',
      { key: 'containers' },
      'Stopped containers will be removed.',
    ),
    React.createElement(
      'li',
      { key: 'networks' },
      'Unused networks and volumes will be removed.',
    ),
  );

const createPruneImagesSummary = (danglingImagesCount: number) =>
  React.createElement(
    'p',
    { className: 'text-sm' },
    `${danglingImagesCount} dangling image(s) will be removed.`,
  );

type DialogState = {
  isOpen: boolean;
  title: string;
  description: string;
  summary?: React.ReactNode;
  onConfirm: () => Promise<void> | void;
  isProcessing: boolean;
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
  summary: OverviewData['summary'];
  alerts: Alert[];
  hostDetails: HostDetails;
  recentActivity: ActivityEvent[];
  selectedContainer: ContainerDetails | null;
  isLoadingContainerDetails: boolean;
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
  isFetchingOverview: boolean;
  connectionStatus: 'connected' | 'disconnected';
  lastUpdate: Date | null;
  fetchOverview: () => Promise<void>;
  fetchContainers: () => Promise<void>;
  fetchImages: () => Promise<void>;
  fetchVolumes: () => Promise<void>;
  fetchNetworks: () => Promise<void>;
  setContainerFilter: (filter: string) => void;
  setImageFilter: (filter: string) => void;
  setImageDisplayFilter: (filter: 'all' | 'dangling') => void;
  setVolumeFilter: (filter: string) => void;
  setNetworkFilter: (filter: string) => void;
  selectContainer: (id: string | null) => void;
  loadContainerDetails: (id: string) => Promise<void>;
  setDetailsPanelOpen: (isOpen: boolean) => void;
  setDetailsSheetDefaultTab: (tab: string) => void;
  selectContainerAndOpenDetails: (id: string, tab: string) => void;
  showDialog: (options: Omit<DialogState, 'isOpen' | 'isProcessing'>) => void;
  hideDialog: () => void;
  setDialogProcessing: (isProcessing: boolean) => void;
  toggleContainerStatus: (id: string, status: ContainerStatus) => Promise<void>;
  deleteContainer: (id: string) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
  pruneImages: () => void;
  deleteVolume: (name: string) => Promise<void>;
  deleteNetwork: (id: string) => Promise<void>;
  pruneSystem: () => void;
  setModalOpen: (modal: keyof ModalState, isOpen: boolean) => void;
};

const appendResourceUsage = (
  hostStats: HostStats,
  previous: ResourceUsage[],
): ResourceUsage[] => {
  if (!hostStats) return previous;
  const memoryPercent =
    hostStats.memoryTotal > 0
      ? Number(
          ((hostStats.memoryUsage / hostStats.memoryTotal) * 100).toFixed(1),
        )
      : 0;
  const point: ResourceUsage = {
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    cpu: hostStats.cpuUsage,
    memory: memoryPercent,
  };
  return [...previous.slice(-19), point];
};

export const useStore = create<AppState>((set, get) => ({
  containers: [],
  images: [],
  volumes: [],
  networks: [],
  hostStats: defaultHostStats,
  resourceUsage: [],
  summary: defaultSummary,
  alerts: [],
  hostDetails: defaultHostDetails,
  recentActivity: [],
  selectedContainer: null,
  isLoadingContainerDetails: false,
  isDetailsPanelOpen: false,
  detailsSheetDefaultTab: 'overview',
  containerFilter: '',
  imageFilter: '',
  imageDisplayFilter: 'all',
  volumeFilter: '',
  networkFilter: '',
  dialog: {
    isOpen: false,
    title: '',
    description: '',
    summary: undefined,
    onConfirm: () => {},
    isProcessing: false,
  },
  modals: {
    isNewContainerOpen: false,
    isPullImageOpen: false,
    isNewVolumeOpen: false,
    isNewNetworkOpen: false,
  },
  isFetchingContainers: false,
  isFetchingImages: false,
  isFetchingVolumes: false,
  isFetchingNetworks: false,
  isFetchingOverview: false,
  connectionStatus: 'disconnected',
  lastUpdate: null,
  fetchOverview: async () => {
    set({ isFetchingOverview: true });
    try {
      const data = await api.getOverview();
      set((state) => ({
        summary: data.summary,
        hostStats: data.hostStats,
        hostDetails: data.hostDetails,
        alerts: data.alerts,
        recentActivity: data.recentActivity,
        resourceUsage: appendResourceUsage(data.hostStats, state.resourceUsage),
        connectionStatus: 'connected',
        isFetchingOverview: false,
        lastUpdate: new Date(),
      }));
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to load overview');
      set({ isFetchingOverview: false, connectionStatus: 'disconnected' });
    }
  },
  fetchContainers: async () => {
    set({ isFetchingContainers: true });
    try {
      const containers = await api.getContainers();
      set({
        containers,
        isFetchingContainers: false,
        connectionStatus: 'connected',
        lastUpdate: new Date(),
      });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to load containers');
      set({ isFetchingContainers: false, connectionStatus: 'disconnected' });
    }
  },
  fetchImages: async () => {
    set({ isFetchingImages: true });
    try {
      const images = await api.getImages();
      set({ images, isFetchingImages: false });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to load images');
      set({ isFetchingImages: false });
    }
  },
  fetchVolumes: async () => {
    set({ isFetchingVolumes: true });
    try {
      const volumes = await api.getVolumes();
      set({ volumes, isFetchingVolumes: false });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to load volumes');
      set({ isFetchingVolumes: false });
    }
  },
  fetchNetworks: async () => {
    set({ isFetchingNetworks: true });
    try {
      const networks = await api.getNetworks();
      set({ networks, isFetchingNetworks: false });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to load networks');
      set({ isFetchingNetworks: false });
    }
  },
  setContainerFilter: (filter) => set({ containerFilter: filter }),
  setImageFilter: (filter) => set({ imageFilter: filter }),
  setImageDisplayFilter: (filter) => set({ imageDisplayFilter: filter }),
  setVolumeFilter: (filter) => set({ volumeFilter: filter }),
  setNetworkFilter: (filter) => set({ networkFilter: filter }),
  selectContainer: (id) => {
    if (!id) {
      set({ selectedContainer: null });
      return;
    }
    const container = get().containers.find((c) => c.id === id);
    if (container) {
      set({ selectedContainer: emptyContainerDetails(container) });
    }
  },
  loadContainerDetails: async (id) => {
    set({ isLoadingContainerDetails: true });
    try {
      const details = await api.getContainerDetails(id);
      set({
        selectedContainer: details,
        isLoadingContainerDetails: false,
        connectionStatus: 'connected',
      });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to load container details');
      set({ isLoadingContainerDetails: false, connectionStatus: 'disconnected' });
    }
  },
  setDetailsPanelOpen: (isOpen) => {
    set({ isDetailsPanelOpen: isOpen });
    if (!isOpen) {
      set({ selectedContainer: null });
    }
  },
  setDetailsSheetDefaultTab: (tab) => set({ detailsSheetDefaultTab: tab }),
  selectContainerAndOpenDetails: (id, tab) => {
    const { selectContainer, setDetailsPanelOpen, loadContainerDetails } = get();
    selectContainer(id);
    set({ detailsSheetDefaultTab: tab });
    setDetailsPanelOpen(true);
    loadContainerDetails(id);
  },
  showDialog: ({ title, description, onConfirm, summary }) =>
    set({
      dialog: {
        isOpen: true,
        title,
        description,
        summary,
        onConfirm,
        isProcessing: false,
      },
    }),
  hideDialog: () =>
    set((state) => ({
      dialog: { ...state.dialog, isOpen: false, isProcessing: false },
    })),
  setDialogProcessing: (isProcessing) =>
    set((state) => ({
      dialog: { ...state.dialog, isProcessing },
    })),
  toggleContainerStatus: async (id, status) => {
    try {
      let action: 'start' | 'stop' | 'restart';
      if (status === 'running') {
        action = 'start';
      } else if (status === 'restarting') {
        action = 'restart';
      } else {
        action = 'stop';
      }
      await api.updateContainerStatus(id, action);
      await get().fetchContainers();
      const selected = get().selectedContainer;
      if (selected?.id === id) {
        await get().loadContainerDetails(id);
      }
      toast.success(`Container ${action} request sent.`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update container');
    }
  },
  deleteContainer: async (id) => {
    try {
      await api.deleteContainer(id);
      set((state) => ({
        containers: state.containers.filter((container) => container.id !== id),
      }));
      toast.success('Container deleted successfully.');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete container');
    }
  },
  deleteImage: async (id) => {
    try {
      await api.deleteImage(id);
      set((state) => ({
        images: state.images.filter((image) => image.id !== id),
      }));
      toast.success('Image deleted successfully.');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete image');
    }
  },
  pruneImages: () => {
    const danglingCount = get().images.filter((image) => image.name === '<none>').length;
    get().showDialog({
      title: 'Prune Unused Images?',
      description: 'This action removes dangling images and cannot be undone.',
      summary: createPruneImagesSummary(danglingCount),
      onConfirm: async () => {
        try {
          await api.pruneImages();
          await get().fetchImages();
          toast.success('Unused images pruned successfully.');
        } catch (error) {
          console.error(error);
          toast.error(error instanceof Error ? error.message : 'Failed to prune images');
        }
      },
    });
  },
  deleteVolume: async (name) => {
    try {
      await api.deleteVolume(name);
      set((state) => ({
        volumes: state.volumes.filter((volume) => volume.name !== name),
      }));
      toast.success('Volume deleted successfully.');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete volume');
    }
  },
  deleteNetwork: async (id) => {
    try {
      await api.deleteNetwork(id);
      set((state) => ({
        networks: state.networks.filter((network) => network.id !== id),
      }));
      toast.success('Network deleted successfully.');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete network');
    }
  },
  pruneSystem: () => {
    const danglingCount = get().images.filter((image) => image.name === '<none>').length;
    get().showDialog({
      title: 'Prune System?',
      description:
        'This removes stopped containers, unused networks, dangling images, and unused volumes. This action is irreversible.',
      summary: createPruneSystemSummary(danglingCount),
      onConfirm: async () => {
        try {
          await api.pruneSystem();
          await Promise.all([
            get().fetchContainers(),
            get().fetchImages(),
            get().fetchVolumes(),
            get().fetchNetworks(),
            get().fetchOverview(),
          ]);
          toast.success('System pruned successfully.');
        } catch (error) {
          console.error(error);
          toast.error(error instanceof Error ? error.message : 'Failed to prune system');
        }
      },
    });
  },
  setModalOpen: (modal, isOpen) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modal]: isOpen,
      },
    })),
}));
