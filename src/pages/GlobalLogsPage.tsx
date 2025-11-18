import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/hooks/useStore';
import { Container, LogEntry } from '@/lib/types';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
// Enhanced mock log generation for more variety
const generateMockLog = (container: Container): LogEntry => {
  const levels: LogEntry['level'][] = ['info', 'warn', 'error'];
  const messages = [
    'Processing request GET /api/users',
    'Database connection successful',
    'User authenticated successfully',
    'Failed to connect to upstream service',
    'High memory usage detected',
    'Request timeout on POST /api/data',
  ];
  return {
    timestamp: new Date().toISOString(),
    message: `[${container.name}] ${messages[Math.floor(Math.random() * messages.length)]}`,
    level: levels[Math.floor(Math.random() * levels.length)],
  };
};
export function GlobalLogsPage() {
  const allContainers = useStore((state) => state.containers);
  const [selectedContainers, setSelectedContainers] = useState<Container[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  useEffect(() => {
    if (!isStreaming || selectedContainers.length === 0) {
      return;
    }
    const interval = setInterval(() => {
      const randomContainer = selectedContainers[Math.floor(Math.random() * selectedContainers.length)];
      const newLog = generateMockLog(randomContainer);
      setLogs((prevLogs) => [...prevLogs, newLog].slice(-200)); // Keep last 200 logs
    }, 1500);
    return () => clearInterval(interval);
  }, [isStreaming, selectedContainers]);
  const filteredLogs = useMemo(() => {
    return logs.filter((log) =>
      log.message.toLowerCase().includes(filter.toLowerCase())
    );
  }, [logs, filter]);
  return (
    <div className="max-w-full mx-auto animate-fade-in">
      <div className="py-8 md:py-10 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <CardTitle>Global Logs</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <ContainerMultiSelect
                  allContainers={allContainers}
                  selectedContainers={selectedContainers}
                  setSelectedContainers={setSelectedContainers}
                />
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter logs..."
                    className="pl-9"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </div>
                <Button onClick={() => setIsStreaming(!isStreaming)} variant="outline">
                  {isStreaming ? 'Pause' : 'Resume'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] bg-muted/50 rounded-lg p-4 border">
              <div className="font-mono text-xs space-y-2">
                {filteredLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={cn({
                        'text-red-400': log.level === 'error',
                        'text-yellow-400': log.level === 'warn',
                      })}
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    {selectedContainers.length === 0
                      ? 'Select containers to start streaming logs.'
                      : 'No logs to display. Waiting for new entries...'}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function ContainerMultiSelect({
  allContainers,
  selectedContainers,
  setSelectedContainers,
}: {
  allContainers: Container[];
  selectedContainers: Container[];
  setSelectedContainers: (containers: Container[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const handleSelect = (container: Container) => {
    const isSelected = selectedContainers.some((c) => c.id === container.id);
    if (isSelected) {
      setSelectedContainers(
        selectedContainers.filter((c) => c.id !== container.id)
      );
    } else {
      setSelectedContainers([...selectedContainers, container]);
    }
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between"
        >
          <span className="truncate">
            {selectedContainers.length > 0
              ? `${selectedContainers.length} container(s) selected`
              : 'Select containers...'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search containers..." />
          <CommandList>
            <CommandEmpty>No containers found.</CommandEmpty>
            <CommandGroup>
              {allContainers.map((container) => (
                <CommandItem
                  key={container.id}
                  onSelect={() => handleSelect(container)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedContainers.some((c) => c.id === container.id)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {container.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}