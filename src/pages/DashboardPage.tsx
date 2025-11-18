import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
const summaryCards = [
  {
    title: 'Containers',
    icon: Container,
    getValue: (summary: any) => `${summary.containers.running} / ${summary.containers.total}`,
    description: 'Running / Total',
  },
  {
    title: 'Images',
    icon: ImageIcon,
    getValue: (summary: any) => summary.images,
    description: 'Total Images',
  },
  {
    title: 'Volumes',
    icon: Database,
    getValue: (summary: any) => summary.volumes,
    description: 'Total Volumes',
  },
  {
    title: 'Networks',
    icon: Network,
    getValue: (summary: any) => summary.networks,
    description: 'Total Networks',
  },
];
export function DashboardPage() {
  const summary = useStore((s) => s.summary);
  const hostStats = useStore((s) => s.hostStats);
  const resourceUsage = useStore((s) => s.resourceUsage);
  const chartConfig = {
    cpu: {
      label: 'CPU Usage (%)',
      color: 'hsl(var(--primary))',
    },
    memory: {
      label: 'Memory Usage (%)',
      color: 'hsl(var(--chart-2))',
    },
  };
  return (
    <div className="max-w-full mx-auto animate-fade-in">
      <div className="py-8 md:py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        <section>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <Card key={card.title} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <card.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{card.getValue(summary)}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" /> Host Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <ResourceStat icon={Cpu} title="CPU Usage" value={`${hostStats.cpuUsage}%`} />
                <ResourceStat icon={MemoryStick} title="Memory" value={`${hostStats.memoryUsage} / ${hostStats.memoryTotal} GB`} />
                <ResourceStat icon={HardDrive} title="Disk Usage" value={`${hostStats.diskUsage} / ${hostStats.diskTotal} GB`} />
                <ResourceStat icon={ArrowDown} title="Network Ingress" value={`${hostStats.networkIngress} MB/s`} />
                <ResourceStat icon={ArrowUp} title="Network Egress" value={`${hostStats.networkEgress} MB/s`} />
              </div>
            </CardContent>
          </Card>
        </section>
        <section>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Resource Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer>
                  <ChartContainer config={chartConfig}>
                    <AreaChart data={resourceUsage}>
                      <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--accent))' }}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCpu)" name="CPU Usage (%)" />
                      <Area type="monotone" dataKey="memory" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorMemory)" name="Memory Usage (%)" />
                    </AreaChart>
                  </ChartContainer>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
function ResourceStat({ icon: Icon, title, value }: { icon: React.ElementType; title: string; value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/50">
      <Icon className="h-8 w-8 text-primary" />
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}