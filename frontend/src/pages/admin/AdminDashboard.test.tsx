import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDashboard from './AdminDashboard';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    getPendingVetApprovals: vi.fn(),
    getPendingOrgApprovals: vi.fn(),
  },
}));

function renderAdminDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.mocked(api.getPendingVetApprovals).mockResolvedValue([]);
    vi.mocked(api.getPendingOrgApprovals).mockResolvedValue([]);
  });

  it('renders Site Admin heading and description', () => {
    renderAdminDashboard();
    expect(screen.getByRole('heading', { name: 'Site Admin' })).toBeInTheDocument();
    expect(screen.getByText(/Review and approve vet registrations and organization requests/)).toBeInTheDocument();
  });

  it('shows pending vet and org counts after load', async () => {
    vi.mocked(api.getPendingVetApprovals).mockResolvedValue([
      { id: '1', email: 'v@t.com', fullName: 'Vet One', status: 'PENDING_APPROVAL', profileCompleted: true } as any,
    ]);
    vi.mocked(api.getPendingOrgApprovals).mockResolvedValue([
      { id: 'o1', name: 'Org One', address: 'A', city: 'C', status: 'PENDING_APPROVAL', createdAt: '', updatedAt: '' } as any,
    ]);
    renderAdminDashboard();
    await waitFor(() => {
      const counts = screen.getAllByText('1');
      expect(counts).toHaveLength(2);
    });
    expect(screen.getByText('Pending vet approvals')).toBeInTheDocument();
    expect(screen.getByText('Pending org approvals')).toBeInTheDocument();
  });

  it('renders Review links to vet and org approval pages', async () => {
    renderAdminDashboard();
    await waitFor(() => {
      const reviewLinks = screen.getAllByRole('link', { name: /review/i });
      expect(reviewLinks.length).toBe(2);
    });
    const reviewLinks = screen.getAllByRole('link', { name: /review/i });
    expect(reviewLinks[0]).toHaveAttribute('href', '/admin/vets');
    expect(reviewLinks[1]).toHaveAttribute('href', '/admin/organizations');
  });
});
