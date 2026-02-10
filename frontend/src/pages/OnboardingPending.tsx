import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, Mail } from 'lucide-react';

export default function OnboardingPendingPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const { data: status, refetch, isRefetching } = useQuery({
    queryKey: queryKeys.vets.approvalStatus,
    queryFn: () => api.getApprovalStatus(),
    refetchInterval: 30000,
  });

  if (status?.status === 'APPROVED') {
    navigate('/dashboard', { replace: true });
    return null;
  }
  if (status?.status === 'REJECTED') {
    navigate('/account/rejected', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Application Under Review</h1>
        <p className="text-muted-foreground mb-6">
          Your profile has been submitted for approval. Our team will review your credentials and notify you via email within 24-48 hours.
        </p>

        <div className="text-left space-y-3 mb-6 p-4 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">1</span>
            <span className="text-sm font-medium">Profile Submitted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">2</span>
            <span className="text-sm font-medium">Under Review</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center">3</span>
            <span className="text-sm text-muted-foreground">Approval Decision</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => refetch()} disabled={isRefetching}>
            {isRefetching ? 'Checking...' : 'Check Status'}
          </Button>
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Questions? Email us at{' '}
          <a href="mailto:support@vetreg.com" className="text-primary hover:underline flex items-center justify-center gap-1 mt-2">
            <Mail className="w-3 h-3" /> support@vetreg.com
          </a>
        </p>
      </div>
    </div>
  );
}
