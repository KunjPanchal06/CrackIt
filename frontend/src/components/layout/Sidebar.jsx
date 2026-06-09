import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Wand2,
  BarChart3,
  FolderClock,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/**
 * Navigation items for the sidebar.
 * Each item has an icon, label, and route path.
 */
const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Resumes', path: '/resumes' },
  { icon: Wand2, label: 'AI Tailor', path: '/tailor' },
  { icon: BarChart3, label: 'ATS Score', path: '/ats' },
  { icon: FolderClock, label: 'Applications', path: '/applications' },
];

/**
 * Sidebar navigation component.
 * Collapsible sidebar with icons and labels.
 * Highlights the currently active route.
 */
export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen flex flex-col',
        'bg-sidebar-background border-r border-sidebar-border',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo / Brand */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="gradient-bg w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold gradient-text whitespace-nowrap">
              CrackIt
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                'text-sm font-medium transition-all duration-200',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-sidebar-primary')} />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings & Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg',
            'text-sm font-medium transition-all duration-200',
            'hover:bg-sidebar-accent text-sidebar-foreground/70'
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full',
            'text-sm font-medium transition-all duration-200',
            'hover:bg-sidebar-accent text-sidebar-foreground/50'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
