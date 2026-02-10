import type { Meta, StoryObj } from '@storybook/react';
import { ScheduleCard } from './ScheduleCard';
import type { Treatment } from '@/types/api';
import { mockOrganizations, mockAnimals } from '@/lib/mock-data';

const sampleTreatment: Treatment = {
  id: 't1',
  animalId: mockAnimals[0].id,
  animal: {
    ...mockAnimals[0],
    client: {
      id: 'c1',
      firstName: 'Chidi',
      lastName: 'Okafor',
      phoneNumber: '+2348011111111',
      createdAt: '2024-01-10T00:00:00Z',
    },
  },
  organizationId: mockOrganizations[0].id,
  organization: mockOrganizations[0],
  diagnosis: 'Vaccination - Rabies',
  status: 'SCHEDULED',
  scheduledFor: '2026-02-09T09:00:00Z',
  visitDate: '2026-02-09T09:00:00Z',
  paymentStatus: 'OWED',
  amount: 15000,
  createdAt: '2026-02-08T00:00:00Z',
};

const meta: Meta<typeof ScheduleCard> = {
  title: 'Dashboard/ScheduleCard',
  component: ScheduleCard,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ScheduleCard>;

export const Default: Story = {
  args: {
    treatment: sampleTreatment,
    onSettle: () => {},
  },
};

export const WithoutSettle: Story = {
  args: {
    treatment: sampleTreatment,
  },
};
