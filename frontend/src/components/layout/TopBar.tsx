import { Bell, Building2, Search, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TopBar() {
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { currentOrg, orgs, setCurrentOrgId } = useCurrentOrg();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSwitchOrg = (orgId: string) => {
    setCurrentOrgId(orgId);
    queryClient.invalidateQueries();
    navigate('/dashboard');
  };
  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'VR';

  return (
    <header className="fixed top-0 left-0 right-0 h-[var(--topbar-height)] bg-card border-b border-border z-50 flex items-center px-4 lg:px-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2 lg:mr-4 lg:pr-4 flex-shrink-0">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">VR</span>
          </div>
          <span className="font-bold text-lg text-foreground hidden sm:inline">VetReg</span>
        </button>
      </div>

      {/* Current clinic – "In: [Name]" at top to show where you are */}
      {orgs?.length > 0 && (
        <>
          <button
            onClick={() => navigate('/organizations')}
            className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted text-sm font-semibold text-foreground max-w-[160px] truncate border border-border/50 bg-muted/30"
            title={`You're in: ${currentOrg?.name ?? 'Select clinic'}. Tap to switch.`}
          >
            <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
            <span className="truncate">{currentOrg?.name || 'Select clinic'}</span>
            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm font-semibold text-foreground max-w-[240px] truncate border border-border/50 bg-muted/30"
                title={`You're in: ${currentOrg?.name ?? 'Select clinic'}. Click to switch.`}
              >
                <Building2 className="w-4 h-4 flex-shrink-0 text-primary" />
                <span className="text-muted-foreground font-normal text-xs mr-0.5">In:</span>
                <span className="truncate">{currentOrg?.name || 'Select clinic'}</span>
                <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {orgs.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSwitchOrg(org.id)}
              >
                {org.name}
                {org.id === currentOrg?.id && (
                  <span className="ml-auto text-xs text-primary font-medium">Active</span>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/organizations')}>
              <Building2 className="w-4 h-4 mr-2" />
              View all clinics
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </>
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
