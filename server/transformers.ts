import crypto from "node:crypto";
import {
  ActivityEvent,
  Alert,
  Container,
  ContainerDetails,
  ContainerEvent,
  DockerImage,
  DockerNetwork,
  DockerVolume,
  HostDetails,
  HostStats,
} from "./types";
import {
  bytesToGB,
  bytesToMB,
  formatDuration,
  humanFileSize,
  mapWithConcurrency,
  relativeTimeFromNow,
  truncateId,
} from "./utils";
import { DockerClient } from "./dockerClient";

const statusMap: Record<string, Container["status"]> = {
  running: "running",
  exited: "exited",
  stopped: "exited",
  created: "created",
  restarting: "restarting",
  paused: "paused",
};

const normalizeStatus = (raw?: string): Container["status"] => {
  if (!raw) return "created";
  const lower = raw.toLowerCase();
  for (const [key, value] of Object.entries(statusMap)) {
    if (lower.includes(key)) return value;
  }
  return "created";
};

const calculateCpuPercentage = (stats: any): number => {
  if (!stats) return 0;
  const cpuDelta =
    (stats?.cpu_stats?.cpu_usage?.total_usage ?? 0) -
    (stats?.precpu_stats?.cpu_usage?.total_usage ?? 0);
  const systemDelta =
    (stats?.cpu_stats?.system_cpu_usage ?? 0) -
    (stats?.precpu_stats?.system_cpu_usage ?? 0);
  const onlineCpus =
    stats?.cpu_stats?.online_cpus ??
    stats?.cpu_stats?.cpu_usage?.percpu_usage?.length ??
    1;
  if (cpuDelta <= 0 || systemDelta <= 0) return 0;
  const percent = (cpuDelta / systemDelta) * onlineCpus * 100;
  return Number(percent.toFixed(1));
};

const extractNetworkRates = (stats: any) => {
  const networks = stats?.networks ?? {};
  const prevNetworks = stats?.precpu_stats?.networks ?? {};
  let rxBytes = 0;
  let txBytes = 0;
  let prevRxBytes = 0;
  let prevTxBytes = 0;
  for (const net of Object.values(networks) as any[]) {
    rxBytes += net?.rx_bytes ?? 0;
    txBytes += net?.tx_bytes ?? 0;
  }
  for (const net of Object.values(prevNetworks) as any[]) {
    prevRxBytes += net?.rx_bytes ?? 0;
    prevTxBytes += net?.tx_bytes ?? 0;
  }
  const previousRead = Date.parse(stats?.precpu_stats?.read ?? "");
  const currentRead = Date.parse(stats?.read ?? "");
  const seconds = Math.max(
    1,
    (currentRead - (Number.isFinite(previousRead) ? previousRead : currentRead)) /
      1000
  );
  return {
    ingressRate: Number(
      (((rxBytes - prevRxBytes) / seconds) / 1024 / 1024).toFixed(2)
    ),
    egressRate: Number(
      (((txBytes - prevTxBytes) / seconds) / 1024 / 1024).toFixed(2)
    ),
  };
};

const mapPorts = (ports: any[]): Container["ports"] =>
  (ports ?? []).map((port) => ({
    privatePort: port.PrivatePort,
    publicPort: port.PublicPort,
    type: port.Type ?? "tcp",
  }));

