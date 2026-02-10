import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminVets from './AdminVets';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    getPendingVetApprovals: vi.fn(),
    approveVet: vi.fn(),
    rejectVet: vi.fn(),
    suspendVet: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderAdminVets() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminVets />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const mockVet = {
  id: 'v1',
  email: 'vet@example.com',
  fullName: 'Dr Jane Doe',
  vcnNumber: 'VCN123',
  specialization: 'Small animals',
  status: 'PENDING_APPROVAL' as const,
  profileCompleted: true,
  profileSubmittedAt: '2025-01-15T00:00:00Z',
  createdAt: '',
  updatedAt: '',
};

describe('AdminVets', () => {
  beforeEach(() => {
    vi.mocked(api.getPendingVetApprovals).mockResolvedValue([]);
    vi.mocked(api.approveVet).mockResolvedValue(mockVet as any);
    vi.mocked(api.rejectVet).mockResolvedValue(mockVet as any);
    vi.mocked(api.suspendVet).mockResolvedValue(mockVet as any);
  });

  it('renders heading and empty state when no pending vets', async () => {
    renderAdminVets();
    expect(screen.getByRole('heading', { name: /vet approvals/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/No pending vet approvals/)).toBeInTheDocument();
    });
  });

  it('renders list of pending vets with Approve, Reject, Suspend', async () => {
    vi.mocked(api.getPendingVetApprovals).mockResolvedValue([mockVet] as any);
    renderAdminVets();
    await waitFor(() => {
      expect(screen.getByText('Dr Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('vet@example.com')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suspend' })).toBeInTheDocument();
  });

  it('calls approveVet when Approve is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(api.getPendingVetApprovals).mockResolvedValue([mockVet] as any);
    renderAdminVets();
    await waitFor(() => {
      expect(screen.getByText('Dr Jane Doe')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() => {
      expect(api.approveVet).toHaveBeenCalledWith('v1');
    });
  });

  it('opens reject modal when Reject is clicked and submits reason', async () => {
    const user = userEvent.setup();
    vi.mocked(api.getPendingVetApprovals).mockResolvedValue([mockVet] as any);
    renderAdminVets();
    await waitFor(() => {
      expect(screen.getByText('Dr Jane Doe')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Reject vet' })).toBeInTheDocument();
    });
    const dialog = screen.getByRole('dialog');
    const textarea = within(dialog).getByRole('textbox');
    await user.type(textarea, 'Incomplete documentation.');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reject' }));
    await waitFor(() => {
      expect(api.rejectVet).toHaveBeenCalledWith('v1', 'Incomplete documentation.');
    });
  });
});
