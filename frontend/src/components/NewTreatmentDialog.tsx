import { useId, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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

interface NewTreatmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  animalName?: string;
  /** If true, stay on current page after create; otherwise navigate to treatment detail */
  stayOnPage?: boolean;
}

const PAYMENT_STATUS_OPTIONS = [
  { label: 'Paid', value: 'PAID' },
  { label: 'Pending', value: 'OWED' },
  { label: 'Partial', value: 'PARTIAL' },
] as const;

export function NewTreatmentDialog({
  open,
  onOpenChange,
  animalId,
  animalName = 'Patient',
  stayOnPage = true,
}: NewTreatmentDialogProps) {
  const formId = useId();
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'OWED' | 'PARTIAL'>('OWED');
  const { toast } = useToast();
  const { currentOrgId } = useCurrentOrg();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: (data: {
      visitDate: string;
      diagnosis: string;
      chiefComplaint: string;
      treatmentGiven: string;
      amount?: number;
      paymentStatus: 'PAID' | 'OWED' | 'PARTIAL';
      followUpDate?: string;
      notes?: string;
    }) => {
      const visitDateIso = data.visitDate.includes('T') ? data.visitDate : `${data.visitDate}T00:00:00.000Z`;
      return api.createTreatment(currentOrgId!, {
        animalId,
        visitDate: visitDateIso,
        chiefComplaint: data.chiefComplaint,
        treatmentGiven: data.treatmentGiven,
        diagnosis: data.diagnosis || data.chiefComplaint,
        amount: data.amount,
        paymentStatus: data.paymentStatus,
        followUpDate: data.followUpDate ? `${data.followUpDate}T00:00:00.000Z` : undefined,
        notes: data.notes,
        status: 'COMPLETED',
      });
    },
    onSuccess: (treatment) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.animals.detail(currentOrgId!, animalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.treatments.list(currentOrgId!, {}) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Treatment recorded' });
      onOpenChange(false);
      if (!stayOnPage && treatment?.id) {
        navigate(`/dashboard/treatments/${treatment.id}`);
      }
    },
    onError: (e: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to record treatment',
        description: e.message,
      });
    },
  });

  const getVal = (form: HTMLFormElement, id: string) =>
    (form.querySelector(`[id="${id}"]`) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value?.trim() ?? '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      toast({ variant: 'destructive', title: 'Diagnosis / chief complaint must be at least 10 characters' });
      return;
    }
    if (!treatmentGiven || treatmentGiven.length < 10) {
      toast({ variant: 'destructive', title: 'Treatment given must be at least 10 characters' });
      return;
    }

    const chiefComplaint = diagnosis.length >= 10 ? diagnosis : `Visit: ${diagnosis}`;
    const treatmentGivenPadded =
      treatmentGiven.length >= 10 ? treatmentGiven : `${treatmentGiven} (recorded)`;

    createMutation.mutate({
      visitDate,
      diagnosis,
      chiefComplaint,
      treatmentGiven: treatmentGivenPadded,
      amount: amountStr ? Number(amountStr) : undefined,
      paymentStatus,
      followUpDate: followUpDate || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>New Treatment</DialogTitle>
          <DialogDescription>
            Record a treatment for {animalName}. This will appear in the medical history.
          </DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={handleSubmit} className="space-y-4 py-2 overflow-y-auto flex-1 min-h-0 pr-1">
          <div className="space-y-1.5">
            <Label htmlFor={formId + '-visitDate'}>Visit Date *</Label>
            <Input
              id={formId + '-visitDate'}
              name="visitDate"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={formId + '-diagnosis'}>Diagnosis / Chief Complaint *</Label>
            <Input
              id={formId + '-diagnosis'}
              name="diagnosis"
              placeholder="e.g. Annual vaccination, Deworming"
              required
              minLength={10}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={formId + '-treatmentGiven'}>Treatment Given *</Label>
            <Textarea
              id={formId + '-treatmentGiven'}
              name="treatmentGiven"
              placeholder="e.g. DHPP vaccine administered, dewormer given"
              required
              minLength={10}
              rows={3}
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
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={formId + '-paymentStatus'}>Payment Status</Label>
              <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as 'PAID' | 'OWED' | 'PARTIAL')}>
                <SelectTrigger id={formId + '-paymentStatus'}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={formId + '-followUpDate'}>Follow-up Date</Label>
            <Input id={formId + '-followUpDate'} name="followUpDate" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={formId + '-notes'}>Notes</Label>
            <Textarea
              id={formId + '-notes'}
              name="notes"
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving…' : 'Record Treatment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
