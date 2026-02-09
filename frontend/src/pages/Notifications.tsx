import { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle2, AlertCircle, PawPrint, DollarSign, CalendarDays, Users, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'appointment' | 'payment' | 'animal' | 'client' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface ActivityItem {
  id: string;
  type: 'treatment' | 'payment' | 'client' | 'animal' | 'appointment';
  action: string;
  detail: string;
  timestamp: string;
  user: string;
}

const mockNotifications: Notification[] = [
  { id: '1', type: 'appointment', title: 'Upcoming Appointment', message: 'Buddy (Golden Retriever) is scheduled for a checkup tomorrow at 10:00 AM.', time: '2 min ago', read: false },
  { id: '2', type: 'payment', title: 'Payment Received', message: '₦15,000 received from Adebayo Johnson for Bella\'s treatment.', time: '1 hour ago', read: false },
  { id: '3', type: 'animal', title: 'Follow-up Due', message: 'Rex (German Shepherd) follow-up vaccination is overdue by 2 days.', time: '3 hours ago', read: false },
  { id: '4', type: 'client', title: 'New Client Registered', message: 'Chioma Okafor has been added as a new client with 2 animals.', time: '5 hours ago', read: true },
  { id: '5', type: 'system', title: 'Profile Approved', message: 'Your veterinary profile has been approved. You can now accept appointments.', time: '1 day ago', read: true },
  { id: '6', type: 'payment', title: 'Outstanding Payment', message: '₦8,500 outstanding from Emeka Nwankwo for livestock treatment.', time: '1 day ago', read: true },
  { id: '7', type: 'appointment', title: 'Cancelled Appointment', message: 'Mrs. Afolabi cancelled Max\'s grooming appointment for Friday.', time: '2 days ago', read: true },
  { id: '8', type: 'animal', title: 'Batch Treatment Complete', message: 'Batch vaccination for Adesola Farm (25 cattle) has been marked complete.', time: '3 days ago', read: true },
];

const mockActivity: ActivityItem[] = [
  { id: '1', type: 'treatment', action: 'Completed treatment', detail: 'Administered deworming for Buddy (Golden Retriever)', timestamp: 'Today, 2:30 PM', user: 'Dr. Adeyemi' },
  { id: '2', type: 'payment', action: 'Recorded payment', detail: '₦15,000 from Adebayo Johnson — Invoice #0042', timestamp: 'Today, 1:15 PM', user: 'Dr. Adeyemi' },
  { id: '3', type: 'client', action: 'Added new client', detail: 'Chioma Okafor — 2 animals registered', timestamp: 'Today, 11:00 AM', user: 'Dr. Adeyemi' },
  { id: '4', type: 'animal', action: 'Registered animal', detail: 'Luna (Siamese Cat) added for Chioma Okafor', timestamp: 'Today, 11:05 AM', user: 'Dr. Adeyemi' },
  { id: '5', type: 'appointment', action: 'Scheduled appointment', detail: 'Rex vaccination follow-up — Feb 12, 9:00 AM', timestamp: 'Yesterday, 4:00 PM', user: 'Dr. Adeyemi' },
  { id: '6', type: 'treatment', action: 'Updated diagnosis', detail: 'Bella — Skin allergy treatment plan adjusted', timestamp: 'Yesterday, 2:45 PM', user: 'Dr. Adeyemi' },
  { id: '7', type: 'payment', action: 'Marked as owed', detail: '₦8,500 from Emeka Nwankwo — livestock batch treatment', timestamp: 'Yesterday, 10:30 AM', user: 'Dr. Adeyemi' },
  { id: '8', type: 'animal', action: 'Batch treatment logged', detail: '25 cattle vaccinated at Adesola Farm', timestamp: '2 days ago, 3:00 PM', user: 'Dr. Adeyemi' },
  { id: '9', type: 'appointment', action: 'Cancelled appointment', detail: 'Max grooming — cancelled by Mrs. Afolabi', timestamp: '2 days ago, 9:15 AM', user: 'System' },
  { id: '10', type: 'client', action: 'Updated client info', detail: 'Adebayo Johnson — phone number updated', timestamp: '3 days ago, 11:00 AM', user: 'Dr. Adeyemi' },
];

const typeIcon = {
  appointment: CalendarDays,
  payment: DollarSign,
  animal: PawPrint,
  client: Users,
  system: Bell,
  treatment: CheckCircle2,
};

const typeBg: Record<string, string> = {
  appointment: 'bg-info/10 text-info',
  payment: 'bg-warning/10 text-warning',
  animal: 'bg-primary/10 text-primary',
  client: 'bg-accent text-accent-foreground',
  system: 'bg-muted text-muted-foreground',
  treatment: 'bg-primary/10 text-primary',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const { setUnreadCount } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => { setUnreadCount(unreadCount); }, [unreadCount, setUnreadCount]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Notifications & Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">Stay on top of updates and review recent actions.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1.5">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="w-full max-w-sm">
          <TabsTrigger value="notifications" className="flex-1 gap-1.5">
            <Bell className="w-4 h-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex-1 gap-1.5">
            <Clock className="w-4 h-4" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4">
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm">No notifications at this time.</p>
              </div>
            ) : (
              notifications.map(n => {
                const Icon = typeIcon[n.type] || Bell;
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-xl border border-border bg-card transition-colors cursor-pointer group',
                      !n.read && 'bg-primary/[0.03] border-primary/20'
                    )}
                  >
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', typeBg[n.type])}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn('text-sm font-semibold text-foreground', !n.read && 'font-bold')}>{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1.5">{n.time}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="mt-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[18px] top-6 bottom-6 w-px bg-border" />

            <div className="space-y-1">
              {mockActivity.map((item, i) => {
                const Icon = typeIcon[item.type] || CheckCircle2;
                return (
                  <div key={item.id} className="flex items-start gap-3 py-3 pl-0 pr-2 relative">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 z-10', typeBg[item.type])}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{item.action}</p>
                        <span className="text-xs text-muted-foreground/60">by {item.user}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.detail}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{item.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
