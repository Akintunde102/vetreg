import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useCurrentOrg } from '@/hooks/useCurrentOrg';

/**
 * Ensures the user has at least one organization before allowing access to
 * org-scoped dashboard routes. Only site admin (/admin) and the Organizations
 * page (/organizations) are allowed without an org; all other activity is tied
 * to an organization.
 */
export function OrgRequiredGate() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { orgs, orgsLoaded } = useCurrentOrg();

  const isOrganizationsPage = pathname === '/organizations';

  useEffect(() => {
    if (!orgsLoaded || isOrganizationsPage) return;
    if (orgs.length === 0) {
      navigate('/organizations?reason=no_org', { replace: true });
    }
  }, [orgsLoaded, orgs.length, isOrganizationsPage, navigate]);

  if (!orgsLoaded && !isOrganizationsPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isOrganizationsPage && orgs.length === 0) {
    return null;
  }

  return <Outlet />;
}
