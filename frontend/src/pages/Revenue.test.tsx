import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RevenuePage from './Revenue';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    getRevenue: vi.fn(),
    getFollowUpsToday: vi.fn(),
    getTreatments: vi.fn(),
    markPayment: vi.fn(),
  },
}));

vi.mock('@/hooks/useCurrentOrg', () => ({
  useCurrentOrg: vi.fn(() => ({
    currentOrgId: 'org-1',
    currentOrg: null,
    setCurrentOrgId: vi.fn(),
    orgsLoaded: true,
  })),
}));

const mockTreatment = {
  id: 'tx-1',
  animalId: 'a1',
  animal: {
    id: 'a1',
    name: 'Doggy',
    species: 'Dog',
    patientType: 'SINGLE_PET' as const,
    clientId: 'c1',
    client: {
      id: 'c1',
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '+2348012345678',
      email: 'jane@example.com',
      createdAt: '',
    },
    createdAt: '',
    updatedAt: '',
  },
  organizationId: 'o1',
  organization: { id: 'o1', name: 'Clinic', address: '', city: '', status: 'APPROVED', createdAt: '', updatedAt: '' },
  diagnosis: 'Deworming',
  visitDate: '2026-02-10T00:00:00.000Z',
  paymentStatus: 'PAID' as const,
  amount: 3000,
  createdAt: '',
};

function renderRevenuePage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RevenuePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('RevenuePage', () => {
  beforeEach(() => {
    vi.mocked(api.getRevenue).mockResolvedValue({
      totalRevenue: 7000,
      paymentBreakdown: [
        { status: 'PAID', count: 1 },
        { status: 'OWED', count: 1 },
      ],
    });
    vi.mocked(api.getFollowUpsToday).mockResolvedValue({ count: 0 });
    vi.mocked(api.getTreatments).mockResolvedValue({
      data: [mockTreatment],
      meta: { page: 1, limit: 100, totalCount: 1, totalPages: 1 },
    });
  });

  it('renders Revenue heading and description', () => {
    renderRevenuePage();
    expect(screen.getByRole('heading', { name: /Revenue/i })).toBeInTheDocument();
    expect(screen.getByText(/Manage all payments and invoices/i)).toBeInTheDocument();
  });

  it('renders category filter tabs (All Payments, Pet, Livestock, Farm)', () => {
    renderRevenuePage();
    expect(screen.getByRole('button', { name: 'All Payments' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pet Payment' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Livestock Payment' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Farm Payments' })).toBeInTheDocument();
  });

  it('shows client name and payment data after load', async () => {
    renderRevenuePage();
    await waitFor(() => {
      expect(screen.getAllByText('Jane Doe').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText('Doggy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Deworming').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/3,000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Paid').length).toBeGreaterThanOrEqual(1);
  });

  it('shows Revenue summary and Don\'t Forget section after load', async () => {
    renderRevenuePage();
    await waitFor(() => {
      expect(screen.getByText(/Revenue ₦/)).toBeInTheDocument();
    });
    expect(screen.getByText("Don't Forget")).toBeInTheDocument();
    expect(screen.getByText(/unpaid invoices/)).toBeInTheDocument();
  });

  it('fetches revenue, follow-ups, and treatments on load', async () => {
    renderRevenuePage();
    await waitFor(() => {
      expect(api.getRevenue).toHaveBeenCalledWith('org-1', expect.any(Object));
      expect(api.getFollowUpsToday).toHaveBeenCalledWith('org-1');
      expect(api.getTreatments).toHaveBeenCalledWith('org-1', expect.objectContaining({ limit: '500' }));
    });
  });
});
