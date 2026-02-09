# Frontend Architecture Document

**Version:** 1.0.0  
**Last Updated:** February 9, 2026  
**Status:** Design Specification Complete

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Routing & Navigation](#routing--navigation)
7. [Authentication Flow](#authentication-flow)
8. [Component Architecture](#component-architecture)
9. [Styling Strategy](#styling-strategy)
10. [Performance Optimization](#performance-optimization)
11. [Testing Strategy](#testing-strategy)
12. [Deployment](#deployment)

---

## Overview

The frontend is a modern, responsive web application built with Next.js 14+ (App Router), designed to provide an exceptional user experience for veterinary professionals managing their practice operations.

### Key Characteristics

- **Mobile-First, Desktop-Enhanced**: Optimized for mobile with rich desktop features
- **Type-Safe**: Full TypeScript with strict mode
- **Server-Rendered**: Leveraging Next.js SSR and SSG for performance
- **Component-Driven**: Reusable, composable components
- **Accessible**: WCAG AA compliant
- **Progressive**: Offline-capable with service workers (planned)

---

## Technology Stack

### Core Framework

```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.3.0"
}
```

### UI & Styling

```json
{
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-*": "latest",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.1.0",
  "lucide-react": "^0.292.0"
}
```

### State Management

```json
{
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.4.0",
  "@supabase/ssr": "^0.1.0"
}
```

### Forms & Validation

```json
{
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0"
}
```

### Utilities

```json
{
  "date-fns": "^2.30.0",
  "axios": "^1.6.0",
  "sonner": "^1.2.0",
  "react-hot-toast": "^2.4.0"
}
```

---

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth layout group
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/              # Dashboard layout group
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Main dashboard
│   │   │   ├── clients/
│   │   │   ├── animals/
│   │   │   ├── treatments/
│   │   │   ├── schedule/
│   │   │   ├── revenue/
│   │   │   └── settings/
│   │   └── layout.tsx            # Dashboard layout
│   ├── (onboarding)/             # Onboarding layout group
│   │   └── onboarding/
│   ├── organizations/
│   ├── auth/
│   │   └── callback/
│   ├── api/                      # API routes (if needed)
│   ├── globals.css
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── top-bar.tsx
│   │   ├── sidebar.tsx
│   │   ├── bottom-nav.tsx
│   │   ├── page-header.tsx
│   │   └── dashboard-layout.tsx
│   ├── cards/                    # Card components
│   │   ├── clinic-card.tsx
│   │   ├── pet-card.tsx
│   │   ├── payment-card.tsx
│   │   ├── schedule-card.tsx
│   │   └── stats-widget.tsx
│   ├── forms/                    # Form components
│   │   ├── profile-form.tsx
│   │   ├── animal-form.tsx
│   │   ├── treatment-form.tsx
│   │   └── field-wrappers/
│   ├── feedback/                 # Feedback components
│   │   ├── toast-provider.tsx
│   │   ├── loading-skeleton.tsx
│   │   ├── empty-state.tsx
│   │   └── error-boundary.tsx
│   └── domain/                   # Feature-specific components
│       ├── organizations/
│       ├── animals/
│       ├── treatments/
│       ├── clients/
│       └── revenue/
│
├── lib/
│   ├── api/                      # API client
│   │   ├── client.ts             # Axios instance
│   │   ├── endpoints/
│   │   │   ├── vets.ts
│   │   │   ├── orgs.ts
│   │   │   ├── clients.ts
│   │   │   ├── animals.ts
│   │   │   └── treatments.ts
│   │   └── types/                # API types
│   ├── hooks/                    # Custom hooks
│   │   ├── use-auth.ts
│   │   ├── use-org.ts
│   │   ├── use-pagination.ts
│   │   ├── use-debounce.ts
│   │   └── use-media-query.ts
│   ├── utils/                    # Utility functions
│   │   ├── cn.ts                 # className utility
│   │   ├── format.ts             # Formatting helpers
│   │   ├── validation.ts         # Validation schemas
│   │   └── constants.ts
│   ├── stores/                   # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── org-store.ts
│   │   └── ui-store.ts
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── illustrations/
│
├── types/
│   ├── api.ts                    # API response types
│   ├── models.ts                 # Data models
│   └── common.ts                 # Common types
│
├── styles/
│   └── globals.css               # Global styles
│
├── config/
│   ├── site.ts                   # Site configuration
│   └── constants.ts              # App constants
│
├── middleware.ts                 # Next.js middleware
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## State Management

### 1. Server State (TanStack Query)

**Purpose:** Manage all data fetched from the API

```typescript
// lib/api/client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      onError: handleQueryError
    },
    mutations: {
      onError: handleMutationError
    }
  }
});

// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Query Keys Convention:**

```typescript
// lib/api/query-keys.ts
export const queryKeys = {
  vets: {
    profile: ['vet', 'profile'] as const,
    approvalStatus: ['vet', 'approval-status'] as const
  },
  orgs: {
    all: ['orgs'] as const,
    detail: (orgId: string) => ['orgs', orgId] as const,
    members: (orgId: string) => ['orgs', orgId, 'members'] as const,
    revenue: (orgId: string) => ['orgs', orgId, 'revenue'] as const
  },
  clients: {
    list: (orgId: string, filters: any) => ['clients', orgId, filters] as const,
    detail: (orgId: string, clientId: string) => ['clients', orgId, clientId] as const
  },
  animals: {
    list: (orgId: string, filters: any) => ['animals', orgId, filters] as const,
    detail: (orgId: string, animalId: string) => ['animals', orgId, animalId] as const,
    vaccinationDue: (orgId: string) => ['animals', orgId, 'vaccination-due'] as const
  },
  treatments: {
    list: (orgId: string, filters: any) => ['treatments', orgId, filters] as const,
    detail: (orgId: string, treatmentId: string) => ['treatments', orgId, treatmentId] as const,
    scheduled: (orgId: string) => ['treatments', orgId, 'scheduled'] as const,
    followUps: (orgId: string) => ['treatments', orgId, 'follow-ups'] as const
  },
  dashboard: {
    stats: (orgId: string) => ['dashboard', 'stats', orgId] as const
  }
};
```

**Usage Example:**

```typescript
// app/(dashboard)/dashboard/page.tsx
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/query-keys';
import { api } from '@/lib/api/client';

export default function DashboardPage() {
  const { currentOrgId } = useCurrentOrg();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: queryKeys.dashboard.stats(currentOrgId),
    queryFn: () => api.dashboard.getStats(currentOrgId),
    enabled: !!currentOrgId
  });
  
  return <DashboardView stats={stats} isLoading={isLoading} />;
}
```

### 2. Client State (Zustand)

**Purpose:** Manage UI state, user preferences, and ephemeral data

```typescript
// lib/stores/org-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OrgState {
  currentOrgId: string | null;
  setCurrentOrgId: (orgId: string) => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      currentOrgId: null,
      setCurrentOrgId: (orgId) => set({ currentOrgId: orgId })
    }),
    {
      name: 'org-storage'
    }
  )
);

// lib/stores/ui-store.ts
interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  commandPaletteOpen: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false })
}));
```

### 3. Auth State (Supabase + Custom Hook)

```typescript
// lib/hooks/use-auth.ts
import { useSupabaseUser, useSessionContext } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/query-keys';

