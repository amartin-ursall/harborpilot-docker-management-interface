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
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Play, RefreshCw, StopCircle, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ContainerEvent, ContainerStatus, LogEntry } from '@/lib/types';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Skeleton } from './ui/skeleton';

export function ContainerDetailsSheet() {
  const isDetailsPanelOpen = useStore((s) => s.isDetailsPanelOpen);
  const setDetailsPanelOpen = useStore((s) => s.setDetailsPanelOpen);
  const selectedContainer = useStore((s) => s.selectedContainer);
  const isLoadingDetails = useStore((s) => s.isLoadingContainerDetails);
  const detailsSheetDefaultTab = useStore((s) => s.detailsSheetDefaultTab);
  const setDetailsSheetDefaultTab = useStore((s) => s.setDetailsSheetDefaultTab);

  if (!selectedContainer) return null;

  return (
    <Sheet open={isDetailsPanelOpen} onOpenChange={setDetailsPanelOpen}>
      <SheetContent className="w-full sm:w-3/4 lg:w-2/3 xl:w-1/2 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-2xl font-bold truncate">{selectedContainer.name}</SheetTitle>
          <SheetDescription>ID: {selectedContainer.id}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          {isLoadingDetails ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground text-sm">Loading container details…</div>
            </div>
          ) : (
            <Tabs
              value={detailsSheetDefaultTab}
              onValueChange={setDetailsSheetDefaultTab}
              className="h-full flex flex-col"
            >
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
          )}
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
  };
  const handleDelete = () => {
    showDialog({
      title: `Delete Container: ${container.name}?`,
      description:
        'This action is irreversible. The container and its associated data may be lost. Are you sure you want to proceed?',
      onConfirm: async () => {
        await deleteContainer(container.id);
        setDetailsPanelOpen(false);
      },
    });
  };
  return (
    <>
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => handleStatusToggle('running')}>
          <Play className="mr-2 h-4 w-4" /> Start
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleStatusToggle('exited')}>
          <StopCircle className="mr-2 h-4 w-4" /> Stop
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleStatusToggle('restarting')}>
          <RefreshCw className="mr-2 h-4 w-4" /> Restart
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard title="Status" value={container.status} />
        <InfoCard title="Image" value={container.image} />
        <InfoCard title="Uptime" value={container.uptime} />
        <InfoCard title="Restart Policy" value={container.restartPolicy} />
      </div>
      <InfoSection title="Port Mappings">
        {container.ports.length > 0 ? (
          container.ports.map((p) => (
            <div key={`${p.privatePort}-${p.publicPort ?? 'none'}`}>
              {p.publicPort ? `${p.publicPort}:${p.privatePort}` : `${p.privatePort}`} / {p.type}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No exposed ports</p>
        )}
      </InfoSection>
      <InfoSection title="Environment Variables">
        {Object.keys(container.environment).length > 0 ? (
          <div className="font-mono text-xs space-y-1">
            {Object.entries(container.environment).map(([key, value]) => (
              <div key={key} className="truncate">
                <span className="text-muted-foreground">{key}=</span>
                {value}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No environment variables provided.</p>
        )}
      </InfoSection>
    </>
  );
}

function LogsTab() {
  const container = useStore((s) => s.selectedContainer);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLogs([]);
  }, [container?.id]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!container) return;
      setIsLoading(true);
      try {
        const entries = await api.getContainerLogs(container.id);
        if (!cancelled) {
          setLogs(entries);
          setTimeout(() => {
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }, 50);
        }
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : 'Failed to load logs');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [container?.id, refreshKey]);

  if (!container) {
    return <div className="text-sm text-muted-foreground">Select a container to view logs.</div>;
  }

  return (
    <div className="h-full flex flex-col bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Container Logs</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefreshKey((key) => key + 1)}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>
      {isLoading && (
        <div className="px-4 py-2 text-xs text-muted-foreground">Streaming latest log entries…</div>
      )}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="font-mono text-xs space-y-2">
          {logs.length === 0 && !isLoading && (
            <div className="text-muted-foreground">No logs available.</div>
          )}
          {logs.map((log, i) => (
            <div key={`${log.timestamp}-${i}`} className="flex gap-4">
              <span className="text-muted-foreground whitespace-nowrap">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function ConsoleTab() {
  const container = useStore((s) => s.selectedContainer);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory([]);
    setInput('');
  }, [container?.id]);

  const runCommand = async () => {
    if (!container || !input.trim()) return;
    const command = input.trim();
    setHistory((prev) => [...prev, `$ ${command}`]);
    setInput('');
    setIsRunning(true);
    try {
      const { output } = await api.executeContainerCommand(container.id, command);
      setHistory((prev) => [...prev, output.trim() || '(no output)']);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Command failed';
      setHistory((prev) => [...prev, `Error: ${message}`]);
    } finally {
      setIsRunning(false);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      }, 50);
    }
  };

  return (
    <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-96 flex flex-col">
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="space-y-2">
          {history.length === 0 && (
            <p className="text-muted-foreground text-xs">
              Type a command and press Enter to run it inside the container.
            </p>
          )}
          {history.map((line, idx) => (
            <div key={`${line}-${idx}`}>{line}</div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex items-center gap-2 mt-4">
        <span>$</span>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              runCommand();
            }
          }}
          disabled={isRunning}
          className="bg-transparent border-none focus-visible:ring-0 text-green-400"
        />
        <Button size="sm" onClick={runCommand} disabled={isRunning || !input.trim()}>
          Run
        </Button>
      </div>
    </div>
  );
}

function InspectTab() {
  const container = useStore((s) => s.selectedContainer);
  if (!container) return null;
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Docker Inspect</h3>
      <ScrollArea className="h-[600px] bg-muted/50 p-4 rounded-lg">
        {container.inspect ? (
          <pre className="text-xs font-mono whitespace-pre-wrap">{JSON.stringify(container.inspect, null, 2)}</pre>
        ) : (
          <p className="text-sm text-muted-foreground">Inspect data is unavailable for this container.</p>
        )}
      </ScrollArea>
    </div>
  );
}

function EventsTab() {
  const container = useStore((s) => s.selectedContainer);
  const [events, setEvents] = useState<ContainerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      if (!container) return;
      setIsLoading(true);
      try {
        const data = await api.getContainerEvents(container.id);
        if (!cancelled) {
          setEvents(data);
        }
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : 'Failed to load events');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, [container?.id]);

  if (!container) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Container Events</h3>
      {isLoading && <Skeleton className="h-12 w-full" />}
      {!isLoading && events.length === 0 && (
        <p className="text-sm text-muted-foreground">No events recorded for this container.</p>
      )}
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.timestamp + event.status} className="flex items-start gap-4">
            <div className="text-xs text-muted-foreground whitespace-nowrap pt-1">
              {new Date(event.timestamp).toLocaleString()}
            </div>
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
