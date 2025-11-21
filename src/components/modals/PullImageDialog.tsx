import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/hooks/useStore';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
export function PullImageDialog() {
  const isOpen = useStore((s) => s.modals.isPullImageOpen);
  const setModalOpen = useStore((s) => s.setModalOpen);
  const fetchImages = useStore((s) => s.fetchImages);
  const [reference, setReference] = useState('');
  const [isPulling, setIsPulling] = useState(false);
  useEffect(() => {
    if (!isOpen) {
      setReference('');
      setIsPulling(false);
    }
  }, [isOpen]);
  const handleClose = () => setModalOpen('isPullImageOpen', false);
  const handlePull = async () => {
    if (!reference.trim()) {
      toast.error('Image reference is required');
      return;
    }
    setIsPulling(true);
    try {
      await api.pullImage(reference.trim());
      await fetchImages();
      toast.success('Image pulled successfully.');
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to pull image');
    } finally {
      setIsPulling(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pull Image</DialogTitle>
          <DialogDescription>
            Pull an image from a public or private registry.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image-name" className="text-right">
              Image
            </Label>
            <Input
              id="image-name"
              placeholder="e.g., ubuntu:22.04"
              className="col-span-3"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handlePull} disabled={isPulling}>
            {isPulling ? 'Pulling…' : 'Pull'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
