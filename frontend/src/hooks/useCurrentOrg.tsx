import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useOrgStore } from '@/lib/stores/org-store';
import { useAuth } from '@/hooks/useAuth';

function useOrgs(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.orgs.all,
    queryFn: () => api.getOrganizations(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

export function OrgProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { data: orgs } = useOrgs(!!isAuthenticated);
  const { currentOrgId, setCurrentOrgId } = useOrgStore();

  useEffect(() => {
    if (!orgs?.length || currentOrgId) return;
    const firstApproved = orgs.find((o) => o.status === 'APPROVED');
    if (firstApproved) setCurrentOrgId(firstApproved.id);
  }, [orgs, currentOrgId, setCurrentOrgId]);

  return <>{children}</>;
}

export function useCurrentOrg() {
  const { isAuthenticated } = useAuth();
  const { currentOrgId, setCurrentOrgId } = useOrgStore();
  const { data: orgs } = useOrgs(!!isAuthenticated);

  const currentOrg = orgs?.find((o) => o.id === currentOrgId) ?? orgs?.[0];

  return {
    currentOrgId: currentOrgId ?? currentOrg?.id ?? null,
    currentOrg,
    orgs: orgs ?? [],
    setCurrentOrgId,
  };
}