export function useAuth() {
  const { session, isLoading: isSessionLoading } = useSessionContext();
  const user = useSupabaseUser();
  
  // Fetch vet profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: queryKeys.vets.profile,
    queryFn: () => api.vets.getProfile(),
    enabled: !!session
  });
  
  return {
    session,
    user,
    profile,
    isLoading: isSessionLoading || isProfileLoading,
    isAuthenticated: !!session,
    isApproved: profile?.status === 'APPROVED',
    isPending: profile?.status === 'PENDING_APPROVAL',
    isRejected: profile?.status === 'REJECTED',
    isSuspended: profile?.status === 'SUSPENDED'
  };
}
```

---

## API Integration

### API Client Setup

```typescript
// lib/api/client.ts
import axios, { AxiosInstance } from 'axios';
import { createClient } from '@/lib/supabase/client';

class APIClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Request interceptor: Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor: Handle errors
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        const message = error.response?.data?.error?.message || 'Something went wrong';
        const code = error.response?.data?.error?.code;
        
        if (error.response?.status === 401) {
          // Redirect to login
          window.location.href = '/login';
        }
        
        return Promise.reject({ message, code, status: error.response?.status });
      }
    );
  }
  
  get vets() {
    return {
      getProfile: () => this.client.get('/vets/profile'),
      completeProfile: (data: any) => this.client.post('/vets/profile/complete', data),
      getApprovalStatus: () => this.client.get('/vets/approval-status')
    };
  }
  
  get orgs() {
    return {
      getAll: () => this.client.get('/orgs'),
      getOne: (orgId: string) => this.client.get(`/orgs/${orgId}`),
      create: (data: any) => this.client.post('/orgs', data),
      update: (orgId: string, data: any) => this.client.patch(`/orgs/${orgId}`, data),
      getMembers: (orgId: string) => this.client.get(`/orgs/${orgId}/members`),
      getRevenue: (orgId: string, params?: any) => 
        this.client.get(`/orgs/${orgId}/revenue`, { params })
    };
  }
  
  get clients() {
    return {
      getAll: (orgId: string, params?: any) => 
        this.client.get(`/orgs/${orgId}/clients`, { params }),
      getOne: (orgId: string, clientId: string) => 
        this.client.get(`/orgs/${orgId}/clients/${clientId}`),
      create: (orgId: string, data: any) => 
        this.client.post(`/orgs/${orgId}/clients`, data),
      update: (orgId: string, clientId: string, data: any) => 
        this.client.patch(`/orgs/${orgId}/clients/${clientId}`, data),
      delete: (orgId: string, clientId: string, reason: string) => 
        this.client.delete(`/orgs/${orgId}/clients/${clientId}`, { data: { deletionReason: reason } })
    };
  }
  
  // ... similar for animals, treatments, etc.
  
  get dashboard() {
    return {
      getStats: (orgId: string) => this.client.get(`/orgs/${orgId}/dashboard/stats`)
    };
  }
}

