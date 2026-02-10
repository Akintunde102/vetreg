export const queryKeys = {
  vets: {
    profile: ['vet', 'profile'] as const,
    approvalStatus: ['vet', 'approval-status'] as const,
  },
  orgs: {
    all: ['orgs'] as const,
    detail: (orgId: string) => ['orgs', orgId] as const,
    members: (orgId: string) => ['orgs', orgId, 'members'] as const,
    revenue: (orgId: string, params?: Record<string, string>) => ['orgs', orgId, 'revenue', params ?? {}] as const,
  },
  clients: {
    list: (orgId: string, filters: Record<string, unknown>) => ['clients', orgId, filters] as const,
    detail: (orgId: string, clientId: string) => ['clients', orgId, clientId] as const,
  },
  animals: {
    list: (orgId: string, filters: Record<string, unknown>) => ['animals', orgId, filters] as const,
    detail: (orgId: string, animalId: string) => ['animals', orgId, animalId] as const,
    vaccinationDue: (orgId: string) => ['animals', orgId, 'vaccination-due'] as const,
  },
  treatments: {
    list: (orgId: string, filters: Record<string, unknown>) => ['treatments', orgId, filters] as const,
    detail: (orgId: string, treatmentId: string) => ['treatments', orgId, treatmentId] as const,
    scheduled: (orgId: string) => ['treatments', orgId, 'scheduled'] as const,
    scheduledList: (orgId: string, from?: string, to?: string) =>
      ['treatments', orgId, 'scheduled-list', from ?? '', to ?? ''] as const,
    followUps: (orgId: string) => ['treatments', orgId, 'follow-ups'] as const,
  },
  dashboard: {
    stats: (orgId: string) => ['dashboard', 'stats', orgId] as const,
    scheduledToday: (orgId: string) => ['dashboard', 'scheduled-today', orgId] as const,
    followUpsToday: (orgId: string) => ['dashboard', 'follow-ups-today', orgId] as const,
  },
  admin: {
    pendingVets: ['admin', 'pending-vets'] as const,
    pendingOrgs: ['admin', 'pending-orgs'] as const,
  },
};
