import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { PendingOrganization } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ReasonModal } from '@/components/admin/ReasonModal';

function formatDate(s: string | undefined) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString(undefined, { dateStyle: 'medium' });
  } catch {
    return '—';
  }
}

export default function AdminOrganizations() {
  const queryClient = useQueryClient();
  const [rejectModal, setRejectModal] = useState<{ org: PendingOrganization } | null>(null);
  const [suspendModal, setSuspendModal] = useState<{ org: PendingOrganization } | null>(null);

  const { data: pending, isLoading } = useQuery({
    queryKey: queryKeys.admin.pendingOrgs,
    queryFn: () => api.getPendingOrgApprovals(),
  });

  const approveMutation = useMutation({
    mutationFn: (orgId: string) => api.approveOrganization(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingOrgs });
      toast.success('Organization approved.');
    },
    onError: (e: ApiError) => toast.error(e.message || 'Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ orgId, reason }: { orgId: string; reason: string }) =>
      api.rejectOrganization(orgId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingOrgs });
      setRejectModal(null);
      toast.success('Organization rejected.');
    },
    onError: (e: ApiError) => toast.error(e.message || 'Failed to reject'),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ orgId, reason }: { orgId: string; reason: string }) =>
      api.suspendOrganization(orgId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingOrgs });
      setSuspendModal(null);
      toast.success('Organization suspended.');
    },
    onError: (e: ApiError) => toast.error(e.message || 'Failed to suspend'),
  });

  const handleReject = useCallback(
    async (reason: string) => {
      if (!rejectModal?.org.id) return;
      await rejectMutation.mutateAsync({ orgId: rejectModal.org.id, reason });
    },
    [rejectModal, rejectMutation]
  );

  const handleSuspend = useCallback(
    async (reason: string) => {
      if (!suspendModal?.org.id) return;
      await suspendMutation.mutateAsync({ orgId: suspendModal.org.id, reason });
    },
    [suspendModal, suspendMutation]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organization approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve or reject organization registration requests.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending approvals</CardTitle>
          <CardDescription>
            {pending?.length ?? 0} organization(s) awaiting review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !pending?.length ? (
            <p className="text-muted-foreground py-8 text-center">No pending organization approvals.</p>
          ) : (
            <ul className="divide-y divide-border">
              {pending.map((org) => (
                <li key={org.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {[org.address, org.city, org.state].filter(Boolean).join(', ')}
                      </p>
                      {org.creator && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Created by {org.creator.fullName} ({org.creator.email})
                        </p>
                      )}
                      {org._count != null && (
                        <p className="text-xs text-muted-foreground">
                          {org._count.memberships ?? 0} member(s)
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Submitted {formatDate(org.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(org.id)}
                        disabled={approveMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setRejectModal({ org })}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSuspendModal({ org })}
                      >
                        Suspend
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ReasonModal
        open={!!rejectModal}
        onOpenChange={(open) => !open && setRejectModal(null)}
        title="Reject organization"
        description="Provide a reason for rejection. The creator will be informed."
        submitLabel="Reject"
        variant="destructive"
        onSubmit={handleReject}
      />
      <ReasonModal
        open={!!suspendModal}
        onOpenChange={(open) => !open && setSuspendModal(null)}
        title="Suspend organization"
        description="Provide a reason for suspension. The organization will be unable to operate until reactivated."
        submitLabel="Suspend"
        variant="destructive"
        onSubmit={handleSuspend}
      />
    </div>
  );
}
