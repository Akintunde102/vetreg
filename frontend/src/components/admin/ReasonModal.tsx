import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const MIN_REASON_LENGTH = 10;

interface ReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  variant?: 'destructive' | 'default';
  onSubmit: (reason: string) => Promise<void>;
}

export function ReasonModal({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  variant = 'destructive',
  onSubmit,
}: ReasonModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    const trimmed = reason.trim();
    if (trimmed.length < MIN_REASON_LENGTH) {
      setError(`Please provide at least ${MIN_REASON_LENGTH} characters.`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setReason('');
      onOpenChange(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }, [reason, onSubmit, onOpenChange]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setReason('');
        setError(null);
      }
      onOpenChange(next);
    },
    [onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason (required, min {MIN_REASON_LENGTH} characters)</Label>
            <Textarea
              id="reason"
              placeholder="e.g. Incomplete documentation; please resubmit with valid VCN."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={submitting}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant={variant} onClick={handleSubmit} disabled={submitting || reason.trim().length < MIN_REASON_LENGTH}>
            {submitting ? 'Submitting…' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
