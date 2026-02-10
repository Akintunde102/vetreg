import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  requireApproved?: boolean;
}

export function ProtectedRoute({ requireApproved = true }: ProtectedRouteProps = {}) {
  const { isAuthenticated, isLoading, isApproved, isPending, isRejected, isSuspended, profileCompleted, isMasterAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
      return;
    }

    if (requireApproved && !isMasterAdmin) {
      if (!profileCompleted) {
        navigate('/onboarding/profile', { replace: true });
        return;
      }
      if (isPending) {
        navigate('/onboarding/pending', { replace: true });
        return;
      }
      if (isRejected) {
        navigate('/account/rejected', { replace: true });
        return;
      }
      if (isSuspended) {
        navigate('/account/suspended', { replace: true });
        return;
      }
      if (!isApproved) return;
    }
  }, [isLoading, isAuthenticated, isApproved, isPending, isRejected, isSuspended, profileCompleted, requireApproved, isMasterAdmin, navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const allowed = isAuthenticated && (isMasterAdmin || !requireApproved || isApproved || isPending || isRejected || isSuspended);
  if (!allowed) {
    return null;
  }

  return <Outlet />;
}