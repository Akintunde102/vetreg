import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, PawPrint, CalendarDays, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';

const items = [
  { to: '/dashboard', icon: Home, label: 'Home', badgeKey: null },
  { to: '/dashboard/clients', icon: Users, label: 'Clients', badgeKey: 'clients' as const },
  { to: '/dashboard/animals', icon: PawPrint, label: 'Animals', badgeKey: 'animals' as const },
  { to: '/dashboard/schedule', icon: CalendarDays, label: 'Schedule', badgeKey: 'schedule' as const },
  { to: '/more', icon: MoreHorizontal, label: 'More', badgeKey: 'notifications' as const },
];

export function BottomNav() {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 h-[var(--bottomnav-height)]">
      <div className="flex items-center justify-around h-full px-2">
        {items.map((item) => {
          const isActive = location.pathname === item.to ||
            (item.to !== '/dashboard' && item.to !== '/more' && location.pathname.startsWith(item.to));
          const badge = item.badgeKey === 'notifications' ? unreadCount : 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors min-w-[56px] relative',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px] font-medium', isActive && 'font-bold')}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
