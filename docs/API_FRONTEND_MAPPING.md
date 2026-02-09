# API-Frontend Mapping Document

**Version:** 1.1.0  
**Last Updated:** February 9, 2026  
**Backend Version:** v1.2.0

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Page-by-Page API Mapping](#page-by-page-api-mapping)
4. [Component-Level API Usage](#component-level-api-usage)
5. [Real-time Updates & Polling](#real-time-updates--polling)
6. [Error Handling Strategy](#error-handling-strategy)
7. [Caching Strategy](#caching-strategy)

---

## Overview

This document maps every frontend page and component to the backend API endpoints it consumes. It serves as the source of truth for frontend developers to understand which APIs to call for each feature.

### API Base URL

```
Development: http://localhost:3001/api/v1
Production:  https://api.vet-reg.com/api/v1
```

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <supabase_jwt_token>
```

---

## Authentication Flow

### 1. Login/Signup (Google OAuth)

**Frontend Pages:** `/login`, `/signup`

**Flow:**
1. User clicks "Sign in with Google"
2. Redirect to Supabase Auth (Google OAuth)
3. Callback to `/auth/callback` with auth code
4. Exchange code for session (handled by @supabase/ssr)
5. Call backend to verify/create vet record

**API Endpoints:**

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| GET | `/vets/profile` | Check if vet exists, get profile | `{ vet: VetProfile }` |
| GET | `/vets/approval-status` | Check vet approval status | `{ status: VetStatus, ... }` |

**Implementation:**

```typescript
// After OAuth callback
const session = await supabase.auth.getSession();
const token = session.data.session?.access_token;

// Call backend
const profile = await fetch('/api/v1/vets/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Route based on status
if (!profile.profileCompleted) {
  router.push('/onboarding/profile');
} else if (profile.status === 'PENDING_APPROVAL') {
  router.push('/onboarding/pending');
} else if (profile.status === 'REJECTED') {
  router.push('/account/rejected');
} else if (profile.status === 'SUSPENDED') {
  router.push('/account/suspended');
} else {
  router.push('/dashboard');
}
```

### 2. Profile Completion

**Frontend Page:** `/onboarding/profile`

**API Endpoints:**

| Method | Endpoint | Purpose | Body | Response |
|--------|----------|---------|------|----------|
| POST | `/vets/profile/complete` | Submit profile for approval | `CompleteProfileDto` | `{ vet: VetProfile }` |

**Body Schema:**

```typescript
{
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string; // ISO date
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  profilePhotoUrl?: string;
  vcnNumber: string; // Unique
  specialization?: string;
  yearsOfExperience?: number;
  qualifications?: string[];
  universityAttended?: string;
  graduationYear?: number;
  practiceAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  practiceType?: 'SMALL_ANIMAL' | 'LARGE_ANIMAL' | 'MIXED' | ...;
}
```

---

## Page-by-Page API Mapping

### 🏠 Dashboard (Home) — `/dashboard`

**Screen:** "Good morning, Dr. Johnson" (Screen 4)

#### APIs Called:

| API | Purpose | Frequency |
|-----|---------|-----------|
| `GET /orgs` | Get all organizations user belongs to | On load |
| `GET /orgs/:orgId/clients?page=1&limit=10` | Count total clients | On org switch |
| `GET /orgs/:orgId/animals?page=1&limit=10` | Count total pets/livestock | On org switch |
| `GET /orgs/:orgId/treatments?page=1&limit=10` | Count treatments | On org switch |
| `GET /orgs/:orgId/revenue` | Get revenue stats | On org switch |
| `GET /orgs/:orgId/treatments?status=FOLLOW_UP_REQUIRED&limit=5` | Get pending payments | On org switch |
| `GET /orgs/:orgId/treatments/scheduled/list?page=1&limit=10` | Get unsettled schedules | On org switch |

#### Component Breakdown:

**1. Greeting Section**
```typescript
// Static personalization
const { data: profile } = useQuery({
  queryKey: ['vet', 'profile'],
  queryFn: () => api.get('/vets/profile')
});

const greeting = `Good morning, ${profile.fullName}`;
const today = format(new Date(), 'EEEE, MMMM dd');
```

**2. Stats Widgets**

```typescript
const { data: orgs } = useQuery({
  queryKey: ['orgs'],
  queryFn: () => api.get('/orgs')
});

const { data: clients } = useQuery({
  queryKey: ['clients', orgId],
  queryFn: () => api.get(`/orgs/${orgId}/clients`, { params: { page: 1, limit: 1 } }),
  select: (data) => data.meta.totalCount
});

const { data: animals } = useQuery({
  queryKey: ['animals', orgId],
  queryFn: () => api.get(`/orgs/${orgId}/animals`, { params: { page: 1, limit: 1 } }),
  select: (data) => data.meta.totalCount
});

const { data: treatments } = useQuery({
  queryKey: ['treatments', orgId],
  queryFn: () => api.get(`/orgs/${orgId}/treatments`, { params: { page: 1, limit: 1 } }),
  select: (data) => data.meta.totalCount
});

const { data: revenue } = useQuery({
  queryKey: ['revenue', orgId],
  queryFn: () => api.get(`/orgs/${orgId}/revenue`)
});

const { data: followUps } = useQuery({
  queryKey: ['treatments', orgId, 'follow-ups'],
  queryFn: () => api.get(`/orgs/${orgId}/treatments`, { 
    params: { status: 'FOLLOW_UP_REQUIRED', limit: 100 } 
  }),
  select: (data) => data.data.filter(t => isToday(t.followUpDate))
});

const { data: scheduledTreatments } = useQuery({
  queryKey: ['treatments', orgId, 'scheduled'],
  queryFn: () => api.get(`/orgs/${orgId}/treatments/scheduled/list`, { 
    params: { page: 1, limit: 10 } 
  })
});
```

**Stats Widget Data:**
- **Vet Clinics**: `orgs.length` → Click navigates to `/organizations`
- **Clients**: `clients.totalCount` → Navigate to `/dashboard/clients`
- **Pets**: `animals.totalCount` → Navigate to `/dashboard/animals`
- **Livestocks**: `animals.filter(a => a.patientType !== 'SINGLE_PET').length`
- **Revenue**: `₦${revenue.totalRevenue.toLocaleString()}` → Navigate to `/dashboard/revenue`
- **Pending Payments**: `revenue.totalOwed` count → Navigate to `/dashboard/revenue?status=OWED`
- **Upcoming Appointments**: `scheduledTreatments.totalCount` → Navigate to `/dashboard/schedule`

**3. Unsettled Schedules**

```typescript
const { data: schedules } = useQuery({
  queryKey: ['scheduled-treatments', orgId],
  queryFn: () => api.get(`/orgs/${orgId}/treatments/scheduled/list`, {
    params: { page: 1, limit: 10 }
  })
});

// Map to UI
schedules.data.map(treatment => ({
  time: format(treatment.scheduledFor, 'h:mm a'),
  type: treatment.diagnosis || 'General Check',
  petName: treatment.animal.name,
  clientName: `${treatment.animal.client.firstName} ${treatment.animal.client.lastName}`,
  action: () => router.push(`/dashboard/treatments/${treatment.id}`)
}));
```

**4. Don't Forget Section**

```typescript
const todayFollowUps = followUps.filter(t => 
  isToday(parseISO(t.followUpDate))
);

const unpaidInvoices = treatments.filter(t => 
  t.paymentStatus === 'OWED'
);
```

---

### 🏥 Vet Clinics (Organizations) — `/organizations`

**Screen:** "Vet Clinics" (Screen 1)

#### APIs Called:

| API | Purpose | Frequency |
|-----|---------|-----------|
| `GET /orgs` | List all organizations user belongs to | On load, after create |
| `GET /orgs/:orgId` | Get specific org details | On click "View" |
| `GET /orgs/:orgId/clients?limit=1` | Count clients per org | On load (for each org) |

#### Component Breakdown:

**1. Search Bar**

```typescript
const [searchQuery, setSearchQuery] = useState('');
const filteredOrgs = orgs.filter(org => 
  org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  org.address.toLowerCase().includes(searchQuery.toLowerCase())
);
```

**2. Clinic Cards**

```typescript
const { data: orgs } = useQuery({
  queryKey: ['orgs'],
  queryFn: () => api.get('/orgs')
});

// For each org, get client count
const { data: clientCount } = useQuery({
  queryKey: ['clients', org.id, 'count'],
  queryFn: () => api.get(`/orgs/${org.id}/clients`, { params: { page: 1, limit: 1 } }),
  select: (data) => data.meta.totalCount
});

// Card data
{
  icon: org.logoUrl || <BuildingIcon />,
  name: org.name,
  address: `${org.address}, ${org.city}`,
  clientCount: clientCount, // Badge number
  referralsThisMonth: clientCount, // "18 patients referred this month"
  updatedAt: formatDistanceToNow(parseISO(org.updatedAt)) + ' ago',
  status: org.status === 'APPROVED' ? null : {
    text: org.status === 'PENDING_APPROVAL' ? 'Pending approval' : 'In network',
    color: org.status === 'PENDING_APPROVAL' ? 'warning' : 'info'
  },
  paymentTerms: org.paymentTerms || 'Monthly invoicing', // Custom field needed
  onClick: () => router.push(`/dashboard?org=${org.id}`)
}
```

**3. Pending Verification Section**

```typescript
const { data: pendingOrgs } = useQuery({
  queryKey: ['orgs', 'pending'],
  queryFn: () => api.get('/orgs'),
  select: (data) => data.data.filter(org => org.status === 'PENDING_APPROVAL')
});

// Show count and "View All" link
{
  count: pendingOrgs.length,
  message: `${pendingOrgs.length} new clinics awaiting approval`,
  onClick: () => router.push('/organizations?status=pending')
}
```

**4. Add New Button**

```typescript
const createOrg = useMutation({
  mutationFn: (data) => api.post('/orgs', data),
  onSuccess: () => {
    queryClient.invalidateQueries(['orgs']);
    toast.success('Organization created successfully');
  }
});
```

**Missing API Fields:**
- `paymentTerms` (string) — Should be added to Organization model

---

### 🐾 Pets/Animals — `/dashboard/animals`

**Screen:** "Pets" (Screen 2)

#### APIs Called:

| API | Purpose | Frequency |
|-----|---------|-----------|
| `GET /orgs/:orgId/animals?page=1&limit=20&species=...` | List animals with filters | On load, filter change |
| `GET /orgs/:orgId/animals/:animalId` | Get animal details | On click "View" |
| `GET /orgs/:orgId/animals/:animalId/treatments` | Get treatment history | On animal detail page |
| `GET /orgs/:orgId/clients/:clientId` | Get client details (for "Client" button) | On demand |

#### Component Breakdown:

**1. Search Bar**

```typescript
const [searchQuery, setSearchQuery] = useState('');
const { data: animals, isLoading } = useQuery({
  queryKey: ['animals', orgId, searchQuery, filters],
  queryFn: () => api.get(`/orgs/${orgId}/animals`, {
    params: {
      page: 1,
      limit: 20,
      search: searchQuery,
      species: filters.species,
      clientId: filters.clientId
    }
  })
});
```

**2. Filter Chips**

```typescript
const tabs = [
  { label: 'All', value: 'ALL', count: allCount },
  { label: 'Dogs', value: 'DOG', count: dogCount },
  { label: 'Cats', value: 'CAT', count: catCount },
  { label: 'Other', value: 'OTHER', count: otherCount }
];

const { data: counts } = useQuery({
  queryKey: ['animals', orgId, 'counts'],
  queryFn: async () => {
    const [all, dogs, cats, other] = await Promise.all([
      api.get(`/orgs/${orgId}/animals`, { params: { limit: 1 } }),
      api.get(`/orgs/${orgId}/animals`, { params: { species: 'DOG', limit: 1 } }),
      api.get(`/orgs/${orgId}/animals`, { params: { species: 'CAT', limit: 1 } }),
      // Fetch counts for other species
    ]);
    return { all, dogs, cats, other };
  }
});
```

**3. Animal Cards**

```typescript
const animalCard = (animal) => ({
  image: animal.photoUrl || getDefaultAnimalImage(animal.species),
  name: animal.name,
  owner: `${animal.client.firstName} ${animal.client.lastName}`,
  species: animal.species,
  speciesIcon: getSpeciesIcon(animal.species), // 🐕 🐈 etc
  
  // Next schedule or last visit
  schedule: await (async () => {
    const treatments = await api.get(`/orgs/${orgId}/animals/${animal.id}/treatments`, {
      params: { limit: 1, sort: 'visitDate:desc' }
    });
    
    const latestTreatment = treatments.data[0];
    
    if (latestTreatment?.followUpDate && isFuture(parseISO(latestTreatment.followUpDate))) {
      return {
        type: latestTreatment.diagnosis || 'Follow-up',
        time: formatDistanceToNow(parseISO(latestTreatment.followUpDate)),
        icon: 'calendar'
      };
    } else if (latestTreatment) {
      return {
        type: 'Last visit updated',
        time: formatDistanceToNow(parseISO(latestTreatment.visitDate)) + ' ago',
        icon: 'clock'
      };
    } else {
      return {
        type: 'No treatments yet',
        time: '',
        icon: 'info'
      };
    }
  })(),
  
  // Vaccination status
  vaccination: await (async () => {
    const treatments = await api.get(`/orgs/${orgId}/animals/${animal.id}/treatments`, {
      params: { limit: 10, sort: 'visitDate:desc' }
    });
    
    const vaccinationTreatment = treatments.data.find(t => 
      t.diagnosis?.toLowerCase().includes('vaccination') ||
      t.treatmentGiven?.toLowerCase().includes('vaccination')
    );
    
    if (!vaccinationTreatment) {
      return { status: 'unknown', color: 'gray' };
    }
    
    const daysSinceVaccination = differenceInDays(new Date(), parseISO(vaccinationTreatment.visitDate));
    
    if (daysSinceVaccination > 365) {
      return { status: 'due', color: 'warning', icon: '⚠️' };
    } else if (daysSinceVaccination > 330) {
      return { status: 'upcoming', color: 'info', icon: '📅', text: 'Due in ' + (365 - daysSinceVaccination) + ' days' };
    } else {
      return { status: 'current', color: 'success', icon: '✓', text: 'Up to date' };
    }
  })(),
  
  actions: {
    view: () => router.push(`/dashboard/animals/${animal.id}`),
    message: () => openMessageModal(animal.client),
    viewClient: () => router.push(`/dashboard/clients/${animal.clientId}`)
  }
});
```

**4. Don't Forget Section**

```typescript
// Pets due for vaccination
const { data: vaccinationDue } = useQuery({
  queryKey: ['animals', orgId, 'vaccination-due'],
  queryFn: async () => {
    const animals = await api.get(`/orgs/${orgId}/animals`, { params: { limit: 100 } });
    
    const due = await Promise.all(
      animals.data.map(async (animal) => {
        const treatments = await api.get(`/orgs/${orgId}/animals/${animal.id}/treatments`);
        const lastVaccination = treatments.data.find(t => 
          t.diagnosis?.includes('vaccination')
        );
        
        if (!lastVaccination || differenceInDays(new Date(), parseISO(lastVaccination.visitDate)) > 365) {
          return animal;
        }
        return null;
      })
    );
    
    return due.filter(Boolean);
  }
});

// Follow-ups today
const { data: followUpsToday } = useQuery({
  queryKey: ['treatments', orgId, 'follow-ups-today'],
  queryFn: () => api.get(`/orgs/${orgId}/treatments`, {
    params: { status: 'FOLLOW_UP_REQUIRED' }
  }),
  select: (data) => data.data.filter(t => isToday(parseISO(t.followUpDate)))
});
```

**Missing API Features:**
- Need efficient way to query vaccination status (consider adding `lastVaccinationDate` to Animal model)
- Consider adding `GET /orgs/:orgId/animals/vaccination-due` endpoint

---

### 💰 Revenue — `/dashboard/revenue`

**Screen:** "Revenue" (Screen 3)

#### APIs Called:

| API | Purpose | Frequency |
|-----|---------|-----------|
| `GET /orgs/:orgId/revenue` | Get revenue summary | On load, date change |
| `GET /orgs/:orgId/treatments?paymentStatus=...&page=...` | List payments by status | On tab change, pagination |
| `POST /orgs/:orgId/treatments/:treatmentId/payment` | Mark payment as paid | On action |

#### Component Breakdown:

**1. Date Range Picker**

```typescript
const [dateRange, setDateRange] = useState({
  from: startOfMonth(new Date()),
  to: endOfMonth(new Date())
});

const { data: revenue } = useQuery({
  queryKey: ['revenue', orgId, dateRange],
  queryFn: () => api.get(`/orgs/${orgId}/revenue`, {
    params: {
      fromDate: dateRange.from.toISOString(),
      toDate: dateRange.to.toISOString()
    }
  })
});
```

**Note:** Backend needs to support date range filtering on `/orgs/:orgId/revenue`.

**2. Summary Cards**

```typescript
{
  totalRevenue: `₦${revenue.totalRevenue.toLocaleString()}`,
  pending: `(${revenue.paymentBreakdown.OWED.count})`,
  paid: `(${revenue.paymentBreakdown.PAID.count})`
}
```

**3. Tab Filters**

```typescript
const tabs = [
  { label: 'All Payments', value: 'ALL' },
  { label: 'Pet Payment', value: 'PET' },
  { label: 'Livestock Payment', value: 'LIVESTOCK' },
  { label: 'Farm Payments', value: 'FARM' }
];

const [activeTab, setActiveTab] = useState('ALL');

const { data: payments } = useQuery({
  queryKey: ['treatments', orgId, 'payments', activeTab, page],
  queryFn: () => api.get(`/orgs/${orgId}/treatments`, {
    params: {
      page,
      limit: 20,
      paymentStatus: activeTab === 'ALL' ? undefined : activeTab,
      // Filter by patient type
      ...(activeTab === 'PET' && { patientType: 'SINGLE_PET' }),
      ...(activeTab === 'LIVESTOCK' && { patientType: 'SINGLE_LIVESTOCK' }),
      ...(activeTab === 'FARM' && { patientType: 'BATCH_LIVESTOCK' })
    }
  })
});
```

**Note:** Backend needs to support filtering by `patientType` on treatments endpoint.

**4. Payment Cards**

```typescript
const paymentCard = (treatment) => ({
  image: treatment.animal.photoUrl,
  title: treatment.patientType === 'BATCH_LIVESTOCK' 
    ? `Batch ${treatment.animal.batchIdentifier}` 
    : treatment.animal.name,
  clinic: treatment.organization.name,
  description: treatment.patientType === 'BATCH_LIVESTOCK'
    ? `${treatment.animal.batchSize} ${treatment.animal.species.toLowerCase()}`
    : `${treatment.animal.species} - ${treatment.diagnosis}`,
  amount: `₦${treatment.amount?.toLocaleString()}`,
  status: {
    text: treatment.paymentStatus === 'PAID' ? 'Paid' : 'Owed',
    color: treatment.paymentStatus === 'PAID' ? 'success' : 'error'
  },
  date: format(parseISO(treatment.visitDate), 'MMM dd, yyyy'),
  time: format(parseISO(treatment.visitDate), 'h:mm a'),
  
  // Additional info (removed "Restock overdue")
  schedule: treatment.followUpDate ? {
    text: 'Follow-up scheduled',
    date: format(parseISO(treatment.followUpDate), 'MMM dd')
  } : null,
  
  actions: {
    view: () => router.push(`/dashboard/treatments/${treatment.id}`)
  }
});
```

**5. Mark Payment**

```typescript
const markPaid = useMutation({
  mutationFn: ({ treatmentId, data }) => 
    api.post(`/orgs/${orgId}/treatments/${treatmentId}/payment`, data),
  onSuccess: () => {
    queryClient.invalidateQueries(['revenue', orgId]);
    queryClient.invalidateQueries(['treatments', orgId]);
    toast.success('Payment marked as paid');
  }
});

// Data
{
  amountPaid: treatment.amount,
  paidBy: treatment.animal.client.id,
  paymentNotes: 'Cash payment'
}
```

**6. Don't Forget Section**

```typescript
const { data: unpaidInvoices } = useQuery({
  queryKey: ['treatments', orgId, 'unpaid'],
  queryFn: () => api.get(`/orgs/${orgId}/treatments`, {
    params: { paymentStatus: 'OWED', limit: 100 }
  }),
  select: (data) => data.data.length
});

const { data: followUpsToday } = useQuery({
  queryKey: ['treatments', orgId, 'follow-ups-today'],
  queryFn: () => api.get(`/orgs/${orgId}/treatments`, {
    params: { status: 'FOLLOW_UP_REQUIRED' }
  }),
  select: (data) => data.data.filter(t => isToday(parseISO(t.followUpDate))).length
});
```

**Required Backend Changes:**
1. Add date range filtering to `GET /orgs/:orgId/revenue`
2. Add `patientType` filter to `GET /orgs/:orgId/treatments`
3. Remove "restock" related fields (not applicable to veterinary practice)

---

### 🐶 Pet Detail Page — `/dashboard/animals/:animalId`

**Screen:** "Bella" pet detail (Screen 6)

#### APIs Called:

| API | Purpose | Frequency |
|-----|---------|-----------|
| `GET /orgs/:orgId/animals/:animalId` | Get animal details | On load |
| `GET /orgs/:orgId/clients/:clientId` | Get owner details | On load |
| `GET /orgs/:orgId/animals/:animalId/treatments` | Get treatment history | On load |

#### Component Breakdown:

**1. Pet Header**

```typescript
const { data: animal } = useQuery({
  queryKey: ['animals', orgId, animalId],
  queryFn: () => api.get(`/orgs/${orgId}/animals/${animalId}`)
});

const { data: client } = useQuery({
  queryKey: ['clients', orgId, animal.clientId],
  queryFn: () => api.get(`/orgs/${orgId}/clients/${animal.clientId}`),
  enabled: !!animal
});

// Header data
{
  image: animal.photoUrl,
  name: animal.name,
  species: animal.species,
  gender: animal.gender,
  owner: {
    name: `${client.firstName} ${client.lastName}`,
    phone: client.phoneNumber,
    email: client.email,
    onClick: () => router.push(`/dashboard/clients/${client.id}`)
  },
  totalRevenue: await (async () => {
    const treatments = await api.get(`/orgs/${orgId}/animals/${animalId}/treatments`);
    return treatments.data.reduce((sum, t) => sum + (t.amount || 0), 0);
  })()
}
```

**2. Bio Section**

```typescript
{
  location: animal.client.city || 'Unknown',
  age: calculateAge(animal.dateOfBirth) || animal.approximateAge || 'Unknown',
  vaccination: await (async () => {
    const treatments = await api.get(`/orgs/${orgId}/animals/${animalId}/treatments`);
    const lastVaccination = treatments.data.find(t => 
      t.diagnosis?.toLowerCase().includes('vaccination')
    );
    
    if (!lastVaccination) return 'No records';
    
    const nextDue = addYears(parseISO(lastVaccination.visitDate), 1);
    return `Up-to-date (Next due ${format(nextDue, 'MMM yyyy')})`;
  })(),
  notes: animal.notes?.split('\n') || []
}
```

**3. Medical History**

```typescript
const { data: treatments } = useQuery({
  queryKey: ['treatments', orgId, animalId],
  queryFn: () => api.get(`/orgs/${orgId}/animals/${animalId}/treatments`, {
    params: { sort: 'visitDate:desc' }
  })
});

// Group by type
const vaccinations = treatments.data.filter(t => 
  t.diagnosis?.toLowerCase().includes('vaccination')
);

const treatmentHistory = treatments.data.map(treatment => ({
  date: format(parseISO(treatment.visitDate), 'MMM dd, yyyy'),
  title: treatment.diagnosis,
  clinic: treatment.organization.name,
  type: treatment.patientType === 'SINGLE_PET' ? 'Pet' : 'Batch',
  amount: treatment.amount ? `₦${treatment.amount.toLocaleString()}` : null,
  status: treatment.paymentStatus,
  details: {
    chiefComplaint: treatment.chiefComplaint,
    treatmentGiven: treatment.treatmentGiven,
    followUp: treatment.followUpDate
  },
  onClick: () => router.push(`/dashboard/treatments/${treatment.id}`)
}));
```

**4. Latest Vaccination Card**

```typescript
const latestVaccination = vaccinations[0];

{
  title: 'Vaccination',
  updatedAt: format(parseISO(latestVaccination.updatedAt), 'MMM dd, yyyy'),
  vaccines: extractVaccines(latestVaccination.treatmentGiven), // Parse text
  reminder: calculateNextDue(latestVaccination.visitDate)
}
```

**Helper function to parse vaccines:**
```typescript
function extractVaccines(treatmentText: string): string[] {
  // Simple parsing - could be improved
  const lines = treatmentText.split('\n');
  return lines.filter(line => 
    line.includes('Rabies') || 
    line.includes('DHPP') || 
    line.includes('Bordetella') ||
    // ... other vaccine names
  );
}
```

---

### 📅 Schedule/Calendar — `/dashboard/schedule`

**Note:** Not shown in provided screens, but inferred from "Unsettled Schedules" section.

#### APIs Called:

| API | Purpose | Frequency |
|-----|---------|-----------|
| `GET /orgs/:orgId/treatments/scheduled/list?page=...` | List scheduled treatments | On load, date filter |
| `POST /orgs/:orgId/treatments` | Create new scheduled treatment | On create |
| `PATCH /orgs/:orgId/treatments/:treatmentId` | Update/complete scheduled treatment | On action |

#### Implementation:

```typescript
const { data: scheduledTreatments } = useQuery({
  queryKey: ['scheduled-treatments', orgId, dateRange],
  queryFn: () => api.get(`/orgs/${orgId}/treatments/scheduled/list`, {
    params: {
      page: 1,
      limit: 50,
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    }
  })
});

// Group by date
const groupedByDate = groupBy(scheduledTreatments.data, (t) => 
  format(parseISO(t.scheduledFor), 'yyyy-MM-dd')
);

// Calendar view
const events = scheduledTreatments.data.map(t => ({
  id: t.id,
  title: `${t.animal.name} - ${t.diagnosis}`,
  start: parseISO(t.scheduledFor),
  end: addHours(parseISO(t.scheduledFor), 1),
  resource: {
    animalId: t.animalId,
    clientName: `${t.animal.client.firstName} ${t.animal.client.lastName}`
  }
}));
```

---

## Component-Level API Usage

### Organization Switcher (Top Nav)

```typescript
const { data: orgs } = useQuery({
  queryKey: ['orgs'],
  queryFn: () => api.get('/orgs')
});

const [currentOrg, setCurrentOrg] = useLocalStorage('currentOrgId', orgs[0]?.id);

const switchOrg = (orgId: string) => {
  setCurrentOrg(orgId);
  queryClient.invalidateQueries(); // Refresh all org-scoped data
};
```

### Notification Bell

```typescript
// Note: Notifications API not yet implemented in backend
// Placeholder for future implementation

const { data: notifications } = useQuery({
  queryKey: ['notifications'],
  queryFn: () => api.get('/notifications?isRead=false'),
  refetchInterval: 30000 // Poll every 30 seconds
});

const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
```

### User Profile Dropdown

```typescript
const { data: profile } = useQuery({
  queryKey: ['vet', 'profile'],
  queryFn: () => api.get('/vets/profile'),
  staleTime: Infinity // Profile rarely changes
});

const { data: currentMembership } = useQuery({
  queryKey: ['membership', orgId],
  queryFn: () => api.get(`/orgs/${orgId}/members`),
  select: (data) => data.data.find(m => m.vetId === profile.id)
});

// Show role badge
{
  name: profile.fullName,
  email: profile.email,
  role: currentMembership?.role, // OWNER, ADMIN, MEMBER
  avatar: profile.profilePhotoUrl
}
```

### Messaging Component

```typescript
// Note: Messaging not implemented in backend
// Placeholder implementation using email/SMS

const sendMessage = useMutation({
  mutationFn: ({ recipient, message }) => 
    api.post('/notifications', {
      recipientVetId: recipient.id,
      type: 'CUSTOM_MESSAGE',
      title: 'Message from Dr. ' + currentVet.fullName,
      body: message,
      channel: 'BOTH' // Email + SMS
    }),
  onSuccess: () => {
    toast.success('Message sent successfully');
  }
});
```

---

## Real-time Updates & Polling

### Polling Strategy

For features requiring near real-time updates:

```typescript
// Dashboard stats - refetch every 5 minutes
useQuery({
  queryKey: ['dashboard-stats', orgId],
  queryFn: fetchDashboardStats,
  refetchInterval: 5 * 60 * 1000
});

// Scheduled treatments - refetch every 2 minutes
useQuery({
  queryKey: ['scheduled-treatments', orgId],
  queryFn: fetchScheduledTreatments,
  refetchInterval: 2 * 60 * 1000
});

// Notifications - refetch every 30 seconds
useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
  refetchInterval: 30 * 1000
});
```

### Optimistic Updates

For instant UI feedback:

```typescript
const markPaid = useMutation({
  mutationFn: (treatmentId) => 
    api.post(`/orgs/${orgId}/treatments/${treatmentId}/payment`, {
      amountPaid: treatment.amount,
      paidBy: currentVet.id
    }),
  onMutate: async (treatmentId) => {
    await queryClient.cancelQueries(['treatments', orgId]);
    
    const previousTreatments = queryClient.getQueryData(['treatments', orgId]);
    
    queryClient.setQueryData(['treatments', orgId], (old) => ({
      ...old,
      data: old.data.map(t => 
        t.id === treatmentId 
          ? { ...t, paymentStatus: 'PAID', paidAt: new Date().toISOString() }
          : t
      )
    }));
    
    return { previousTreatments };
  },
  onError: (err, treatmentId, context) => {
    queryClient.setQueryData(['treatments', orgId], context.previousTreatments);
    toast.error('Failed to mark payment');
  },
  onSettled: () => {
    queryClient.invalidateQueries(['treatments', orgId]);
    queryClient.invalidateQueries(['revenue', orgId]);
  }
});
```

---

## Error Handling Strategy

### Global Error Handler

```typescript
// In React Query setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        if (error.response?.status === 401) {
          router.push('/login');
        } else if (error.response?.status === 403) {
          if (error.response.data.error.code === 'VET_NOT_APPROVED') {
            router.push('/onboarding/pending');
          } else if (error.response.data.error.code === 'VET_SUSPENDED') {
            router.push('/account/suspended');
          } else {
            toast.error('You do not have permission to perform this action');
          }
        } else if (error.response?.status === 404) {
          toast.error('Resource not found');
        } else {
          toast.error(error.response?.data?.error?.message || 'Something went wrong');
        }
      }
    },
    mutations: {
      onError: (error) => {
        // Similar handling
      }
    }
  }
});
```

### Specific Error Handling

```typescript
const { data, error, isError } = useQuery({
  queryKey: ['animal', animalId],
  queryFn: () => api.get(`/orgs/${orgId}/animals/${animalId}`),
  retry: (failureCount, error) => {
    if (error.response?.status === 404) return false;
    return failureCount < 3;
  }
});

