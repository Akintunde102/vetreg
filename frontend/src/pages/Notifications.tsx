import { Bell, Clock, CheckCircle2, DollarSign, PawPrint, Users, CalendarDays, Trash2, CheckCheck } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';
import { Skeleton } from '@/components/ui/skeleton';

const typeIcon: Record<string, typeof CheckCircle2> = {
  treatment: CheckCircle2,
  payment: DollarSign,
  client: Users,
  animal: PawPrint,
  appointment: CalendarDays,
};

const typeBg: Record<string, string> = {
  treatment: 'bg-primary/10 text-primary',
  payment: 'bg-warning/10 text-warning',
  animal: 'bg-primary/10 text-primary',
  client: 'bg-accent text-accent-foreground',
  appointment: 'bg-info/10 text-info',
};

function getActivityType(entityType: string): keyof typeof typeIcon {
  if (entityType === 'treatment' || entityType === 'payment' || entityType === 'client' || entityType === 'animal' || entityType === 'appointment') {
    return entityType;
  }
  return 'treatment';
}

export default function NotificationsPage() {
  const { currentOrgId } = useCurrentOrg();

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: queryKeys.orgs.activityLog(currentOrgId!, 1, 50),
    queryFn: () => api.getActivityLog(currentOrgId!, { page: 1, limit: 50 }),
    enabled: !!currentOrgId,
  });

  const logs = activityData?.logs ?? [];
  const unreadCount = 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Notifications & Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">Stay on top of updates and review recent actions.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      <Tabs defaultValue="activity" className="w-full">
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

        {/* Notifications Tab - no backend API yet */}
        <TabsContent value="notifications" className="mt-4">
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm">No notifications at this time.</p>
          </div>
        </TabsContent>

        {/* Activity Log Tab - from API */}
        <TabsContent value="activity" className="mt-4">
          <div className="relative">
            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No activity yet</p>
                <p className="text-sm">Recent actions in this organization will appear here.</p>
              </div>
            ) : (
              <>
                <div className="absolute left-[18px] top-6 bottom-6 w-px bg-border" />
                <div className="space-y-1">
                  {logs.map((item) => {
                    const type = getActivityType(item.entityType);
                    const Icon = typeIcon[type] || CheckCircle2;
                    const timeAgo = formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true });
                    return (
                      <div key={item.id} className="flex items-start gap-3 py-3 pl-0 pr-2 relative">
                        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 z-10', typeBg[type] || typeBg.treatment)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-foreground">{item.action.replace(/_/g, ' ')}</p>
                            {item.vet?.fullName && (
                              <span className="text-xs text-muted-foreground/60">by {item.vet.fullName}</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">{timeAgo}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
