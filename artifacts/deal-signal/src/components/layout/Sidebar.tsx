import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Briefcase, 
  Eye, 
  Activity, 
  FileText, 
  MessageSquare, 
  GitCommit, 
  Database, 
  Settings,
  Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const TOP_NAV: NavItem[] = [
  { label: 'Portfolio', href: '/', icon: Briefcase },
  { label: 'Watchtower', href: '/watchtower', icon: Eye },
  { label: 'Signals', href: '/signals', icon: Activity },
  { label: 'Deal Brief', href: '/deal-brief', icon: FileText },
  { label: 'Ask Watchtower', href: '/ask-watchtower', icon: MessageSquare },
  { label: 'Analysis Trace', href: '/analysis-trace', icon: GitCommit },
];

const BOTTOM_NAV: NavItem[] = [
  { label: 'Data Sources', href: '/data-sources', icon: Database },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col fixed left-0 top-0 text-sidebar-foreground">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <Terminal className="w-5 h-5 text-primary mr-3" />
        <span className="font-semibold tracking-wide text-sm text-foreground uppercase">
          Deal Signal
        </span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Intelligence
        </div>
        {TOP_NAV.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors group",
                  isActive 
                    ? "bg-card text-primary" 
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-4 h-4 mr-3", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        {BOTTOM_NAV.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors group",
                  isActive 
                    ? "bg-card text-primary" 
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-4 h-4 mr-3", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
