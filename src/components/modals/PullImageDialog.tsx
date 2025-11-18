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
export function PullImageDialog() {
  const isOpen = useStore((s) => s.modals.isPullImageOpen);
  const setModalOpen = useStore((s) => s.setModalOpen);
  const handleClose = () => setModalOpen('isPullImageOpen', false);
  const handlePull = () => {
    toast.info('Pulling image... (mock)');
    setTimeout(() => {
      toast.success('Image pulled successfully (mock).');
      handleClose();
    }, 1500);
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handlePull}>Pull</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}