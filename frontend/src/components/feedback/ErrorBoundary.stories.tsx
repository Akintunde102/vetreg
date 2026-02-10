import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './ErrorBoundary';

const Throw = () => {
  throw new Error('Story error');
};

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Feedback/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ErrorBoundary>;

export const NoError: Story = {
  args: {
    children: <div className="p-4 bg-muted rounded">Child content (no error)</div>,
  },
};

export const WithError: Story = {
  args: {
    children: <Throw />,
  },
};

export const CustomFallback: Story = {
  args: {
    children: <Throw />,
    fallback: (
      <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-center">
        <p className="font-semibold text-destructive">Custom fallback message</p>
        <p className="text-sm text-muted-foreground mt-1">Something went wrong in this story.</p>
      </div>
    ),
  },
};
