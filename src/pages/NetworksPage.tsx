import {
  Trash2,
  MoreVertical,
  Search,
  Info,
  PlusCircle,
} from 'lucide-react';
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
import { DockerNetwork } from '@/lib/types';
import { useEffect } from 'react';
export function NetworksPage() {
  const networks = useStore((s) => s.networks);
  const fetchNetworks = useStore((s) => s.fetchNetworks);
  useEffect(() => {
    fetchNetworks();
  }, [fetchNetworks]);
  return (
    <div className="max-w-full mx-auto animate-fade-in">
      <div className="py-8 md:py-10 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle>Networks</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search networks..." className="pl-9" />
                </div>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> New Network</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {networks.map((network) => (
                    <NetworkRow key={network.id} network={network} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function NetworkRow({ network }: { network: DockerNetwork }) {
  return (
    <TableRow className="hover:bg-accent transition-colors">
      <TableCell className="font-medium">{network.name}</TableCell>
      <TableCell className="font-mono text-sm text-muted-foreground">{network.id.substring(0, 12)}</TableCell>
      <TableCell className="text-muted-foreground">{network.driver}</TableCell>
      <TableCell className="text-muted-foreground">{network.scope}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Info className="mr-2 h-4 w-4" /> Inspect</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}