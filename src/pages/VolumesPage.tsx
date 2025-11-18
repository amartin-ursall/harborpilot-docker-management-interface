import {
  Trash2,
  MoreVertical,
  Search,
  Info,
  PlusCircle,
  Database,
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
import { DockerVolume } from '@/lib/types';
import { useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
export function VolumesPage() {
  const volumes = useStore((s) => s.volumes);
  const volumeFilter = useStore((s) => s.volumeFilter);
  const setVolumeFilter = useStore((s) => s.setVolumeFilter);
  const fetchVolumes = useStore.getState().fetchVolumes;
  const isFetchingVolumes = useStore((s) => s.isFetchingVolumes);
  useEffect(() => {
    fetchVolumes();
  }, [fetchVolumes]);
  const filteredVolumes = useMemo(() => {
    const filter = volumeFilter.toLowerCase();
    if (!filter) return volumes;
    return volumes.filter(v => v.name.toLowerCase().includes(filter));
  }, [volumes, volumeFilter]);
  return (
    <div className="max-w-full mx-auto animate-fade-in">
      <div className="py-8 md:py-10 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle>Volumes</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search volumes..."
                    className="pl-9"
                    value={volumeFilter}
                    onChange={(e) => setVolumeFilter(e.target.value)}
                  />
                </div>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> New Volume</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>In Use By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFetchingVolumes ? (
                    Array.from({ length: 4 }).map((_, i) => <VolumeRowSkeleton key={i} />)
                  ) : filteredVolumes.length > 0 ? (
                    filteredVolumes.map((volume) => (
                      <VolumeRow key={volume.name} volume={volume} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyState
                          icon={Database}
                          title="No volumes found"
                          description="Create a volume to persist data for your containers."
                          action={{ label: 'New Volume', onClick: () => {} }}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function VolumeRow({ volume }: { volume: DockerVolume }) {
  const showDialog = useStore((s) => s.showDialog);
  const deleteVolume = useStore((s) => s.deleteVolume);
  const handleDelete = () => {
    showDialog({
      title: `Delete Volume: ${volume.name}?`,
      description: `This action is irreversible and will permanently delete all data stored in this volume. Are you sure you want to proceed?`,
      onConfirm: () => {
        deleteVolume(volume.name);
        toast.success(`Volume "${volume.name}" deleted successfully.`);
      },
    });
  };
  return (
    <TableRow className="hover:bg-accent transition-colors">
      <TableCell className="font-medium font-mono text-sm">{volume.name}</TableCell>
      <TableCell className="text-muted-foreground">{volume.driver}</TableCell>
      <TableCell className="text-muted-foreground">{volume.size}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {volume.containersInUse.length > 0 ? (
            volume.containersInUse.map(c => <Badge key={c} variant="secondary">{c}</Badge>)
          ) : (
            <span className="text-xs text-muted-foreground">Not in use</span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Info className="mr-2 h-4 w-4" /> Inspect</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
function VolumeRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
    </TableRow>
  );
}