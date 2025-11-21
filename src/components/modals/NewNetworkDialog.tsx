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
export function NewNetworkDialog() {
  const isOpen = useStore((s) => s.modals.isNewNetworkOpen);
  const setModalOpen = useStore((s) => s.setModalOpen);
  const fetchNetworks = useStore((s) => s.fetchNetworks);
  const [name, setName] = useState('');
  const [driver, setDriver] = useState('bridge');
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDriver('bridge');
      setIsSubmitting(false);
    }
  }, [isOpen]);
  const handleClose = () => setModalOpen('isNewNetworkOpen', false);
  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Network name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createNetwork({ name: name.trim(), driver });
      await fetchNetworks();
      toast.success('Network created successfully.');
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to create network');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Network</DialogTitle>
          <DialogDescription>
            Create a new network for your containers to communicate.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="network-name" className="text-right">
              Name
            </Label>
            <Input
              id="network-name"
              placeholder="e.g., my-app-net"
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
                <SelectItem value="bridge">bridge</SelectItem>
                <SelectItem value="overlay">overlay</SelectItem>
                <SelectItem value="macvlan">macvlan</SelectItem>
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
