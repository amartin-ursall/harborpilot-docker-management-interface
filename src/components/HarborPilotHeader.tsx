import {
  ChevronDown,
  PlusCircle,
  Power,
  RefreshCw,
  Signal,
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
const getTitleFromPath = (path: string) => {
  if (path === '/') return 'Dashboard';
  const title = path.replace('/', '').replace(/-/g, ' ');
  return title.charAt(0).toUpperCase() + title.slice(1);
};
export function HarborPilotHeader() {
  const location = useLocation();
  const title = getTitleFromPath(location.pathname);
  const showDialog = useStore((s) => s.showDialog);
  const pruneSystem = useStore((s) => s.pruneSystem);
  const handlePruneSystem = () => {
    showDialog({
      title: 'Prune System?',
      description: 'This will remove all stopped containers, dangling images, and unused networks and volumes. This action is irreversible.',
      onConfirm: pruneSystem,
    });
  };
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <MobileSidebar />
      <h1 className="hidden md:block text-2xl font-semibold text-foreground">{title}</h1>
      <div className="ml-auto flex items-center gap-4">
        <Select defaultValue="docker-local">
          <SelectTrigger className="w-[200px] hidden sm:flex">
            <SelectValue placeholder="Select host" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="docker-local">Docker Local</SelectItem>
            <SelectItem value="prod-cluster-1">prod-cluster-1</SelectItem>
            <SelectItem value="staging-server">staging-server</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 text-sm font-medium text-green-500">
          <Signal className="h-4 w-4" />
          <span className="hidden sm:inline">Connected</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <span className="hidden sm:inline">Quick Actions</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Container
            </DropdownMenuItem>
            <DropdownMenuItem>
              <RefreshCw className="mr-2 h-4 w-4" />
              Pull Image
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={handlePruneSystem}
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