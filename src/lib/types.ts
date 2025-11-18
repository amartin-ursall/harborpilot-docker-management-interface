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
export interface Image {
  id: string;
  name: string;
  tag: string;
  size: string;
  created: string;
}
export interface Volume {
  name: string;
  driver: string;
  mountpoint: string;
}
export interface Network {
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