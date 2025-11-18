export type ContainerStatus = 'running' | 'exited' | 'paused' | 'restarting' | 'created';
export interface Port {
  privatePort: number;
  publicPort?: number;
  type: 'tcp' | 'udp';
}
export interface Container {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  ports: Port[];
  cpuUsage: number;
  memoryUsage: number;
  memoryLimit: number;
  uptime: string;
}
export interface DockerImage {
  id: string;
  name: string;
  tag: string;
  size: string;
  created: string;
}
export interface DockerVolume {
  name: string;
  driver: string;
  size: string;
  containersInUse: string[];
}
export interface DockerNetwork {
  id:string;
  name: string;
  driver: string;
  scope: string;
}
export interface HostStats {
  cpuUsage: number;
  memoryUsage: number;
  memoryTotal: number;
  diskUsage: number;
  diskTotal: number;
  networkIngress: number;
  networkEgress: number;
}
export interface ResourceUsage {
  time: string;
  cpu: number;
  memory: number;
}
export interface ContainerDetails {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  uptime: string;
  restartPolicy: 'no' | 'on-failure' | 'unless-stopped' | 'always';
  ports: Port[];
  environment: { [key: string]: string };
  volumes: { hostPath: string; containerPath: string }[];
  network: {
    ipAddress: string;
    gateway: string;
    macAddress: string;
  };
}
export interface LogEntry {
  timestamp: string;
  message: string;
  level?: 'info' | 'warn' | 'error';
}
export interface ContainerEvent {
  timestamp: string;
  status: string;
  message: string;
}
export interface ContainerSummary {
  running: number;
  exited: number;
  paused: number;
  total: number;
}
export interface Alert {
  id: string;
  severity: 'critical' | 'warning';
  title: string;
  message: string;
  containerId?: string;
}
export interface HostDetails {
  hostname: string;
  os: string;
  dockerVersion: string;
  uptime: string;
  connectionMode: string;
}
export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'container' | 'image' | 'volume' | 'network';
  action: 'created' | 'started' | 'stopped' | 'deleted' | 'pulled' | 'pruned';
  message: string;
}