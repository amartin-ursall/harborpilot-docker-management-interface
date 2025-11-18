import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useStore } from '@/hooks/useStore';
import {
  mockContainerDetails,
  mockContainerEvents,
  mockContainerInspect,
  mockContainerLogs,
} from '@/lib/mockData';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Play, RefreshCw, StopCircle, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ContainerStatus, LogEntry } from '@/lib/types';
import { toast } from 'sonner';
export function ContainerDetailsSheet() {
  const isDetailsPanelOpen = useStore((s) => s.isDetailsPanelOpen);
  const setDetailsPanelOpen = useStore((s) => s.setDetailsPanelOpen);
  const selectedContainer = useStore((s) => s.selectedContainer);
  if (!selectedContainer) return null;
  return (
    <Sheet open={isDetailsPanelOpen} onOpenChange={setDetailsPanelOpen}>
      <SheetContent className="w-full sm:w-3/4 lg:w-2/3 xl:w-1/2 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-2xl font-bold truncate">{selectedContainer.name}</SheetTitle>
          <SheetDescription>
            ID: {selectedContainer.id}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="console">Console</TabsTrigger>
              <TabsTrigger value="inspect">Inspect</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="overview" className="p-6 space-y-6">
                <OverviewTab />
              </TabsContent>
              <TabsContent value="logs" className="p-6 h-full">
                <LogsTab />
              </TabsContent>
              <TabsContent value="console" className="p-6">
                <ConsoleTab />
              </TabsContent>
              <TabsContent value="inspect" className="p-6">
                <InspectTab />
              </TabsContent>
              <TabsContent value="events" className="p-6">
                <EventsTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
function OverviewTab() {
  const container = useStore((s) => s.selectedContainer);
  const toggleContainerStatus = useStore((s) => s.toggleContainerStatus);
  const deleteContainer = useStore((s) => s.deleteContainer);
  const showDialog = useStore((s) => s.showDialog);
  const setDetailsPanelOpen = useStore((s) => s.setDetailsPanelOpen);
  if (!container) return null;
  const handleStatusToggle = (status: ContainerStatus) => {
    toggleContainerStatus(container.id, status);
    toast.success(`Container "${container.name}" is now ${status}.`);
  };
  const handleDelete = () => {
    showDialog({
      title: `Delete Container: ${container.name}?`,
      description: `This action is irreversible. The container and its associated data may be lost. Are you sure you want to proceed?`,
      onConfirm: () => {
        deleteContainer(container.id);
        setDetailsPanelOpen(false);
        toast.success(`Container "${container.name}" deleted successfully.`);
      },
    });
  };
  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => handleStatusToggle('running')}><Play className="mr-2 h-4 w-4" /> Start</Button>
        <Button variant="outline" size="sm" onClick={() => handleStatusToggle('exited')}><StopCircle className="mr-2 h-4 w-4" /> Stop</Button>
        <Button variant="outline" size="sm" onClick={() => handleStatusToggle('restarting')}><RefreshCw className="mr-2 h-4 w-4" /> Restart</Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard title="Status" value={container.status} />
        <InfoCard title="Image" value={container.image} />
        <InfoCard title="Uptime" value={container.uptime} />
        <InfoCard title="Restart Policy" value={container.restartPolicy} />
      </div>
      <InfoSection title="Port Mappings">
        {container.ports.map(p => (
          <div key={p.privatePort}>{`${p.publicPort}:${p.privatePort}/${p.type}`}</div>
        ))}
      </InfoSection>
      <InfoSection title="Environment Variables">
        <div className="font-mono text-xs space-y-1">
          {Object.entries(container.environment).map(([key, value]) => (
            <div key={key} className="truncate"><span className="text-muted-foreground">{key}=</span>{value}</div>
          ))}
        </div>
      </InfoSection>
    </>
  );
}
function LogsTab() {
  const [logs, setLogs] = useState<LogEntry[]>(mockContainerLogs);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        message: `[${new Date().toLocaleTimeString()}] Simulated log entry.`,
        level: 'info'
      }]);
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="h-full flex flex-col bg-muted/50 rounded-lg">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Container Logs</h3>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="font-mono text-xs space-y-2">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : ''}>{log.message}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
function ConsoleTab() {
  return (
    <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-96 flex flex-col">
      <div className="flex-1">
        <p># This is a mock console. An interactive terminal would be implemented here.</p>
        <p># root@a1b2c3d4e5f6:/app$ ls -l</p>
        <p>total 8</p>
        <p>-rw-r--r-- 1 root root 1234 Oct 27 10:00 index.js</p>
        <p>drwxr-xr-x 2 root root 4096 Oct 24 09:00 node_modules</p>
        <p>root@a1b2c3d4e5f6:/app$</p>
      </div>
      <div className="flex items-center">
        <span>$</span>
        <input type="text" className="bg-transparent border-none focus:ring-0 w-full ml-2" />
      </div>
    </div>
  );
}
function InspectTab() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Docker Inspect</h3>
      <ScrollArea className="h-[600px] bg-muted/50 p-4 rounded-lg">
        <pre className="text-xs font-mono">{JSON.stringify(mockContainerInspect, null, 2)}</pre>
      </ScrollArea>
    </div>
  );
}
function EventsTab() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Container Events</h3>
      <div className="space-y-4">
        {mockContainerEvents.map((event, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="text-xs text-muted-foreground whitespace-nowrap pt-1">{new Date(event.timestamp).toLocaleString()}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{event.status}</Badge>
              <p className="text-sm">{event.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-lg font-semibold capitalize">{value}</p>
    </div>
  );
}
function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-md font-semibold mb-2">{title}</h4>
      <div className="bg-muted/50 p-4 rounded-lg text-sm">{children}</div>
    </div>
  );
}