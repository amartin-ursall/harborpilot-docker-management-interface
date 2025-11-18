import { NavLink } from 'react-router-dom';
import { Ship } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { navItems } from '@/lib/nav-items';
export function HarborPilotSidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-card border-r border-border fixed h-full">
      <div className="flex items-center h-16 px-6 border-b">
        <Ship className="h-8 w-8 text-primary" />
        <h1 className="ml-3 text-xl font-bold text-foreground">HarborPilot</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
      <div className="px-6 py-4 border-t text-xs text-muted-foreground">
        <p>Built with ❤️ at Cloudflare</p>
      </div>
    </aside>
  );
}