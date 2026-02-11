import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import RevenuePage from './Revenue';
import { mockRevenue, mockTreatments, mockOrganizations } from '@/lib/mock-data';
import { useOrgStore } from '@/lib/stores/org-store';

const revenueApiShape = {
  totalRevenue: mockRevenue.totalRevenue,
  paymentBreakdown: [
    { status: 'PAID', count: mockRevenue.paymentBreakdown.PAID.count },
    { status: 'OWED', count: mockRevenue.paymentBreakdown.OWED.count },
  ],
};

function createMockQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        queryFn: ({ queryKey }) => {
          const key = queryKey as unknown[];
          if (key[0] === 'orgs' && key[2] === 'revenue') return Promise.resolve(revenueApiShape);
          if (key[0] === 'orgs' && key.length === 1) return Promise.resolve(mockOrganizations);
          if (key[0] === 'dashboard' && key[1] === 'follow-ups-today') return Promise.resolve({ count: 2 });
          if (key[0] === 'treatments') {
            return Promise.resolve({
              data: mockTreatments,
              meta: { page: 1, limit: 100, totalCount: mockTreatments.length, totalPages: 1 },
            });
          }
          return Promise.resolve(undefined);
        },
      },
    },
  });
}

function OrgSetter({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useOrgStore.getState().setCurrentOrgId('org1');
    return () => useOrgStore.getState().setCurrentOrgId(null);
  }, []);
  return <>{children}</>;
}

const withProviders = (Story: React.ComponentType) => {
  const queryClient = createMockQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter>
          <OrgSetter>
            <div className="min-h-[80vh] w-full max-w-5xl p-4 bg-background">
              <Story />
            </div>
            <Toaster />
          </OrgSetter>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const meta: Meta<typeof RevenuePage> = {
  title: 'Pages/Revenue',
  component: RevenuePage,
  tags: ['autodocs'],
  decorators: [withProviders],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof RevenuePage>;

export const Default: Story = {};

export const WithRevenueData: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Revenue page with mock revenue summary, payment cards (Pet/Livestock filters), and Don\'t Forget section.',
      },
    },
  },
};
