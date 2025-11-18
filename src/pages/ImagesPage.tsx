import {
  Download,
  Trash2,
  MoreVertical,
  Search,
  Info,
  Layers,
  Power,
  Container,
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
import { useEffect } from 'react';
export function ImagesPage() {
  const images = useStore((s) => s.images);
  const fetchImages = useStore.getState().fetchImages;
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);
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
                  <Input placeholder="Search images..." className="pl-9" />
                </div>
                <Button><Download className="mr-2 h-4 w-4" /> Pull Image</Button>
                <Button variant="destructive"><Power className="mr-2 h-4 w-4" /> Prune</Button>
              </div>
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
                  {images.map((image) => (
                    <ImageRow key={image.id} image={image} />
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
function ImageRow({ image }: { image: DockerImage }) {
  const isDangling = image.name === '<none>';
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
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}