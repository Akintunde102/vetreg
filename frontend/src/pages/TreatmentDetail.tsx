import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, PawPrint, Building2, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EditTreatmentDialog } from '@/components/EditTreatmentDialog';

export default function TreatmentDetailPage() {
  const { treatmentId } = useParams<{ treatmentId: string }>();
  const { currentOrgId } = useCurrentOrg();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const { data: treatment, isLoading } = useQuery({
    queryKey: queryKeys.treatments.detail(currentOrgId!, treatmentId!),
    queryFn: () => api.getTreatment(currentOrgId!, treatmentId!),
    enabled: !!currentOrgId && !!treatmentId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Treatment not found</p>
        <button onClick={() => navigate(-1)} className="text-primary mt-2 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{treatment.diagnosis || 'Treatment'}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {format(parseISO(treatment.visitDate), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
              <Edit className="w-3.5 h-3.5" /> Edit
            </Button>
            <span
              className={
                treatment.paymentStatus === 'PAID'
                  ? 'px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary'
                  : 'px-3 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive'
              }
            >
              {treatment.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{treatment.animal?.name || 'Animal'}</p>
              <p className="text-sm text-muted-foreground">
                {treatment.animal?.client
                  ? `${treatment.animal.client.firstName} ${treatment.animal.client.lastName}`
                  : ''}
              </p>
            </div>
          </div>

          {treatment.organization && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              {treatment.organization.name}
            </div>
          )}

          {treatment.treatmentGiven && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Treatment Given</h3>
              <p className="text-sm text-muted-foreground">{treatment.treatmentGiven}</p>
            </div>
          )}

          {treatment.amount != null && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Amount</h3>
              <p className="text-lg font-semibold">₦{treatment.amount.toLocaleString()}</p>
            </div>
          )}

          {treatment.notes && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Notes</h3>
              <p className="text-sm text-muted-foreground">{treatment.notes}</p>
            </div>
          )}
        </div>
      </div>

      <EditTreatmentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        treatment={treatment}
      />
    </div>
  );
}
