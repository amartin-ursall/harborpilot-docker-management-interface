import {
  Download,
  Trash2,
  MoreVertical,
  Search,
  Info,
  Power,
  Container,
  Image as ImageIcon,
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
import { DockerImage } from '@/lib/types';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
export function ImagesPage() {
  const images = useStore((s) => s.images);
  const imageFilter = useStore((s) => s.imageFilter);
  const setImageFilter = useStore((s) => s.setImageFilter);
  const pruneImages = useStore((s) => s.pruneImages);
  const fetchImages = useStore.getState().fetchImages;
  const isFetchingImages = useStore((s) => s.isFetchingImages);
  const imageDisplayFilter = useStore((s) => s.imageDisplayFilter);
  const setImageDisplayFilter = useStore((s) => s.setImageDisplayFilter);
  const setModalOpen = useStore((s) => s.setModalOpen);
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);
  const filteredImages = useMemo(() => {
    let filtered = images;
    if (imageDisplayFilter === 'dangling') {
      filtered = filtered.filter(i => i.name === '<none>');
    }
    const filter = imageFilter.toLowerCase();
    if (!filter) return filtered;
    return filtered.filter(i =>
      i.name.toLowerCase().includes(filter) ||
      i.tag.toLowerCase().includes(filter) ||
      i.id.toLowerCase().includes(filter)
    );
  }, [images, imageFilter, imageDisplayFilter]);
  return (
    <div className="max-w-full mx-auto animate-fade-in">
      <div className="py-8 md:py-10 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle>Images</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search images..."
                    className="pl-9"
                    value={imageFilter}
                    onChange={(e) => setImageFilter(e.target.value)}
                  />
                </div>
                <Button onClick={() => setModalOpen('isPullImageOpen', true)}><Download className="mr-2 h-4 w-4" /> Pull Image</Button>
                <Button variant="destructive" onClick={pruneImages}><Power className="mr-2 h-4 w-4" /> Prune</Button>
              </div>
            </div>
            <div className="pt-4">
              <ToggleGroup
                type="single"
                value={imageDisplayFilter}
                onValueChange={(value: 'all' | 'dangling') => value && setImageDisplayFilter(value)}
                size="sm"
              >
                <ToggleGroupItem value="all">All</ToggleGroupItem>
                <ToggleGroupItem value="dangling">Dangling</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Image ID</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFetchingImages ? (
                    Array.from({ length: 5 }).map((_, i) => <ImageRowSkeleton key={i} />)
                  ) : filteredImages.length > 0 ? (
                    filteredImages.map((image) => (
                      <ImageRow key={image.id} image={image} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <EmptyState
                          icon={ImageIcon}
                          title="No images found"
                          description="You don't have any images. Try pulling one from a registry."
                          action={{ label: 'Pull Image', onClick: () => setModalOpen('isPullImageOpen', true) }}
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
function ImageRow({ image }: { image: DockerImage }) {
  const isDangling = image.name === '<none>';
  const showDialog = useStore((s) => s.showDialog);
  const deleteImage = useStore((s) => s.deleteImage);
  const handleDelete = () => {
    showDialog({
      title: `Delete Image: ${image.name}:${image.tag}?`,
      description: 'This action is irreversible. If any containers are using this image, they may fail. Are you sure you want to proceed?',
      onConfirm: () => {
        deleteImage(image.id);
        toast.success(`Image "${image.name}:${image.tag}" deleted successfully.`);
      },
    });
  };
  return (
    <TableRow className="hover:bg-accent transition-colors">
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {image.name}
          {isDangling && <Badge variant="destructive">Dangling</Badge>}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{image.tag}</TableCell>
      <TableCell className="font-mono text-sm text-muted-foreground">{image.id}</TableCell>
      <TableCell className="text-muted-foreground">{image.size}</TableCell>
      <TableCell className="text-muted-foreground">{image.created}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Container className="mr-2 h-4 w-4" /> Create Container</DropdownMenuItem>
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
function ImageRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
    </TableRow>
  );
}