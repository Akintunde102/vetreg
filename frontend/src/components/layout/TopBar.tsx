import { Bell, Search, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopBar() {
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { currentOrg, orgs, setCurrentOrgId } = useCurrentOrg();
  const navigate = useNavigate();
  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'VR';

  return (
    <header className="fixed top-0 left-0 right-0 h-[var(--topbar-height)] bg-card border-b border-border z-50 flex items-center px-4 lg:px-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4 lg:pr-4">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">VR</span>
          </div>
          <span className="font-bold text-lg text-foreground hidden sm:inline">VetReg</span>
        </button>
      </div>

      {/* Org Switcher */}
      {orgs?.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted text-sm font-medium max-w-[200px] truncate">
              <span className="truncate">{currentOrg?.name || 'Select clinic'}</span>
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {orgs.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => {
                  setCurrentOrgId(org.id);
                  navigate('/dashboard');
                }}
              >
                {org.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto lg:mx-0 lg:ml-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients, animals..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
          />
          <kbd className="hidden lg:inline-flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 ml-4">
        <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:inline text-sm font-medium text-foreground max-w-[120px] truncate">
                {user?.fullName?.split(' ').slice(-1)[0]}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden lg:inline" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              <Settings className="w-4 h-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
