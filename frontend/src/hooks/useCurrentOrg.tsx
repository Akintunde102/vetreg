import { createContext, useContext, useState, type ReactNode } from 'react';

interface OrgContextType {
  currentOrgId: string | null;
  setCurrentOrgId: (id: string) => void;
}

const OrgContext = createContext<OrgContextType | null>(null);

export function OrgProvider({ children }: { children: ReactNode }) {
  const [currentOrgId, setCurrentOrgId] = useState<string | null>('org1');

  return (
    <OrgContext.Provider value={{ currentOrgId, setCurrentOrgId }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useCurrentOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useCurrentOrg must be used within OrgProvider');
  return ctx;
}
