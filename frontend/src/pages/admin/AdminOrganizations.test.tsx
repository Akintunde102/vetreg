import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminOrganizations from './AdminOrganizations';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    getPendingOrgApprovals: vi.fn(),
    approveOrganization: vi.fn(),
    rejectOrganization: vi.fn(),
    suspendOrganization: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderAdminOrgs() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminOrganizations />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const mockOrg = {
  id: 'o1',
  name: 'Happy Paws Clinic',
  address: '123 Main St',
  city: 'Lagos',
  status: 'PENDING_APPROVAL' as const,
  createdAt: '2025-01-10T00:00:00Z',
  updatedAt: '2025-01-10T00:00:00Z',
  creator: { id: 'v1', fullName: 'Dr John', email: 'john@clinic.com', phoneNumber: null },
  _count: { memberships: 1 },
};

describe('AdminOrganizations', () => {
  beforeEach(() => {
    vi.mocked(api.getPendingOrgApprovals).mockResolvedValue([]);
    vi.mocked(api.approveOrganization).mockResolvedValue(mockOrg as any);
    vi.mocked(api.rejectOrganization).mockResolvedValue(mockOrg as any);
    vi.mocked(api.suspendOrganization).mockResolvedValue(mockOrg as any);
  });

  it('renders heading and empty state when no pending orgs', async () => {
    renderAdminOrgs();
    expect(screen.getByRole('heading', { name: /organization approvals/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/No pending organization approvals/)).toBeInTheDocument();
    });
  });

  it('renders list of pending orgs with Approve, Reject, Suspend', async () => {
    vi.mocked(api.getPendingOrgApprovals).mockResolvedValue([mockOrg] as any);
    renderAdminOrgs();
    await waitFor(() => {
      expect(screen.getByText('Happy Paws Clinic')).toBeInTheDocument();
      expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suspend' })).toBeInTheDocument();
  });

  it('calls approveOrganization when Approve is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(api.getPendingOrgApprovals).mockResolvedValue([mockOrg] as any);
    renderAdminOrgs();
    await waitFor(() => {
      expect(screen.getByText('Happy Paws Clinic')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() => {
      expect(api.approveOrganization).toHaveBeenCalledWith('o1');
    });
  });
});