if (isError) {
  if (error.response?.status === 404) {
    return <NotFoundPage />;
  }
  return <ErrorPage error={error} />;
}
```

---

## Caching Strategy

### Cache Times

```typescript
const cacheConfig = {
  // Rarely changes
  profile: { staleTime: Infinity, cacheTime: Infinity },
  organizations: { staleTime: 5 * 60 * 1000, cacheTime: 10 * 60 * 1000 },
  
  // Changes occasionally
  clients: { staleTime: 2 * 60 * 1000, cacheTime: 5 * 60 * 1000 },
  animals: { staleTime: 2 * 60 * 1000, cacheTime: 5 * 60 * 1000 },
  
  // Changes frequently
  treatments: { staleTime: 1 * 60 * 1000, cacheTime: 3 * 60 * 1000 },
  revenue: { staleTime: 1 * 60 * 1000, cacheTime: 3 * 60 * 1000 },
  
  // Real-time
  notifications: { staleTime: 0, cacheTime: 1 * 60 * 1000 },
  scheduledTreatments: { staleTime: 30 * 1000, cacheTime: 2 * 60 * 1000 }
};
```

### Cache Invalidation

```typescript
// After creating a treatment
queryClient.invalidateQueries(['treatments', orgId]);
queryClient.invalidateQueries(['animals', orgId, animalId]);
queryClient.invalidateQueries(['revenue', orgId]);

