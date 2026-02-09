export class DashboardStatsResponseDto {
  clients!: {
    total: number;
    active: number;
    inactive: number;
  };

  animals!: {
    total: number;
    byPatientType: {
      SINGLE_PET: number;
      SINGLE_LIVESTOCK: number;
      BATCH_LIVESTOCK: number;
    };
    bySpecies: Record<string, number>;
    vaccinationDue: number;
  };

  treatments!: {
    total: number;
    thisMonth: number;
    scheduled: number;
    followUpsDue: number;
  };

  revenue!: {
    total: number;
    totalPaid: number;
    totalOwed: number;
    totalWaived: number;
    unpaidInvoices: number;
  };
}
