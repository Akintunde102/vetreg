import { useId, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';
import type { Treatment } from '@/types/api';

const PAYMENT_STATUS_OPTIONS = [
  { label: 'Paid', value: 'PAID' },
  { label: 'Pending', value: 'OWED' },
  { label: 'Partial', value: 'PARTIAL' },
  { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
  { label: 'Waived', value: 'WAIVED' },
] as const;

type PaymentStatusValue = (typeof PAYMENT_STATUS_OPTIONS)[number]['value'];

function normalizePaymentStatus(
  value: string | undefined
): PaymentStatusValue {
  if (value === 'PAID' || value === 'OWED' || value === 'PARTIAL' || value === 'PARTIALLY_PAID' || value === 'WAIVED')
    return value as PaymentStatusValue;
  return 'OWED';
}

interface EditTreatmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment: Treatment | null;
  onSuccess?: () => void;
}

function toDateInputValue(iso?: string) {
  if (!iso) return '';
  try {
    return iso.slice(0, 10);
  } catch {
    return '';
  }
}

export function EditTreatmentDialog({
  open,
  onOpenChange,
  treatment,
  onSuccess,
}: EditTreatmentDialogProps) {
  const formId = useId();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusValue>('OWED');
  const { toast } = useToast();
  const { currentOrgId } = useCurrentOrg();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (treatment) {
      const raw = (treatment as { paymentStatus?: string }).paymentStatus;
      setPaymentStatus(normalizePaymentStatus(raw));
    }
  }, [treatment?.id, (treatment as { paymentStatus?: string })?.paymentStatus]);

  const updateMutation = useMutation({
    mutationFn: (data: {
      visitDate: string;
      diagnosis?: string;
      chiefComplaint?: string;
      treatmentGiven?: string;
      amount?: number;
      paymentStatus: string;
      followUpDate?: string;
      notes?: string;
      status?: string;
    }) => {
      const backendPaymentStatus =
        data.paymentStatus === 'PARTIAL' ? 'PARTIALLY_PAID' : data.paymentStatus;
      const payload: Record<string, unknown> = {
        paymentStatus: backendPaymentStatus,
        notes: data.notes,
      };
      if (data.visitDate) {
        const visitDateIso = data.visitDate.includes('T') ? data.visitDate : `${data.visitDate}T00:00:00.000Z`;
        payload.visitDate = visitDateIso;
      }
      if (data.diagnosis) payload.diagnosis = data.diagnosis;
      if (data.chiefComplaint) payload.chiefComplaint = data.chiefComplaint;
      if (data.treatmentGiven) payload.treatmentGiven = data.treatmentGiven;
      if (data.amount != null) payload.amount = data.amount;
      if (data.followUpDate !== undefined) {
        payload.followUpDate = data.followUpDate ? `${data.followUpDate}T00:00:00.000Z` : null;
      }
      if (data.status) payload.status = data.status;
      return api.updateTreatment(currentOrgId!, treatment!.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.treatments.detail(currentOrgId!, treatment!.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.treatments.list(currentOrgId!, {}) });
      queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(currentOrgId!, treatment!.animalId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Treatment updated' });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (e: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update treatment',
        description: e.message,
      });
    },
  });

  const getVal = (form: HTMLFormElement, id: string) =>
    (form.querySelector(`[id="${id}"]`) as HTMLInputElement | HTMLTextAreaElement)?.value?.trim() ?? '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatment) return;
    const form = e.currentTarget as HTMLFormElement;
    const visitDate = getVal(form, formId + '-visitDate');
    const diagnosis = getVal(form, formId + '-diagnosis');
    const treatmentGiven = getVal(form, formId + '-treatmentGiven');
    const amountStr = getVal(form, formId + '-amount');
    const followUpDate = getVal(form, formId + '-followUpDate');
    const notes = getVal(form, formId + '-notes');

    if (!visitDate) {
      toast({ variant: 'destructive', title: 'Visit date is required' });
      return;
    }
    if (!diagnosis || diagnosis.length < 10) {
      toast({ variant: 'destructive', title: 'Diagnosis must be at least 10 characters' });
      return;
    }
    if (!treatmentGiven || treatmentGiven.length < 10) {
      toast({ variant: 'destructive', title: 'Treatment given must be at least 10 characters' });
      return;
    }

    const chiefComplaint = diagnosis.length >= 10 ? diagnosis : `Visit: ${diagnosis}`;

    updateMutation.mutate({
      visitDate,
      diagnosis,
      chiefComplaint,
      treatmentGiven,
      amount: amountStr ? Number(amountStr) : undefined,
      paymentStatus,
      followUpDate: followUpDate || undefined,
      notes: notes || undefined,
    });
  };

  if (!treatment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Treatment</DialogTitle>
          <DialogDescription>
            Update treatment details for {treatment.animal?.name ?? 'patient'}.
          </DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={handleSubmit} className="space-y-4 py-2 overflow-y-auto flex-1 min-h-0 pr-1" key={treatment.id}>
          <div className="space-y-1.5">
            <Label htmlFor={formId + '-visitDate'}>Visit Date *</Label>
            <Input
              id={formId + '-visitDate'}
              name="visitDate"
              type="date"
              required
              defaultValue={toDateInputValue(treatment.visitDate)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={formId + '-diagnosis'}>Diagnosis / Chief Complaint *</Label>
            <Input
              id={formId + '-diagnosis'}
              name="diagnosis"
              placeholder="e.g. Annual vaccination"
              required
              minLength={10}
              defaultValue={treatment.diagnosis ?? ''}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={formId + '-treatmentGiven'}>Treatment Given *</Label>
            <Textarea
              id={formId + '-treatmentGiven'}
              name="treatmentGiven"
              placeholder="e.g. DHPP vaccine administered"
              required
              minLength={10}
              rows={3}
              defaultValue={treatment.treatmentGiven ?? ''}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={formId + '-amount'}>Amount (₦)</Label>
              <Input
                id={formId + '-amount'}
                name="amount"
                type="number"
                min={0}
                step={1}
                placeholder="0"
                defaultValue={treatment.amount != null ? treatment.amount : ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={formId + '-paymentStatus'}>Payment Status</Label>
              <Select
                value={paymentStatus ?? 'OWED'}
                onValueChange={(v) => setPaymentStatus(v as PaymentStatusValue)}
              >
                <SelectTrigger id={formId + '-paymentStatus'}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={formId + '-followUpDate'}>Follow-up Date</Label>
            <Input
              id={formId + '-followUpDate'}
              name="followUpDate"
              type="date"
              defaultValue={toDateInputValue(treatment.followUpDate)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={formId + '-notes'}>Notes</Label>
            <Textarea
              id={formId + '-notes'}
              name="notes"
              placeholder="Additional notes..."
              rows={2}
              defaultValue={treatment.notes ?? ''}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
