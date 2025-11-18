import {
  LayoutDashboard,
  Container,
  Image,
  Database,
  Network,
  FileText,
  Settings,
} from 'lucide-react';
export const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/containers', icon: Container, label: 'Containers' },
  { to: '/images', icon: Image, label: 'Images' },
  { to: '/volumes', icon: Database, label: 'Volumes' },
  { to: '/networks', icon: Network, label: 'Networks' },
  { to: '/logs', icon: FileText, label: 'Global Logs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];