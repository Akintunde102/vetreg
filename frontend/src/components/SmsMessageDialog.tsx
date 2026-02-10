import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface SmsMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Client first name for greeting */
  clientFirstName: string;
  /** Organization name to sign the message */
  orgName: string;
  /** Client phone number (for sms: link) */
  phoneNumber: string;
  /** Outstanding balance in naira (optional). If provided, message includes balance reminder. */
  balance?: number;
}

function buildMessage(orgName: string, clientFirstName: string, balance?: number): string {
  if (balance != null && balance > 0) {
    return `Hi ${clientFirstName}, this is ${orgName}. Your outstanding balance is ₦${balance.toLocaleString()}. Please visit or call us to settle. Thank you.`;
  }
  return `Hi ${clientFirstName}, this is ${orgName}. We hope you and your pets are well. Reach out if you need anything.`;
}

export function SmsMessageDialog({
  open,
  onOpenChange,
  clientFirstName,
  orgName,
  phoneNumber,
  balance = 0,
}: SmsMessageDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const message = buildMessage(orgName, clientFirstName, balance > 0 ? balance : undefined);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast({ title: 'Copied', description: 'Message copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Could not copy to clipboard.', variant: 'destructive' });
    }
  }, [message, toast]);

  const normalizedPhone = phoneNumber.replace(/\s+/g, '').replace(/^0/, '+234');
  const smsHref = `sms:${normalizedPhone}?body=${encodeURIComponent(message)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message to send by SMS</DialogTitle>
          <DialogDescription>
            Copy the text below or open your messaging app to send this to the client.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-foreground whitespace-pre-wrap">
            {message}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy message'}
            </Button>
            <Button size="sm" asChild>
              <a href={smsHref} target="_blank" rel="noopener noreferrer">
                Open SMS app
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
