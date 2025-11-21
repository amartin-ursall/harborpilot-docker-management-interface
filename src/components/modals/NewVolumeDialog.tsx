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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
export function NewVolumeDialog() {
  const isOpen = useStore((s) => s.modals.isNewVolumeOpen);
  const setModalOpen = useStore((s) => s.setModalOpen);
  const fetchVolumes = useStore((s) => s.fetchVolumes);
  const [name, setName] = useState('');
  const [driver, setDriver] = useState('local');
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDriver('local');
      setIsSubmitting(false);
    }
  }, [isOpen]);
  const handleClose = () => setModalOpen('isNewVolumeOpen', false);
  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Volume name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createVolume({ name: name.trim(), driver });
      await fetchVolumes();
      toast.success('Volume created successfully.');
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to create volume');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Volume</DialogTitle>
          <DialogDescription>
            Create a new volume to persist data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="volume-name" className="text-right">
              Name
            </Label>
            <Input
              id="volume-name"
              placeholder="e.g., my-data-volume"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driver" className="text-right">
              Driver
            </Label>
            <Select value={driver} onValueChange={setDriver}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">local</SelectItem>
                <SelectItem value="cifs">cifs</SelectItem>
                <SelectItem value="nfs">nfs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
