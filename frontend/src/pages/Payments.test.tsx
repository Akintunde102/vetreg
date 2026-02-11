import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PaymentsPage from './Payments';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    getTreatments: vi.fn(),
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

function renderPaymentsPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PaymentsPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('PaymentsPage', () => {
  beforeEach(() => {
    vi.mocked(api.getTreatments).mockResolvedValue({
      data: [mockTreatment],
      meta: { page: 1, limit: 500, totalCount: 1, totalPages: 1 },
    });
  });

  it('renders Payment History heading', () => {
    renderPaymentsPage();
    expect(screen.getByRole('heading', { name: /Payment History/i })).toBeInTheDocument();
  });

  it('renders category filter tabs (Pet, Livestock, Farm)', () => {
    renderPaymentsPage();
    expect(screen.getByRole('button', { name: 'Pet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Livestock' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Farm' })).toBeInTheDocument();
  });

  it('shows client name and payment data after load', async () => {
    renderPaymentsPage();
    await waitFor(() => {
      expect(screen.getAllByText('Jane Doe').length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getAllByText('Doggy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Deworming').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/3,000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Paid').length).toBeGreaterThanOrEqual(1);
  });

  it('fetches treatments on load', async () => {
    renderPaymentsPage();
    await waitFor(() => {
      expect(api.getTreatments).toHaveBeenCalledWith('org-1', expect.objectContaining({ limit: '500' }));
    });
  });
});
