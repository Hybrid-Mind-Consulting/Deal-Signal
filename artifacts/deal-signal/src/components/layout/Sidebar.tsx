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

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link href={item.href}>
      <div className={cn(
        'relative flex items-center px-2.5 py-2 text-sm rounded-md cursor-pointer transition-colors group',
        isActive
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
      )}>
        {isActive && (
          <div className="absolute left-0 inset-y-1 w-0.5 rounded-full bg-primary" />
        )}
        <item.icon className={cn(
          'w-4 h-4 mr-2.5 flex-shrink-0 transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )} />
        <span className={cn('leading-none', isActive ? 'font-medium' : 'font-normal')}>
          {item.label}
        </span>
      </div>
    </Link>
  );
}

export function Sidebar() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <div className="w-56 bg-sidebar border-r border-sidebar-border h-screen flex flex-col fixed left-0 top-0">
      {/* Brand */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-2.5">
        <Terminal className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-sm font-medium text-foreground tracking-tight">
          Deal Signal
        </span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
        {TOP_NAV.map((item) => (
          <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
        ))}
      </nav>

      {/* Bottom Nav */}
      <div className="px-2.5 py-3 border-t border-sidebar-border space-y-0.5">
        {BOTTOM_NAV.map((item) => (
          <NavLink key={item.href} item={item} isActive={isActive(item.href)} />
        ))}
      </div>
    </div>
  );
}