export const buildContainer = (raw: any, stats?: any): Container => {
  const uptimeSeconds = Math.max(
    0,
    Date.now() / 1000 - Number(raw.Created ?? 0)
  );
  const memoryUsage = stats?.memory_stats?.usage ?? 0;
  const memoryLimit = stats?.memory_stats?.limit ?? 0;
  return {
    id: raw.Id,
    name: (raw.Names?.[0] ?? raw.Name ?? raw.Id).replace(/^\//, ""),
    image: raw.Image ?? raw.Config?.Image ?? "unknown",
    status: normalizeStatus(raw.State ?? raw.Status),
    ports: mapPorts(raw.Ports ?? []),
    cpuUsage: calculateCpuPercentage(stats),
    memoryUsage: bytesToMB(memoryUsage),
    memoryLimit: bytesToMB(memoryLimit),
    uptime: formatDuration(uptimeSeconds),
  };
};

export const buildContainerDetails = (
  inspect: any,
  stats?: any
): ContainerDetails => {
  const base = buildContainer(
    {
      Id: inspect.Id,
      Names: [inspect.Name],
      Image: inspect.Config?.Image,
      State: inspect.State?.Status,
      Ports:
        inspect.NetworkSettings?.Ports &&
        Object.entries(inspect.NetworkSettings.Ports).flatMap(
          ([key, bindings]: [string, any]) => {
            const [privatePort, type] = key.split("/");
            if (!bindings || bindings.length === 0) {
              return [{ PrivatePort: Number(privatePort), Type: type }];
            }
            return bindings.map((binding: any) => ({
              PrivatePort: Number(privatePort),
              PublicPort: Number(binding.HostPort),
              Type: type,
            }));
          }
        ),
      Created: Date.parse(inspect.Created ?? new Date().toISOString()) / 1000,
    },
    stats
  );
  const envEntries = inspect.Config?.Env ?? [];
  const environment = envEntries.reduce<Record<string, string>>(
    (acc, entry: string) => {
      const [key, ...rest] = entry.split("=");
      acc[key] = rest.join("=");
      return acc;
    },
    {}
  );
  const volumes =
    inspect.Mounts?.map((mount: any) => ({
      hostPath: mount.Source,
      containerPath: mount.Destination,
    })) ?? [];
  const networks = inspect.NetworkSettings?.Networks ?? {};
  const firstNetwork = Object.values(networks)[0] as any;
  return {
    ...base,
    restartPolicy:
      inspect.HostConfig?.RestartPolicy?.Name ?? ("no" as const),
    environment,
    volumes,
    network: {
      ipAddress:
        firstNetwork?.IPAddress ??
        inspect.NetworkSettings?.IPAddress ??
        "N/A",
      gateway: firstNetwork?.Gateway ?? "N/A",
      macAddress: firstNetwork?.MacAddress ?? "N/A",
    },
    inspect,
  };
};

export const buildImages = (rawImages: any[]): DockerImage[] => {
  const images: DockerImage[] = [];
  for (const image of rawImages) {
    const tags =
      image.RepoTags && image.RepoTags.length > 0
        ? image.RepoTags
        : ["<none>:<none>"];
    for (const tag of tags) {
      const [name, tagValue = "latest"] = tag.split(":");
      images.push({
        id: truncateId(image.Id),
        name,
        tag: tagValue,
        size: humanFileSize(image.Size ?? 0),
        created: relativeTimeFromNow(image.Created ?? 0),
      });
    }
  }
  return images;
};

export const buildVolumes = (rawVolumes: any[], containers: any[]): DockerVolume[] =>
  (rawVolumes ?? []).map((volume: any) => {
    const containersInUse =
      containers
        ?.filter((container) =>
          (container.Mounts ?? []).some((mount: any) => mount.Name === volume.Name)
        )
        .map(
          (container) =>
            (container.Names?.[0] ?? truncateId(container.Id)).replace(/^\//, "")
        ) ?? [];
    return {
      name: volume.Name,
      driver: volume.Driver,
      size: humanFileSize(volume?.UsageData?.Size ?? 0),
      containersInUse,
    };
  });

export const buildNetworks = (rawNetworks: any[]): DockerNetwork[] =>
  (rawNetworks ?? []).map((network: any) => ({
    id: truncateId(network.Id),
    name: network.Name,
    driver: network.Driver,
    scope: network.Scope,
  }));

export const buildHostDetails = (info: any): HostDetails => ({
  hostname: info.Name ?? "docker-host",
  os: info.OperatingSystem ?? "Unknown OS",
  dockerVersion: info.ServerVersion ?? "Unknown",
  uptime: info.SystemTime ?? new Date().toISOString(),
  connectionMode: info.Driver ?? "Remote API",
});

export const buildHostStats = (
  info: any,
  diskInfo: any,
  containers: Container[],
  networkRates: { ingressRate: number; egressRate: number }[],
  diskTotalOverride?: number
): HostStats => {
  const totalMemory = bytesToGB(info?.MemTotal ?? 0);
  const memoryUsageBytes = containers.reduce(
    (acc, container) => acc + container.memoryUsage * 1024 * 1024,
    0
  );
  const diskUsageBytes =
    (diskInfo?.LayersSize ?? 0) +
    (diskInfo?.Volumes?.reduce(
      (acc: number, volume: any) => acc + (volume?.UsageData?.Size ?? 0),
      0
    ) ?? 0);
  const diskUsage = bytesToGB(diskUsageBytes);
  const diskTotal =
    diskTotalOverride ??
    ((diskUsage > 0 ? diskUsage * 1.25 : 0) || diskUsage);
  const cpuUsage = Math.min(
    100,
    Number(
      containers.reduce((acc, container) => acc + container.cpuUsage, 0).toFixed(
        1
      )
    )
  );
  const ingressTotal = Number(
    networkRates.reduce((sum, rate) => sum + rate.ingressRate, 0).toFixed(2)
  );
  const egressTotal = Number(
    networkRates.reduce((sum, rate) => sum + rate.egressRate, 0).toFixed(2)
  );
  return {
    cpuUsage,
    memoryUsage: Number((memoryUsageBytes / 1024 / 1024 / 1024).toFixed(2)),
    memoryTotal: totalMemory,
    diskUsage,
    diskTotal: Number(diskTotal.toFixed(2)),
    networkIngress: ingressTotal,
    networkEgress: egressTotal,
  };
};

export const buildAlerts = (
  hostStats: HostStats,
  containers: Container[],
  danglingImages: number
): Alert[] => {
  const alerts: Alert[] = [];
  if (hostStats.cpuUsage > 85) {
    alerts.push({
      id: crypto.randomUUID(),
      severity: "warning",
      title: "High CPU Usage",
      message: `Host CPU usage is at ${hostStats.cpuUsage}%.`,
    });
  }
  if (
    hostStats.diskTotal > 0 &&
    hostStats.diskUsage / hostStats.diskTotal > 0.85
  ) {
    alerts.push({
      id: crypto.randomUUID(),
      severity: "critical",
      title: "Low Disk Space",
      message: `Docker is using ${hostStats.diskUsage}GB of ${hostStats.diskTotal}GB available.`,
    });
  }
  const restarting = containers.filter((c) => c.status === "restarting");
  restarting.forEach((container) =>
    alerts.push({
      id: crypto.randomUUID(),
      severity: "critical",
      title: "Container Restarting",
      message: `Container "${container.name}" is restarting repeatedly.`,
      containerId: container.id,
    })
  );
  if (danglingImages > 0) {
    alerts.push({
      id: crypto.randomUUID(),
      severity: "warning",
      title: "Dangling Images",
      message: `There are ${danglingImages} dangling images that can be pruned.`,
      action: "view_dangling_images",
    });
  }
  return alerts;
};

const mapEventType = (type: string | undefined): ActivityEvent["type"] | null => {
  switch (type) {
    case "container":
      return "container";
    case "image":
      return "image";
    case "volume":
      return "volume";
    case "network":
      return "network";
    default:
      return null;
  }
};

const mapEventAction = (
  action: string | undefined
): ActivityEvent["action"] | null => {
  if (!action) return null;
  const normalized = action.toLowerCase();
  if (normalized.includes("create")) return "created";
  if (normalized.includes("start")) return "started";
  if (normalized.includes("stop") || normalized.includes("die"))
    return "stopped";
  if (normalized.includes("destroy") || normalized.includes("delete"))
    return "deleted";
  if (normalized.includes("pull")) return "pulled";
  if (normalized.includes("prune")) return "pruned";
  return null;
};

export const buildActivityEvents = (payload: string): ActivityEvent[] => {
  const lines = payload.split("\n");
  const events: ActivityEvent[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line);
      const type = mapEventType(event.Type);
      const action = mapEventAction(event.Action);
      if (!type || !action) continue;
      const name =
        event?.Actor?.Attributes?.name ??
        event?.Actor?.Attributes?.image ??
        truncateId(event.id);
      const timestamp = (event.time ?? Date.now() / 1000) * 1000;
      events.push({
        id: `${event.id}-${event.timeNano ?? crypto.randomUUID()}`,
        timestamp: new Date(timestamp).toISOString(),
        type,
        action,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} "${name}" ${action}`,
      });
    } catch (error) {
      console.error("Failed to parse docker event", error);
    }
  }
  return events.slice(-25).reverse();
};

export const buildContainerEvents = (payload: string): ContainerEvent[] => {
  const lines = payload.split("\n");
  const events: ContainerEvent[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line);
      const timestamp = (event.time ?? Date.now() / 1000) * 1000;
      const status = event.status ?? event.Action ?? "event";
      const name =
        event?.Actor?.Attributes?.name ?? truncateId(event.id);
      events.push({
        timestamp: new Date(timestamp).toISOString(),
        status,
        message: `${status} - ${name}`,
      });
    } catch (error) {
      console.error("Failed to parse container event", error);
    }
  }
  return events.slice(-25).reverse();
};

export const gatherContainersWithStats = async (
  docker: DockerClient
): Promise<{
  containers: Container[];
  networkRates: { ingressRate: number; egressRate: number }[];
  raw: any[];
}> => {
  const rawContainers = await docker.listContainers(true);
  const stats = await mapWithConcurrency(
    rawContainers,
    4,
    async (container) => {
      try {
        return await docker.getContainerStats(container.Id);
      } catch (error) {
        console.error("Failed to fetch stats for container", container.Id, error);
        return null;
      }
    }
  );
  const containers = rawContainers.map((raw, index) =>
    buildContainer(raw, stats[index])
  );
  const networkRates = stats.map((stat) => extractNetworkRates(stat ?? {}));
  return { containers, networkRates, raw: rawContainers };
};