// After updating an animal
queryClient.invalidateQueries(['animals', orgId, animalId]);
queryClient.invalidateQueries(['animals', orgId]); // List view
```

### Prefetching

```typescript
// Prefetch animal details when hovering over card
const prefetchAnimal = (animalId: string) => {
  queryClient.prefetchQuery({
    queryKey: ['animals', orgId, animalId],
    queryFn: () => api.get(`/orgs/${orgId}/animals/${animalId}`)
  });
};

<AnimalCard 
  onMouseEnter={() => prefetchAnimal(animal.id)}
  onClick={() => router.push(`/dashboard/animals/${animal.id}`)}
/>
```

---

## Summary of Required Backend Changes

### 1. New Endpoints Needed

| Endpoint | Purpose |
|----------|---------|
| `GET /orgs/:orgId/revenue?fromDate=...&toDate=...` | Date range filtering for revenue |
| `GET /orgs/:orgId/animals/vaccination-due` | List animals due for vaccination |
| `GET /orgs/:orgId/treatments?patientType=...` | Filter treatments by patient type |

### 2. New Fields Needed

**Organization Model:**
- `paymentTerms` (string, optional) — e.g., "Monthly invoicing", "Instant billing"

**Animal Model:**
- Consider adding `lastVaccinationDate` (DateTime) for efficient querying

### 3. Query Parameter Enhancements

**GET /orgs/:orgId/treatments:**
- Add `patientType` filter (SINGLE_PET, SINGLE_LIVESTOCK, BATCH_LIVESTOCK)
- Add date range filters (`fromDate`, `toDate`)

**GET /orgs/:orgId/revenue:**
- Add date range filters (`fromDate`, `toDate`)

---

**Version History:**

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Feb 9, 2026 | Initial API-Frontend mapping based on mobile designs |
