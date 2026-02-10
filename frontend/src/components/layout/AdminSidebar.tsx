import { NavLink, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, UserCheck, Building2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/vets', icon: UserCheck, label: 'Vet approvals' },
  { to: '/admin/organizations', icon: Building2, label: 'Org approvals' },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-[var(--topbar-height)] bottom-0 w-[var(--sidebar-width)] bg-sidebar border-r border-sidebar-border z-40">
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Site Admin</p>
          {adminNav.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1 mb-0.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-muted'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
        <div className="border-t border-sidebar-border mx-4 my-3" />
        <div className="px-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1 mb-0.5 text-sm font-medium text-sidebar-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 flex-shrink-0" />
            <span>Back to app</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