export const api = new APIClient();
```

---

## Routing & Navigation

### Route Structure

```
/                                 # Marketing homepage (public)
/login                            # Login page (public)
/signup                           # Signup page (public)
/auth/callback                    # OAuth callback handler (public)

/onboarding/profile               # Profile completion (protected)
/onboarding/pending               # Awaiting approval (protected)

/dashboard                        # Main dashboard (protected, approved)
/dashboard/clients                # Clients list
/dashboard/clients/[id]           # Client detail
/dashboard/animals                # Animals list
/dashboard/animals/[id]           # Animal detail
/dashboard/treatments             # Treatments list
/dashboard/treatments/[id]        # Treatment detail
/dashboard/schedule               # Schedule/Calendar
/dashboard/revenue                # Revenue & Payments
/dashboard/settings               # Settings

/organizations                    # Organizations list (protected, approved)

/account/rejected                 # Rejection notice (protected)
/account/suspended                # Suspension notice (protected)

/admin/vets                       # Master admin: Vet review (protected, admin)
/admin/orgs                       # Master admin: Org review (protected, admin)
```

### Navigation Guards (Middleware)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session }
  } = await supabase.auth.getSession();
  
  const { pathname } = req.nextUrl;
  
  // Public routes
  const publicRoutes = ['/', '/login', '/signup', '/auth/callback'];
  if (publicRoutes.includes(pathname)) {
    return res;
  }
  
  // Require authentication
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Fetch vet profile
  const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vets/profile`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });
  
  if (!profileRes.ok) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  const profile = await profileRes.json();
  
  // Route based on vet status
  if (!profile.data.profileCompleted && pathname !== '/onboarding/profile') {
    return NextResponse.redirect(new URL('/onboarding/profile', req.url));
  }
  
  if (profile.data.status === 'PENDING_APPROVAL' && pathname !== '/onboarding/pending') {
    return NextResponse.redirect(new URL('/onboarding/pending', req.url));
  }
  
  if (profile.data.status === 'REJECTED' && pathname !== '/account/rejected') {
    return NextResponse.redirect(new URL('/account/rejected', req.url));
  }
  
  if (profile.data.status === 'SUSPENDED' && pathname !== '/account/suspended') {
    return NextResponse.redirect(new URL('/account/suspended', req.url));
  }
  
  // Allow approved vets to access dashboard
  if (profile.data.status === 'APPROVED') {
    return res;
  }
  
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)']
};
```

---

## Authentication Flow

### 1. Login/Signup

```typescript
// components/auth/google-signin-button.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export function GoogleSignInButton() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      toast.error('Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleSignIn} 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.google className="mr-2 h-4 w-4" />
      )}
      Sign in with Google
    </Button>
  );
}
```

### 2. OAuth Callback

```typescript
// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    await supabase.auth.exchangeCodeForSession(code);
  }
  
  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

