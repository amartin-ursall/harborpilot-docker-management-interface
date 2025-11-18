import {
  Play,
  StopCircle,
  RefreshCw,
  Trash2,
  MoreVertical,
  Search,
  FileText,
  Terminal,
  Info,
  Pause,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useStore } from '@/hooks/useStore';
import { Container, ContainerStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ContainerDetailsSheet } from '@/components/ContainerDetailsSheet';
import { useMemo } from 'react';
import { toast } from 'sonner';
const statusStyles: { [key in ContainerStatus]: string } = {
  running: 'bg-green-500/20 text-green-500 border-green-500/30',
  exited: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
  paused: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  restarting: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  created: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
};
export function ContainersPage() {
  const containers = useStore((s) => s.containers);
  const containerFilter = useStore((s) => s.containerFilter);
  const setContainerFilter = useStore((s) => s.setContainerFilter);
  const filteredContainers = useMemo(() => {
    const filter = containerFilter.toLowerCase();
    if (!filter) return containers;
    return containers.filter(c =>
      c.name.toLowerCase().includes(filter) ||
      c.image.toLowerCase().includes(filter) ||
      c.id.toLowerCase().includes(filter)
    );
  }, [containers, containerFilter]);
  return (
    <div className="max-w-full mx-auto animate-fade-in">
      <div className="py-8 md:py-10 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle>Containers</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search containers..."
                    className="pl-9"
                    value={containerFilter}
                    onChange={(e) => setContainerFilter(e.target.value)}
                  />
                </div>
                <Button>+ New Container</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Ports</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContainers.map((container) => (
                    <ContainerRow key={container.id} container={container} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <ContainerDetailsSheet />
    </div>
  );
}
function ContainerRow({ container }: { container: Container }) {
  const selectContainer = useStore((s) => s.selectContainer);
  const setDetailsPanelOpen = useStore((s) => s.setDetailsPanelOpen);
  const showDialog = useStore((s) => s.showDialog);
  const deleteContainer = useStore((s) => s.deleteContainer);
  const toggleContainerStatus = useStore((s) => s.toggleContainerStatus);
  const handleOpenDetails = () => {
    selectContainer(container.id);
    setDetailsPanelOpen(true);
  };
  const handleDelete = () => {
    showDialog({
      title: `Delete Container: ${container.name}?`,
      description: `This action is irreversible. The container and its associated data may be lost. Are you sure you want to proceed?`,
      onConfirm: () => {
        deleteContainer(container.id);
        toast.success(`Container "${container.name}" deleted successfully.`);
      },
    });
  };
  const handleStatusToggle = (status: ContainerStatus) => {
    toggleContainerStatus(container.id, status);
    toast.success(`Container "${container.name}" is now ${status}.`);
  };
  return (
    <TableRow className="hover:bg-accent transition-colors">
      <TableCell>
        <Badge
          variant="outline"
          className={cn('capitalize', statusStyles[container.status])}
        >
          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: 'currentColor' }}></span>
          {container.status}
        </Badge>
      </TableCell>
      <TableCell className="font-medium font-mono text-sm">
        <button onClick={handleOpenDetails} className="hover:underline">
          {container.name}
        </button>
      </TableCell>
      <TableCell className="text-muted-foreground">{container.image}</TableCell>
      <TableCell>
        {container.ports
          .map((p) => `${p.publicPort}:${p.privatePort}`)
          .join(', ')}
      </TableCell>
      <TableCell className="text-muted-foreground">{container.uptime}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <TooltipProvider>
            <ActionIcon action="start" icon={Play} onClick={() => handleStatusToggle('running')} />
            <ActionIcon action="stop" icon={StopCircle} onClick={() => handleStatusToggle('exited')} />
            <ActionIcon action="restart" icon={RefreshCw} onClick={() => handleStatusToggle('restarting')} />
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpenDetails}><FileText className="mr-2 h-4 w-4" /> Logs</DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenDetails}><Terminal className="mr-2 h-4 w-4" /> Console</DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenDetails}><Info className="mr-2 h-4 w-4" /> Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusToggle('paused')}><Pause className="mr-2 h-4 w-4" /> Pause</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
function ActionIcon({ action, icon: Icon, onClick }: { action: string; icon: React.ElementType; onClick: () => void; }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClick}>
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="capitalize">{action}</p>
      </TooltipContent>
    </Tooltip>
  );
}