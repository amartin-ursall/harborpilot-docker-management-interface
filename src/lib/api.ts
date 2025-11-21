import {
  Container,
  ContainerDetails,
  ContainerEvent,
  DockerImage,
  DockerNetwork,
  DockerVolume,
  LogEntry,
  OverviewData,
} from "./types";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
}

const isFormData = (body: BodyInit | null | undefined): body is FormData =>
  typeof FormData !== "undefined" && body instanceof FormData;

const apiBase =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "/api";

const normalizedBase =
  apiBase === "/"
    ? ""
    : apiBase.endsWith("/")
    ? apiBase.slice(0, -1)
    : apiBase;

const buildUrl = (path: string) =>
  path.startsWith("http")
    ? path
    : `${normalizedBase}${path.startsWith("/") ? path : `/${path}`}`;

async function request<T>(
  path: string,
  init?: RequestInit & { parse?: "json" | "text" }
): Promise<T> {
  const headers = new Headers(init?.headers);
  let body = init?.body;
  if (body && typeof body === "object" && !isFormData(body)) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }
  const response = await fetch(buildUrl(path), { ...init, headers, body });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }
  const envelope = (await response.json()) as ApiEnvelope<T>;
  if (!envelope.success) {
    throw new Error(envelope.error || "Server error");
  }
  return envelope.data;
}

export const api = {
  getOverview: () => request<OverviewData>("/overview"),
  getContainers: () => request<Container[]>("/containers"),
  getContainerDetails: (id: string) =>
    request<ContainerDetails>(`/containers/${id}`),
  updateContainerStatus: (id: string, action: "start" | "stop" | "restart") =>
    request<{ id: string; action: string }>(`/containers/${id}/${action}`, {
      method: "POST",
    }),
  deleteContainer: (id: string) =>
    request(`/containers/${id}`, { method: "DELETE" }),
  createContainer: (payload: {
    image: string;
    name?: string;
    ports?: { hostPort: string; containerPort: string; protocol?: string }[];
    env?: Record<string, string>;
    command?: string;
    restartPolicy?: "no" | "always" | "unless-stopped" | "on-failure";
    start?: boolean;
  }) =>
    request<{ id: string }>("/containers", { method: "POST", body: payload }),
  getContainerLogs: (id: string, tail = 200) =>
    request<LogEntry[]>(`/containers/${id}/logs?tail=${tail}`),
  getContainerEvents: (id: string) =>
    request<ContainerEvent[]>(`/containers/${id}/events`),
  executeContainerCommand: (id: string, command: string) =>
    request<{ output: string }>(`/containers/${id}/exec`, {
      method: "POST",
      body: { command },
    }),
  getImages: () => request<DockerImage[]>("/images"),
  pullImage: (reference: string) =>
    request<{ message: string }>("/images/pull", {
      method: "POST",
      body: { reference },
    }),
  pruneImages: () => request("/images/prune", { method: "POST" }),
  deleteImage: (id: string) =>
    request(`/images/${id}`, { method: "DELETE" }),
  getVolumes: () => request<DockerVolume[]>("/volumes"),
  createVolume: (payload: { name: string; driver?: string }) =>
    request("/volumes", { method: "POST", body: payload }),
  deleteVolume: (name: string) =>
    request(`/volumes/${name}`, { method: "DELETE" }),
  getNetworks: () => request<DockerNetwork[]>("/networks"),
  createNetwork: (payload: { name: string; driver?: string }) =>
    request("/networks", { method: "POST", body: payload }),
  deleteNetwork: (id: string) =>
    request(`/networks/${id}`, { method: "DELETE" }),
  pruneSystem: () => request("/system/prune", { method: "POST" }),
};
