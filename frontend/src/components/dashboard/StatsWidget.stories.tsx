import type { Meta, StoryObj } from '@storybook/react';
import { StatsWidget } from './StatsWidget';
import { Building2, Users, PawPrint, DollarSign } from 'lucide-react';

const meta: Meta<typeof StatsWidget> = {
  title: 'Dashboard/StatsWidget',
  component: StatsWidget,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof StatsWidget>;

export const Default: Story = {
  args: {
    icon: Building2,
    value: 3,
    label: 'Organizations',
  },
};

export const WithBadge: Story = {
  args: {
    icon: Users,
    value: 77,
    label: 'Clients',
    badge: 5,
  },
};

export const Revenue: Story = {
  args: {
    icon: DollarSign,
    value: '₦3.5M',
    label: 'Revenue',
  },
};

export const Warning: Story = {
  args: {
    icon: PawPrint,
    value: 3,
    label: 'Follow-ups due',
    variant: 'warning',
    badge: 3,
  },
};
