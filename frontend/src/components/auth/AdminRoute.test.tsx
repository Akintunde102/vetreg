import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AdminRoute } from './AdminRoute';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/hooks/useAuth';

function AdminChild() {
  return <div>Admin content</div>;
}

function renderAdminRoute(auth: { isAuthenticated: boolean; isLoading: boolean; isMasterAdmin: boolean }) {
  (useAuth as ReturnType<typeof vi.fn>).mockReturnValue(auth);
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminChild />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminRoute', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('shows loading spinner when isLoading is true', () => {
    renderAdminRoute({ isAuthenticated: false, isLoading: true, isMasterAdmin: false });
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects to login when not authenticated', () => {
    renderAdminRoute({ isAuthenticated: false, isLoading: false, isMasterAdmin: false });
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/login'),
      expect.any(Object)
    );
  });

  it('redirects to /dashboard when authenticated but not master admin', () => {
    renderAdminRoute({ isAuthenticated: true, isLoading: false, isMasterAdmin: false });
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('renders outlet when authenticated and master admin', () => {
    renderAdminRoute({ isAuthenticated: true, isLoading: false, isMasterAdmin: true });
    expect(screen.getByText('Admin content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
