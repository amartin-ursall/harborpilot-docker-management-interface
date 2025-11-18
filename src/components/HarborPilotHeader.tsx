import {
  ChevronDown,
  PlusCircle,
  Power,
  Download,
  Signal,
  SignalZero,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from './ThemeToggle';
import { MobileSidebar } from './MobileSidebar';
import { useStore } from '@/hooks/useStore';
import { mockHosts } from '@/lib/mockData';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
const getTitleFromPath = (path: string) => {
  if (path === '/') return 'Dashboard';
  const title = path.replace('/', '').replace(/-/g, ' ');
  return title.charAt(0).toUpperCase() + title.slice(1);
};
const envColors = {
  local: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  staging: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  prod: 'bg-red-500/20 text-red-500 border-red-500/30',
};
export function HarborPilotHeader() {
  const location = useLocation();
  const title = getTitleFromPath(location.pathname);
  const pruneSystem = useStore((s) => s.pruneSystem);
  const connectionStatus = useStore((s) => s.connectionStatus);
  const lastUpdate = useStore((s) => s.lastUpdate);
  const setModalOpen = useStore((s) => s.setModalOpen);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <MobileSidebar />
      <h1 className="hidden md:block text-2xl font-semibold text-foreground">{title}</h1>
      <div className="ml-auto flex items-center gap-4">
        <Select defaultValue="docker-local">
          <SelectTrigger className="w-[220px] hidden sm:flex">
            <SelectValue placeholder="Select host" />
          </SelectTrigger>
          <SelectContent>
            {mockHosts.map((host) => (
              <SelectItem key={host.id} value={host.id}>
                <div className="flex items-center gap-2">
                  <span>{host.name}</span>
                  <Badge variant="outline" className={cn('capitalize', envColors[host.environment])}>
                    {host.environment}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 text-sm font-medium">
          {connectionStatus === 'connected' ? (
            <>
              <Signal className="h-4 w-4 text-green-500" />
              <span className="hidden sm:inline text-green-500">Connected</span>
            </>
          ) : (
            <>
              <SignalZero className="h-4 w-4 text-red-500" />
              <span className="hidden sm:inline text-red-500">Disconnected</span>
            </>
          )}
          {lastUpdate && (
            <span className="hidden md:inline text-xs text-muted-foreground">
              (updated {formatDistanceToNow(lastUpdate, { addSuffix: true })})
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <span className="hidden sm:inline">Quick Actions</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setModalOpen('isNewContainerOpen', true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Container
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setModalOpen('isPullImageOpen', true)}>
              <Download className="mr-2 h-4 w-4" />
              Pull Image
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={pruneSystem}
            >
              <Power className="mr-2 h-4 w-4" />
              Prune System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </header>
  );
}