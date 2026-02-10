import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Renders children only when the current user is a Master Admin.
 * Redirects to /dashboard otherwise (after auth is resolved).
 */
export function AdminRoute() {
  const { isAuthenticated, isLoading, isMasterAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
      return;
    }
    if (!isMasterAdmin) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, isAuthenticated, isMasterAdmin, navigate, location]);

  if (isLoading || !isAuthenticated || !isMasterAdmin) {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      );
    }
    return null;
  }

  return <Outlet />;
}
