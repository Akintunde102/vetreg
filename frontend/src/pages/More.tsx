import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Building2, Users, PawPrint, Tractor, DollarSign, ClipboardList,
  CalendarDays, Settings, LogOut, HelpCircle, FileText, Bell, Shield,
} from 'lucide-react';

const menuSections = [
  {
    title: 'Management',
    items: [
      { icon: Building2, label: 'Vet Clinics', to: '/organizations' },
      { icon: Users, label: 'Clients', to: '/dashboard/clients' },
      { icon: PawPrint, label: 'Animals', to: '/dashboard/animals' },
      { icon: CalendarDays, label: 'Schedule', to: '/dashboard/schedule' },
      { icon: DollarSign, label: 'Revenue', to: '/dashboard/revenue' },
      { icon: ClipboardList, label: 'Treatments', to: '/dashboard/treatments' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: Settings, label: 'Settings', to: '/settings' },
      { icon: Bell, label: 'Notifications', to: '/notifications' },
      { icon: Shield, label: 'Privacy & Security', to: '/settings' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help Center', to: '/settings' },
      { icon: FileText, label: 'Terms & Privacy', to: '/settings' },
    ],
  },
];

export default function MorePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'VR';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-foreground truncate">{user?.fullName}</h2>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground">{user?.specialization}</p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          Edit
        </button>
      </div>

      {/* Menu Sections */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-4 space-y-4 lg:space-y-0">
        {menuSections.map(section => (
          <div key={section.title} className="bg-card border border-border rounded-xl overflow-hidden">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-4 pb-2">
              {section.title}
            </p>
            {section.items.map((item, i) => (
              <button
                key={item.label}
                onClick={() => navigate(item.to)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors border-t border-border"
              >
                <item.icon className="w-5 h-5 text-primary" />
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Sign Out */}
      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 py-3 bg-destructive/10 text-destructive font-semibold rounded-xl hover:bg-destructive/20 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );
}
