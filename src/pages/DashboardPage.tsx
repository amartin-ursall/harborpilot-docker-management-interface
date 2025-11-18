import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStore } from '@/hooks/useStore';
import {
  Container,
  Database,
  HardDrive,
  Image as ImageIcon,
  Network,
  Cpu,
  MemoryStick,
  Server,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  FileText,
  PlusCircle,
  Power,
  Download,
  Activity,
  Info,
  Clock,
  ShieldCheck,
  Dot,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
const summaryCards = [
  {
    title: 'Containers',
    icon: Container,
    to: '/containers',
    getValue: (summary: any) => `${summary.containers.running} / ${summary.containers.total}`,
    description: (summary: any) => (
      <div className="flex items-center gap-2 text-xs">
        <span className="flex items-center text-green-500"><Dot />{summary.containers.running} running</span>
        <span className="flex items-center text-gray-500"><Dot />{summary.containers.exited} exited</span>
        <span className="flex items-center text-yellow-500"><Dot />{summary.containers.paused} paused</span>
      </div>
    ),
  },
  {
    title: 'Images',
    icon: ImageIcon,
    to: '/images',
    getValue: (summary: any) => summary.images,
    description: () => 'Total Images',
  },
  {
    title: 'Volumes',
    icon: Database,
    to: '/volumes',
    getValue: (summary: any) => summary.volumes,
    description: () => 'Total Volumes',
  },
  {
    title: 'Networks',
    icon: Network,
    to: '/networks',
    getValue: (summary: any) => summary.networks,
    description: () => 'Total Networks',
  },
];
export function DashboardPage() {
  const summary = useStore((s) => s.summary);
  const hostStats = useStore((s) => s.hostStats);
  const resourceUsage = useStore((s) => s.resourceUsage);
  const alerts = useStore((s) => s.alerts);
  const hostDetails = useStore((s) => s.hostDetails);
  const recentActivity = useStore((s) => s.recentActivity);
  const pruneSystem = useStore((s) => s.pruneSystem);
  const selectContainerAndOpenDetails = useStore((s) => s.selectContainerAndOpenDetails);
  const setImageDisplayFilter = useStore((s) => s.setImageDisplayFilter);
  const setModalOpen = useStore((s) => s.setModalOpen);
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('1h');
  const chartConfig = {
    cpu: { label: 'CPU Usage (%)', color: 'hsl(var(--primary))' },
    memory: { label: 'Memory Usage (%)', color: 'hsl(var(--chart-2))' },
  };
  const handleAlertClick = (alert) => {
    if (alert.containerId) {
      selectContainerAndOpenDetails(alert.containerId, 'logs');
    } else if (alert.action === 'view_dangling_images') {
      setImageDisplayFilter('dangling');
      navigate('/images');
    }
  };
  return (
    <div className="max-w-full mx-auto animate-fade-in">
      <div className="py-8 md:py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <Link to={card.to} key={card.title}>
              <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                  <card.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{card.getValue(summary)}</div>
                  <div className="text-xs text-muted-foreground">{card.description(summary)}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
        <section className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" /> Host Resources</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <ResourceStat icon={Cpu} title="CPU Usage" value={`${hostStats.cpuUsage}%`} />
                  <ResourceStat icon={MemoryStick} title="Memory" value={`${hostStats.memoryUsage} / ${hostStats.memoryTotal} GB`} />
                  <ResourceStat icon={HardDrive} title="Disk Usage" value={`${hostStats.diskUsage} / ${hostStats.diskTotal} GB`} />
                  <ResourceStat icon={ArrowDown} title="Network Ingress" value={`${hostStats.networkIngress} MB/s`} />
                  <ResourceStat icon={ArrowUp} title="Network Egress" value={`${hostStats.networkEgress} MB/s`} />
                </div>
                <div className="mt-6 border-t pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <HostDetailItem icon={Info} label="Hostname" value={hostDetails.hostname} />
                    <HostDetailItem icon={ShieldCheck} label="OS" value={hostDetails.os} />
                    <HostDetailItem icon={Container} label="Docker Version" value={hostDetails.dockerVersion} />
                    <HostDetailItem icon={Clock} label="Uptime" value={hostDetails.uptime} />
                    <HostDetailItem icon={Network} label="Connection" value={hostDetails.connectionMode} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Resource Utilization</CardTitle>
                <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value)} size="sm">
                  <ToggleGroupItem value="5m">5m</ToggleGroupItem>
                  <ToggleGroupItem value="1h">1h</ToggleGroupItem>
                  <ToggleGroupItem value="24h">24h</ToggleGroupItem>
                </ToggleGroup>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer>
                    <ChartContainer config={chartConfig}>
                      <AreaChart data={resourceUsage}>
                        <defs>
                          <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient>
                          <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/><stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                        <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} content={<ChartTooltipContent indicator="dot" />} />
                        <Legend />
                        <Area type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCpu)" name="CPU Usage (%)" />
                        <Area type="monotone" dataKey="memory" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorMemory)" name="Memory Usage (%)" />
                      </AreaChart>
                    </ChartContainer>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <Card>
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => setModalOpen('isNewContainerOpen', true)}><PlusCircle className="mr-2 h-4 w-4" /> New Container</Button>
                <Button variant="outline" onClick={() => setModalOpen('isPullImageOpen', true)}><Download className="mr-2 h-4 w-4" /> Pull Image</Button>
                <Button variant="destructive" onClick={pruneSystem}><Power className="mr-2 h-4 w-4" /> Prune System</Button>
                <Button variant="outline" onClick={() => navigate('/logs')}><FileText className="mr-2 h-4 w-4" /> Global Logs</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> Problems / Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {alerts.map(alert => (
                  <button key={alert.id} onClick={() => handleAlertClick(alert)} className="w-full text-left p-3 rounded-lg border transition-colors hover:bg-accent/50" disabled={!alert.containerId && !alert.action}>
                    <div className={cn(alert.severity === 'critical' ? 'border-red-500/50 bg-red-500/10' : 'border-yellow-500/50 bg-yellow-500/10', 'p-3 rounded-lg')}>
                      <p className={cn('font-semibold', alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-600')}>{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Activity /> Recent Activity</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map(event => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="bg-accent rounded-full p-2 mt-1"><Activity className="h-4 w-4 text-accent-foreground" /></div>
                    <div>
                      <p className="text-sm font-medium">{event.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
function ResourceStat({ icon: Icon, title, value }: { icon: React.ElementType; title: string; value: string }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-accent/50">
      <Icon className="h-7 w-7 text-primary" />
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-md font-semibold">{value}</p>
      </div>
    </div>
  );
}
function HostDetailItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium truncate">{value}</p>
      </div>
    </div>
  );
}