### 3. Protected Route Component

```typescript
// components/auth/protected-route.tsx
'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, isApproved, isPending, isRejected, isSuspended } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (isPending) {
        router.push('/onboarding/pending');
      } else if (isRejected) {
        router.push('/account/rejected');
      } else if (isSuspended) {
        router.push('/account/suspended');
      }
    }
  }, [isLoading, isAuthenticated, isApproved, isPending, isRejected, isSuspended, router]);
  
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }
  
  if (!isAuthenticated || !isApproved) {
    return null;
  }
  
  return <>{children}</>;
}
```

---

## Component Architecture

### Component Categories

1. **UI Primitives** (`components/ui/`)
   - Button, Input, Select, Checkbox, etc.
   - From shadcn/ui
   - Highly reusable, no business logic

2. **Layout Components** (`components/layout/`)
   - TopBar, Sidebar, BottomNav
   - Page structure components
   - Handle navigation and layout

3. **Card Components** (`components/cards/`)
   - ClinicCard, PetCard, PaymentCard
   - Display data in card format
   - Can include actions

4. **Form Components** (`components/forms/`)
   - ProfileForm, AnimalForm, TreatmentForm
   - Complex form logic
   - Validation and submission

5. **Feedback Components** (`components/feedback/`)
   - Toast, LoadingSkeleton, EmptyState
   - User feedback
   - Error boundaries

6. **Domain Components** (`components/domain/`)
   - Feature-specific components
   - Can compose multiple primitives
   - Business logic allowed

### Component Design Principles

```typescript
// ✅ Good: Single Responsibility
export function PetCard({ pet, onView, onMessage }: PetCardProps) {
  return (
    <Card>
      <CardImage src={pet.photoUrl} alt={pet.name} />
      <CardContent>
        <CardTitle>{pet.name}</CardTitle>
        <CardDescription>{pet.owner.name}</CardDescription>
      </CardContent>
      <CardActions>
        <Button onClick={() => onView(pet.id)}>View</Button>
        <Button onClick={() => onMessage(pet.owner)}>Message</Button>
      </CardActions>
    </Card>
  );
}

// ❌ Bad: Too many responsibilities
export function PetCard({ petId }: { petId: string }) {
  const { data: pet } = useQuery(...);
  const mutation = useMutation(...);
  const router = useRouter();
  
  // Too much logic in component
  const handleView = () => { /* ... */ };
  const handleMessage = () => { /* ... */ };
  const handleDelete = () => { /* ... */ };
  
  return <div>...</div>;
}
```

---

This document continues with Performance Optimization, Testing Strategy, and Deployment sections. Due to length, I'll create a summary document that ties everything together.

