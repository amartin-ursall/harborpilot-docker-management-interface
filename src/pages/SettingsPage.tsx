import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/use-theme';
import { MoreVertical, PlusCircle, Trash2, Edit, TestTube2 } from 'lucide-react';
const mockConnections = [
  {
    name: 'Docker Local',
    url: 'unix:///var/run/docker.sock',
    status: 'Connected',
  },
  {
    name: 'prod-cluster-1',
    url: 'tcp://192.168.1.100:2376',
    status: 'Disconnected',
  },
  {
    name: 'staging-server',
    url: 'ssh://user@staging.example.com',
    status: 'Connected',
  },
];
export function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div className="max-w-full mx-auto animate-fade-in">
      <div className="py-8 md:py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Docker Host Connections</CardTitle>
                <CardDescription>
                  Manage your connections to Docker daemons.
                </CardDescription>
              </div>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Connection
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockConnections.map((conn) => (
                  <TableRow key={conn.name}>
                    <TableCell className="font-medium">{conn.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{conn.url}</TableCell>
                    <TableCell
                      className={
                        conn.status === 'Connected'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }
                    >
                      {conn.status}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><TestTube2 className="mr-2 h-4 w-4" /> Test Connection</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Application Preferences</CardTitle>
            <CardDescription>
              Customize the look and feel of HarborPilot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                <span>Dark Mode</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Toggle between light and dark themes.
                </span>
              </Label>
              <Switch
                id="dark-mode"
                checked={isDark}
                onCheckedChange={toggleTheme}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="refresh-interval" className="flex flex-col space-y-1">
                <span>UI Refresh Interval</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  How often to refresh data like container stats.
                </span>
              </Label>
              <Select defaultValue="5">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="0">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}