import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReasonModal } from './ReasonModal';

describe('ReasonModal', () => {
  it('renders title, description and reason label when open', async () => {
    const onOpenChange = vi.fn();
    render(
      <ReasonModal
        open={true}
        onOpenChange={onOpenChange}
        title="Reject vet"
        description="Provide a reason."
        submitLabel="Reject"
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByRole('heading', { name: 'Reject vet' })).toBeInTheDocument();
    expect(screen.getByText('Provide a reason.')).toBeInTheDocument();
    expect(screen.getByLabelText(/Reason \(required, min 10 characters\)/)).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <ReasonModal
        open={false}
        onOpenChange={vi.fn()}
        title="Reject vet"
        description="Provide a reason."
        submitLabel="Reject"
        onSubmit={vi.fn()}
      />
    );
    expect(screen.queryByRole('heading', { name: 'Reject vet' })).not.toBeInTheDocument();
  });

  it('disables submit when reason is less than 10 characters', async () => {
    const user = userEvent.setup();
    render(
      <ReasonModal
        open={true}
        onOpenChange={vi.fn()}
        title="Reject"
        description="Desc"
        submitLabel="Submit"
        onSubmit={vi.fn()}
      />
    );
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'short');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    await user.clear(textarea);
    await user.type(textarea, '123456789'); // 9 chars
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('enables submit when reason has at least 10 characters', async () => {
    const user = userEvent.setup();
    render(
      <ReasonModal
        open={true}
        onOpenChange={vi.fn()}
        title="Reject"
        description="Desc"
        submitLabel="Submit"
        onSubmit={vi.fn()}
      />
    );
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Exactly ten!!');
    expect(screen.getByRole('button', { name: 'Submit' })).not.toBeDisabled();
  });

  it('calls onSubmit with trimmed reason when valid and submit clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    render(
      <ReasonModal
        open={true}
        onOpenChange={onOpenChange}
        title="Reject"
        description="Desc"
        submitLabel="Submit"
        onSubmit={onSubmit}
      />
    );
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, '  A valid reason that is long enough  ');
    const submitBtn = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('A valid reason that is long enough');
    });
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <ReasonModal
        open={true}
        onOpenChange={onOpenChange}
        title="Reject"
        description="Desc"
        submitLabel="Submit"
        onSubmit={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows error message when onSubmit throws', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'));
    render(
      <ReasonModal
        open={true}
        onOpenChange={vi.fn()}
        title="Reject"
        description="Desc"
        submitLabel="Submit"
        onSubmit={onSubmit}
      />
    );
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'A valid reason that is long enough');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
    expect(onSubmit).toHaveBeenCalled();
  });
});
