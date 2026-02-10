import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, PawPrint, Pill, CalendarDays,
  DollarSign, Building2, Settings, ChevronLeft, ChevronRight, Bell, BarChart3, ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

const mainNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/clients', icon: Users, label: 'Clients' },
  { to: '/dashboard/animals', icon: PawPrint, label: 'Animals' },
  { to: '/dashboard/treatments', icon: Pill, label: 'Treatments' },
  { to: '/dashboard/schedule', icon: CalendarDays, label: 'Schedule' },
  { to: '/dashboard/revenue', icon: DollarSign, label: 'Revenue' },
  { to: '/dashboard/reports', icon: BarChart3, label: 'Reports' },
];

const orgNav = [
  { to: '/organizations', icon: Building2, label: 'Clinics' },
  { to: '/notifications', icon: Bell, label: 'Notifications', showBadge: true },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { isMasterAdmin } = useAuth();

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col fixed left-0 top-[var(--topbar-height)] bottom-0 bg-sidebar border-r border-sidebar-border z-40 transition-all duration-200',
        collapsed ? 'w-20' : 'w-[var(--sidebar-width)]'
      )}
    >
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-2">
          {!collapsed && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Main</p>}
          {mainNav.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1 mb-0.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-muted'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {isMasterAdmin && (
          <>
            <div className="border-t border-sidebar-border mx-4 my-3" />
            <div className="px-3 mb-2">
              {!collapsed && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Admin</p>}
              <NavLink
                to="/admin"
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1 mb-0.5 text-sm font-medium transition-colors',
                  location.pathname.startsWith('/admin')
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-muted'
                )}
              >
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>Site Admin</span>}
              </NavLink>
            </div>
          </>
        )}

        <div className="border-t border-sidebar-border mx-4 my-3" />

        <div className="px-3">
          {!collapsed && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Organization</p>}
          {orgNav.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            const badge = (item as any).showBadge ? unreadCount : 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1 mb-0.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-muted'
                )}
              >
                <div className="relative flex-shrink-0">
                  <item.icon className="w-5 h-5" />
                  {badge > 0 && collapsed && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                  )}
                </div>
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {badge > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center p-3 border-t border-sidebar-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </aside>
  );
}
