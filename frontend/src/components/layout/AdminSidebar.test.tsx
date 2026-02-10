import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

describe('AdminSidebar', () => {
  it('renders Site Admin section and nav links', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminSidebar />
      </MemoryRouter>
    );
    expect(screen.getByText('Site Admin')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /vet approvals/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /org approvals/i })).toBeInTheDocument();
  });

  it('links to correct paths', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminSidebar />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /overview/i })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: /vet approvals/i })).toHaveAttribute('href', '/admin/vets');
    expect(screen.getByRole('link', { name: /org approvals/i })).toHaveAttribute('href', '/admin/organizations');
  });

  it('renders Back to app link to dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminSidebar />
      </MemoryRouter>
    );
    const backLink = screen.getByRole('link', { name: /back to app/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/dashboard');
  });
});
