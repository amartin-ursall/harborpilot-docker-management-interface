import { Container, HostStats, ResourceUsage, ContainerDetails, LogEntry, ContainerEvent, DockerImage, DockerVolume, DockerNetwork, Alert, HostDetails, ActivityEvent, Host } from './types';
export const mockContainers: Container[] = [
  {
    id: 'a1b2c3d4e5f6',
    name: 'web-server-prod',
    image: 'nginx:latest',
    status: 'running',
    ports: [{ privatePort: 80, publicPort: 8080, type: 'tcp' }],
    cpuUsage: 15.5,
    memoryUsage: 256,
    memoryLimit: 1024,
    uptime: '3 days',
  },
  {
    id: 'b2c3d4e5f6a1',
    name: 'database-main',
    image: 'postgres:13',
    status: 'running',
    ports: [{ privatePort: 5432, publicPort: 5432, type: 'tcp' }],
    cpuUsage: 45.2,
    memoryUsage: 1024,
    memoryLimit: 4096,
    uptime: '1 week',
  },
  {
    id: 'c3d4e5f6a1b2',
    name: 'redis-cache',
    image: 'redis:6-alpine',
    status: 'running',
    ports: [{ privatePort: 6379, publicPort: 6379, type: 'tcp' }],
    cpuUsage: 5.1,
    memoryUsage: 128,
    memoryLimit: 512,
    uptime: '2 hours',
  },
  {
    id: 'd4e5f6a1b2c3',
    name: 'worker-jobs',
    image: 'ubuntu:20.04',
    status: 'exited',
    ports: [],
    cpuUsage: 0,
    memoryUsage: 0,
    memoryLimit: 2048,
    uptime: 'N/A',
  },
  {
    id: 'e5f6a1b2c3d4',
    name: 'api-gateway',
    image: 'kong:latest',
    status: 'restarting',
    ports: [
      { privatePort: 8000, publicPort: 8000, type: 'tcp' },
      { privatePort: 8443, publicPort: 8443, type: 'tcp' },
    ],
    cpuUsage: 80.0,
    memoryUsage: 512,
    memoryLimit: 1024,
    uptime: '5 minutes',
  },
  {
    id: 'f6a1b2c3d4e5',
    name: 'monitoring-agent',
    image: 'prom/prometheus:v2.26.0',
    status: 'paused',
    ports: [{ privatePort: 9090, publicPort: 9090, type: 'tcp' }],
    cpuUsage: 0.1,
    memoryUsage: 64,
    memoryLimit: 256,
    uptime: '1 day',
  },
];
export const mockHostStats: HostStats = {
  cpuUsage: 35,
  memoryUsage: 8.5,
  memoryTotal: 32,
  diskUsage: 250,
  diskTotal: 1000,
  networkIngress: 12.5,
  networkEgress: 2.1,
};
export const mockResourceUsage: ResourceUsage[] = [
  { time: '10:00', cpu: 20, memory: 30 },
  { time: '10:05', cpu: 25, memory: 32 },
  { time: '10:10', cpu: 22, memory: 35 },
  { time: '10:15', cpu: 30, memory: 40 },
  { time: '10:20', cpu: 35, memory: 38 },
  { time: '10:25', cpu: 40, memory: 45 },
  { time: '10:30', cpu: 38, memory: 42 },
];
export const mockSummary = {
  containers: {
    running: mockContainers.filter(c => c.status === 'running').length,
    exited: mockContainers.filter(c => c.status === 'exited').length,
    paused: mockContainers.filter(c => c.status === 'paused').length,
    total: mockContainers.length,
  },
  images: 25,
  volumes: 12,
  networks: 8,
};
export const mockContainerDetails: ContainerDetails = {
  id: 'a1b2c3d4e5f6',
  name: 'web-server-prod',
  image: 'nginx:latest',
  status: 'running',
  uptime: '3 days',
  restartPolicy: 'always',
  ports: [{ privatePort: 80, publicPort: 8080, type: 'tcp' }],
  environment: {
    'NGINX_HOST': 'example.com',
    'NGINX_PORT': '80',
    'PATH': '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
  },
  volumes: [
    { hostPath: '/var/www/html', containerPath: '/usr/share/nginx/html' },
    { hostPath: '/etc/nginx/conf.d', containerPath: '/etc/nginx/conf.d' },
  ],
  network: {
    ipAddress: '172.17.0.2',
    gateway: '172.17.0.1',
    macAddress: '02:42:ac:11:00:02',
  },
};
export const mockContainerLogs: LogEntry[] = [
  { timestamp: '2023-10-27T10:00:00Z', message: 'Server listening on port 80', level: 'info' },
  { timestamp: '2023-10-27T10:00:01Z', message: 'GET / HTTP/1.1" 200', level: 'info' },
  { timestamp: '2023-10-27T10:00:02Z', message: 'GET /styles.css HTTP/1.1" 200', level: 'info' },
  { timestamp: '2023-10-27T10:01:05Z', message: 'File not found: /favicon.ico', level: 'warn' },
  { timestamp: '2023-10-27T10:01:06Z', message: 'GET /favicon.ico HTTP/1.1" 404', level: 'info' },
  { timestamp: '2023-10-27T10:02:10Z', message: 'Upstream connection error', level: 'error' },
];
export const mockContainerInspect = {
  "Id": "a1b2c3d4e5f6...",
  "Created": "2023-10-24T10:00:00Z",
  "Path": "nginx",
  "Args": ["-g", "daemon off;"],
  "State": { "Status": "running", "Running": true, "Pid": 12345 },
  "Image": "sha256:f6d0b1e8ec93...",
  "HostConfig": { "RestartPolicy": { "Name": "always", "MaximumRetryCount": 0 } },
  "GraphDriver": { "Data": { "LowerDir": "/var/lib/docker/overlay2/..." } },
};
export const mockContainerEvents: ContainerEvent[] = [
  { timestamp: '2023-10-24T10:00:00Z', status: 'create', message: 'Container a1b2c3d4e5f6 created' },
  { timestamp: '2023-10-24T10:00:01Z', status: 'start', message: 'Container a1b2c3d4e5f6 started' },
  { timestamp: '2023-10-26T05:30:00Z', status: 'health_status: healthy', message: 'Health check passed' },
  { timestamp: '2023-10-27T08:00:00Z', status: 'kill', message: 'Container killed with signal 9' },
  { timestamp: '2023-10-27T08:00:05Z', status: 'start', message: 'Container restarted' },
];
export const mockImages: DockerImage[] = [
  { id: 'f6d0b1e8ec93', name: 'nginx', tag: 'latest', size: '133MB', created: '3 weeks ago' },
  { id: 'a2a15feb1349', name: 'postgres', tag: '13', size: '314MB', created: '2 months ago' },
  { id: 'e9b4a5f78c1d', name: 'redis', tag: '6-alpine', size: '32MB', created: '1 month ago' },
  { id: 'b8f2d5e7a9c1', name: 'ubuntu', tag: '20.04', size: '72.9MB', created: '5 days ago' },
  { id: 'c1d9e8f7a6b5', name: 'kong', tag: 'latest', size: '450MB', created: '1 week ago' },
  { id: 'd4e5f6a1b2c3', name: 'prom/prometheus', tag: 'v2.26.0', size: '188MB', created: '4 weeks ago' },
  { id: 'g7h8i9j0k1l2', name: '<none>', tag: '<none>', size: '125MB', created: '2 days ago' },
];
export const mockVolumes: DockerVolume[] = [
  { name: 'postgres_data', driver: 'local', size: '2.5GB', containersInUse: ['database-main'] },
  { name: 'redis_cache_data', driver: 'local', size: '512MB', containersInUse: ['redis-cache'] },
  { name: 'app_logs', driver: 'local', size: '1.2GB', containersInUse: ['web-server-prod', 'api-gateway'] },
  { name: 'jenkins_home', driver: 'local', size: '15GB', containersInUse: [] },
];
export const mockNetworks: DockerNetwork[] = [
  { id: 'b7c8d9e0f1a2', name: 'bridge', driver: 'bridge', scope: 'local' },
  { id: 'c8d9e0f1a2b3', name: 'host', driver: 'host', scope: 'local' },
  { id: 'd9e0f1a2b3c4', name: 'none', driver: 'null', scope: 'local' },
  { id: 'e0f1a2b3c4d5', name: 'app_network', driver: 'bridge', scope: 'local' },
];
export const mockAlerts: Alert[] = [
  { id: '1', severity: 'critical', title: 'Container Restarting', message: 'Container "api-gateway" is in a restart loop.', containerId: 'e5f6a1b2c3d4' },
  { id: '2', severity: 'warning', title: 'High CPU Usage', message: 'Host CPU usage is at 85%.', },
  { id: '3', severity: 'warning', title: 'Dangling Images', message: 'Found 1 dangling image that can be pruned.', action: 'view_dangling_images' },
];
export const mockHostDetails: HostDetails = {
  hostname: 'docker-host-01',
  os: 'Ubuntu 22.04.1 LTS',
  dockerVersion: '24.0.5',
  uptime: '2 weeks, 3 days',
  connectionMode: 'Docker Socket (/var/run/docker.sock)',
};
export const mockRecentActivity: ActivityEvent[] = [
  { id: '1', timestamp: '2023-10-27T10:00:00Z', type: 'container', action: 'started', message: 'Container "web-server-prod" started' },
  { id: '2', timestamp: '2023-10-27T09:30:00Z', type: 'image', action: 'pulled', message: 'Image "nginx:1.25-alpine" pulled successfully' },
  { id: '3', timestamp: '2023-10-27T09:00:00Z', type: 'container', action: 'stopped', message: 'Container "worker-jobs" exited with code 0' },
  { id: '4', timestamp: '2023-10-26T18:00:00Z', type: 'volume', action: 'created', message: 'Volume "new_data_volume" created' },
];
export const mockHosts: Host[] = [
    { id: 'docker-local', name: 'Docker Local', environment: 'local' },
    { id: 'prod-cluster-1', name: 'prod-cluster-1', environment: 'prod' },
    { id: 'staging-server', name: 'staging-server', environment: 'staging' },
];