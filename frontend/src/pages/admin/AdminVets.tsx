import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import type { VetProfile } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

type VetWithSubmitted = VetProfile & { profileSubmittedAt?: string };

export default function AdminVets() {
  const queryClient = useQueryClient();
  const [rejectModal, setRejectModal] = useState<{ vet: VetProfile } | null>(null);
  const [suspendModal, setSuspendModal] = useState<{ vet: VetProfile } | null>(null);

  const { data: pending, isLoading } = useQuery({
    queryKey: queryKeys.admin.pendingVets,
    queryFn: () => api.getPendingVetApprovals(),
  });

  const approveMutation = useMutation({
    mutationFn: (vetId: string) => api.approveVet(vetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingVets });
      toast.success('Vet approved.');
    },
    onError: (e: ApiError) => toast.error(e.message || 'Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ vetId, reason }: { vetId: string; reason: string }) =>
      api.rejectVet(vetId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingVets });
      setRejectModal(null);
      toast.success('Vet rejected.');
    },
    onError: (e: ApiError) => toast.error(e.message || 'Failed to reject'),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ vetId, reason }: { vetId: string; reason: string }) =>
      api.suspendVet(vetId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingVets });
      setSuspendModal(null);
      toast.success('Vet suspended.');
    },
    onError: (e: ApiError) => toast.error(e.message || 'Failed to suspend'),
  });

  const handleReject = useCallback(
    async (reason: string) => {
      if (!rejectModal?.vet.id) return;
      await rejectMutation.mutateAsync({ vetId: rejectModal.vet.id, reason });
    },
    [rejectModal, rejectMutation]
  );

  const handleSuspend = useCallback(
    async (reason: string) => {
      if (!suspendModal?.vet.id) return;
      await suspendMutation.mutateAsync({ vetId: suspendModal.vet.id, reason });
    },
    [suspendModal, suspendMutation]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vet approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve or reject vet registrations that have completed their profile.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending approvals</CardTitle>
          <CardDescription>
            {pending?.length ?? 0} vet(s) awaiting review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !pending?.length ? (
            <p className="text-muted-foreground py-8 text-center">No pending vet approvals.</p>
          ) : (
            <ul className="divide-y divide-border">
              {(pending as VetWithSubmitted[]).map((vet) => (
                <li key={vet.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{vet.fullName ?? '—'}</p>
                      <p className="text-sm text-muted-foreground">{vet.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {vet.vcnNumber && (
                          <Badge variant="secondary" className="text-xs">
                            VCN: {vet.vcnNumber}
                          </Badge>
                        )}
                        {vet.specialization && (
                          <Badge variant="outline" className="text-xs">
                            {vet.specialization}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted {formatDate(vet.profileSubmittedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(vet.id)}
                        disabled={approveMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setRejectModal({ vet })}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSuspendModal({ vet })}
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
        title="Reject vet"
        description="Provide a reason for rejection. The vet will see this reason."
        submitLabel="Reject"
        variant="destructive"
        onSubmit={handleReject}
      />
      <ReasonModal
        open={!!suspendModal}
        onOpenChange={(open) => !open && setSuspendModal(null)}
        title="Suspend vet"
        description="Provide a reason for suspension. The vet will be unable to use the platform until reactivated."
        submitLabel="Suspend"
        variant="destructive"
        onSubmit={handleSuspend}
      />
    </div>
  );
}
