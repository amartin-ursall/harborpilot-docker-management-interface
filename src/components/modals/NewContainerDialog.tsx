import { useEffect, useState } from 'react';
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
import { PlusCircle, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
export function NewContainerDialog() {
  const isOpen = useStore((s) => s.modals.isNewContainerOpen);
  const setModalOpen = useStore((s) => s.setModalOpen);
  const fetchContainers = useStore((s) => s.fetchContainers);
  const fetchOverview = useStore((s) => s.fetchOverview);
  const [step, setStep] = useState(1);
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');
  const [ports, setPorts] = useState([{ host: '', container: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handlePortChange = (index: number, field: 'host' | 'container', value: string) => {
    const newPorts = [...ports];
    newPorts[index][field] = value;
    setPorts(newPorts);
  };
  const addPortMapping = () => {
    setPorts([...ports, { host: '', container: '' }]);
  };
  const removePortMapping = (index: number) => {
    const newPorts = ports.filter((_, i) => i !== index);
    setPorts(newPorts);
  };
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setImage('');
      setName('');
      setCommand('');
      setPorts([{ host: '', container: '' }]);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setModalOpen('isNewContainerOpen', false);
  };
  const handleCreate = async () => {
    if (!image.trim()) {
      toast.error('Image is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const portMappings = ports
        .filter((port) => port.container)
        .map((port) => ({
          hostPort: port.host,
          containerPort: port.container,
          protocol: 'tcp',
        }));
      await api.createContainer({
        image: image.trim(),
        name: name.trim() || undefined,
        ports: portMappings,
        command: command.trim() || undefined,
        start: true,
      });
      await Promise.all([fetchContainers(), fetchOverview()]);
      toast.success('Container created successfully.');
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to create container');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Container</DialogTitle>
          <DialogDescription>
            Configure and launch a new Docker container. Step {step} of 2.
          </DialogDescription>
        </DialogHeader>
        {step === 1 && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">Image</Label>
              <Input
                id="image"
                placeholder="e.g., nginx:latest"
                className="col-span-3"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                placeholder="e.g., my-web-server"
                className="col-span-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="command" className="text-right">Command</Label>
              <Input
                id="command"
                placeholder="Optional command override"
                className="col-span-3"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
              />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="py-4 space-y-4">
            <div>
              <Label>Port Mappings (Host:Container)</Label>
              <div className="space-y-2 mt-2">
                {ports.map((port, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input placeholder="8080" value={port.host} onChange={(e) => handlePortChange(index, 'host', e.target.value)} />
                    <span>:</span>
                    <Input placeholder="80" value={port.container} onChange={(e) => handlePortChange(index, 'container', e.target.value)} />
                    <Button variant="ghost" size="icon" onClick={() => removePortMapping(index)} disabled={ports.length === 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-2" onClick={addPortMapping}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Port
              </Button>
            </div>
          </div>
        )}
        <DialogFooter>
          {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < 2 && <Button onClick={() => setStep(step + 1)}>Next</Button>}
          {step === 2 && (
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Container'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
