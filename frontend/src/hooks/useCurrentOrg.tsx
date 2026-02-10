import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { useOrgStore } from '@/lib/stores/org-store';
import { useAuth } from '@/hooks/useAuth';

export function useOrgsQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.orgs.all,
    queryFn: () => api.getOrganizations(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

function useOrgs(enabled: boolean) {
  return useOrgsQuery(enabled);
}

export function OrgProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { data: orgs } = useOrgs(!!isAuthenticated);
  const { currentOrgId, setCurrentOrgId } = useOrgStore();

  // Set default to first approved org when none selected
  useEffect(() => {
    if (!orgs?.length || currentOrgId) return;
    const firstApproved = orgs.find((o) => o.status === 'APPROVED');
    if (firstApproved) setCurrentOrgId(firstApproved.id);
  }, [orgs, currentOrgId, setCurrentOrgId]);

  // If current org is no longer in the user's list (e.g. left org), switch to first approved
  useEffect(() => {
    if (!orgs?.length || !currentOrgId) return;
    const stillMember = orgs.some((o) => o.id === currentOrgId);
    if (!stillMember) {
      const firstApproved = orgs.find((o) => o.status === 'APPROVED');
      setCurrentOrgId(firstApproved?.id ?? orgs[0]?.id ?? null);
    }
  }, [orgs, currentOrgId, setCurrentOrgId]);

  return <>{children}</>;
}

export function useCurrentOrg() {
  const { isAuthenticated } = useAuth();
  const { currentOrgId, setCurrentOrgId } = useOrgStore();
  const { data: orgs, isFetched: orgsFetched } = useOrgs(!!isAuthenticated);

  const currentOrg = orgs?.find((o) => o.id === currentOrgId) ?? orgs?.[0];

  return {
    currentOrgId: currentOrgId ?? currentOrg?.id ?? null,
    currentOrg,
    orgs: orgs ?? [],
    setCurrentOrgId,
    /** True once the organizations list has been loaded (so empty list is meaningful). */
    orgsLoaded: orgsFetched,
  };
}
