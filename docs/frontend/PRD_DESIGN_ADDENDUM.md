# PRD Design Addendum v1.2

**Document Version:** 1.2.0  
**Last Updated:** February 9, 2026  
**Status:** Design Specifications Complete  
**Addendum to:** PRD v1.1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Design Philosophy Updates](#design-philosophy-updates)
3. [Key Design Changes](#key-design-changes)
4. [Feature Refinements](#feature-refinements)
5. [Updated User Flows](#updated-user-flows)
6. [Backend Requirements Updates](#backend-requirements-updates)
7. [Frontend Specifications](#frontend-specifications)
8. [Implementation Priorities](#implementation-priorities)

---

## Overview

This addendum documents design refinements and clarifications based on the mobile UI designs provided on February 9, 2026. These updates enhance the original PRD (v1.1.0) with specific UI/UX direction while maintaining all core functionality.

### What Changed

1. **Clearer UI Patterns**: Specific component designs for cards, navigation, and interactions
2. **Enhanced Dashboard**: New sections for scheduled treatments and reminders
3. **Payment Categorization**: Separated into Pet Payment, Livestock Payment, and Farm Payments
4. **Vaccination Tracking**: More prominent vaccination status indicators
5. **Organization View**: Renamed "Clinics" with client count badges
6. **Desktop Enhancements**: Comprehensive desktop layout specifications

### What Remains Unchanged

- All core features from PRD v1.1.0
- Database schema (with minor additions)
- Security model
- Authentication flow
- Multi-organization architecture

---

## Design Philosophy Updates

### Original Philosophy (PRD v1.0)
- Professional and clean
- Data-driven
- Role-based access

### Enhanced Philosophy (v1.2)
- **Calming & Professional**: Use of greens and soft illustrations
- **Action-Oriented**: Every widget/card is clickable
- **Context-Aware**: Show relevant information based on time/status
- **Mobile-First**: Optimized for on-the-go veterinarians
- **Desktop-Enhanced**: Rich interactions for office use

---

## Key Design Changes

### 1. Dashboard Enhancements

#### Previous (PRD v1.1)
- Basic stats: Client count, animal count, treatment count
- Recent activity list

#### Updated (v1.2)
- **Personalized Greeting**: "Good morning, Dr. [Name]"
- **Enhanced Stats Grid**: 
  - Vet Clinics (with pending badge)
  - Clients
  - Pets (separated from livestock)
  - Livestocks (batch count)
  - Revenue (formatted currency)
  - Pending Payments (count)
  - Upcoming Appointments (count)
- **Today's Agenda Section**:
  - Unsettled Schedules (time-based list)
  - Don't Forget panel (reminders)
- **Floating Action Button**: Quick add new

**Rationale**: Provides immediate actionable information and reduces cognitive load by surfacing critical tasks.

---

### 2. Organizations Page Redesign

#### Previous (PRD v1.1)
- Simple list of organizations
- Basic info: name, type, address

#### Updated (v1.2)
- **Renamed**: "Vet Clinics" instead of "Organizations"
- **Client Count Badge**: Shows number on clinic icon
- **Stats Display**: "18 patients referred this month"
- **Status Indicators**:
  - "Pending approval" (for new clinics)
  - "In network" (for approved)
  - "Stan" badge (unclear meaning - needs clarification)
- **Payment Terms**: Display payment agreement
- **Pending Verification Section**: Separate panel for pending orgs

**API Changes Required:**
```typescript
// Add to Organization model
interface Organization {
  // ... existing fields
  paymentTerms?: string; // e.g., "Monthly invoicing"
  
  // Add to response
  _counts?: {
    clients: number;
    animals: number;
    members: number;
  };
}
```

---

### 3. Animals (Pets) Page Refinements

#### Previous (PRD v1.1)
- Animal list with basic info
- Species filter

#### Updated (v1.2)
- **Filter Tabs with Counts**: All (62), Dogs (32), Cats (18), Other (12)
- **Vaccination Status Badge**: Prominent display
- **Schedule/Last Visit**: 
  - "Annual Check-up 2 weeks ago" (if upcoming)
  - "Last visit updated 4 hours ago" (if no upcoming)
- **Quick Actions**: View, Message (to client), Client (link to client profile)
- **Don't Forget Section**: 
  - Pets due for vaccination
  - Follow-ups today

**API Changes Required:**
```typescript
// New endpoint
GET /orgs/:orgId/animals/vaccination-due
// Returns animals needing vaccination

// Enhanced response for animal list
interface Animal {
  // ... existing fields
  vaccinationStatus: {
    status: 'DUE' | 'OVERDUE' | 'CURRENT' | 'UNKNOWN';
    lastDate?: string;
    nextDate?: string;
  };
  nextSchedule?: {
    type: string; // e.g., "Annual Check-up"
    date: string;
  };
  lastVisit?: string;
}
```

---

### 4. Revenue Page Restructure

#### Previous (PRD v1.1)
- Treatment records with payment status
- Basic filtering

#### Updated (v1.2)
- **Date Range Picker**: "Apr 1, 2024 - Apr 25, 2024"
- **Summary Cards**: 
  - Revenue ₦350,000
  - Pending (8)
  - Paid (14)
- **Payment Category Tabs**:
  - All Payments
  - **Pet Payment** (single pet treatments)
  - **Livestock Payment** (single livestock treatments)
  - **Farm Payments** (batch livestock treatments)
- **Enhanced Payment Cards**:
  - Batch identifier for farm payments
  - Clinic name
  - Batch description (e.g., "100 dairy cattle")
  - Remove "Restock overdue" (not applicable)
- **Scheduled Info**: "Farm visit scheduled tomorrow"

**API Changes Required:**
```typescript
// Enhanced revenue endpoint
GET /orgs/:orgId/revenue?fromDate=...&toDate=...

// Payment category filter
GET /orgs/:orgId/treatments?paymentCategory=PET|LIVESTOCK|FARM

// Filter logic
enum PaymentCategory {
  PET = 'PET',           // patientType === 'SINGLE_PET'
  LIVESTOCK = 'LIVESTOCK', // patientType === 'SINGLE_LIVESTOCK'
  FARM = 'FARM'          // patientType === 'BATCH_LIVESTOCK'
}
```

**Design Clarification Needed:**
- Remove all "Restock" related features (not part of vet practice)
- "Stan in network" meaning unclear - likely "Status: In network"

---

### 5. Pet Detail Page Enhancements

#### Previous (PRD v1.1)
- Basic animal info
- Treatment history

#### Updated (v1.2)
- **Header Section**:
  - Large photo
  - Name, species, gender
  - Owner with contact (phone, email, message button)
  - **Total Revenue**: ₦45,000 (sum of all treatments)
- **Bio Section**:
  - Location (from client address)
  - Age (3 years old)
  - Vaccination status with next due date
  - General notes (personality, health notes)
- **Medical History**:
  - Latest Vaccination card (expandable)
  - Treatment history timeline
  - Each entry shows: Date, Clinic, Batch/Type, Amount, Status

**API Changes Required:**
```typescript
// New endpoint
GET /orgs/:orgId/animals/:animalId/revenue
// Returns total revenue for animal

interface AnimalRevenue {
  totalRevenue: number;
  totalPaid: number;
  totalOwed: number;
  treatmentCount: number;
}
```

---

### 6. Marketing Homepage Updates

#### Previous (PRD v1.1)
- Basic landing page
- Features list
- Pricing tiers

#### Updated (v1.2)
- **Keep**: Hero, features, how it works, testimonials
- **Remove**: Pricing plans, subscription tiers
- **Reasoning**: Free for veterinarians during MVP phase

---

## Feature Refinements

### Organizations (Clinics)

**Terminology Update:**
- User-facing: "Vet Clinics" or "Clinics"
- Backend/API: "Organizations" (unchanged)
- Reasoning: More intuitive for veterinarians

**New Fields:**
- `paymentTerms` (string, optional): "Monthly invoicing", "Instant billing", etc.
- Display on clinic cards

**Status Display:**
- PENDING_APPROVAL → "Pending approval" badge (yellow/warning)
- APPROVED → Show payment terms or "In network"
- REJECTED → "Rejected" badge (red)
- SUSPENDED → "Suspended" badge (red)

---

### Dashboard Statistics

**Previous:**
- Simple counts

**Enhanced:**
- Clickable widgets that navigate to relevant pages
- Notification badges (e.g., 3 new clinics pending)
- Contextual icons
- Formatted values (₦350,000 instead of 350000)

**New Aggregation Endpoint:**
```typescript
GET /orgs/:orgId/dashboard/stats

Response:
{
  clients: {
    total: number;
    active: number;
    inactive: number;
  };
  animals: {
    total: number;
    byPatientType: {
      SINGLE_PET: number;
      SINGLE_LIVESTOCK: number;
      BATCH_LIVESTOCK: number;
    };
    vaccinationDue: number;
  };
  treatments: {
    total: number;
    thisMonth: number;
    scheduled: number;
    followUpsDue: number;
  };
  revenue: {
    total: number;
    totalPaid: number;
    totalOwed: number;
    unpaidInvoices: number;
  };
}
```

---

### Scheduled Treatments

**New Feature Prominence:**
- Dashboard "Unsettled Schedules" section
- Shows treatments scheduled for today
- Quick "Settle" button to mark as completed

**API Enhancement:**
```typescript
GET /orgs/:orgId/treatments/scheduled/today

Response:
{
  data: [
    {
      id: string;
      scheduledFor: string; // ISO datetime
      diagnosis: string;
      animal: {
        name: string;
        species: string;
        client: {
          firstName: string;
          lastName: string;
        };
      };
    }
  ];
}
```

---

### Vaccination Tracking

**Enhanced Visibility:**
- Prominent badges on pet cards
- Separate section in "Don't Forget"
- Status categories:
  - **Current**: Vaccinated within validity period
  - **Due**: Within 30 days of due date
  - **Overdue**: Past due date
  - **Unknown**: No vaccination records

**Implementation:**
- Calculate based on last vaccination date + validity period
- Default validity: 1 year (dogs/cats), species-specific for livestock
- Option 1: Calculate on-the-fly
- Option 2: Store `lastVaccinationDate` and `nextVaccinationDue` on Animal model (recommended for performance)

---

## Updated User Flows

### Flow 1: Dashboard → Schedule Treatment

```
1. User lands on Dashboard
2. Sees "Unsettled Schedules" section
3. Views scheduled treatment: "9:00 AM - Vaccination, Bella (Emma Walker)"
4. Clicks "Settle"
5. Modal opens: "Complete this treatment?"
   - Option A: Mark as completed now
   - Option B: Record full treatment details
6. If Option B:
   - Navigates to treatment form
   - Pre-filled with animal, client, scheduled time
   - User adds clinical findings, treatment given
7. Saves treatment
8. Dashboard updates, schedule removed from "Unsettled"
```

---

### Flow 2: Revenue → Filter by Payment Category

```
1. User navigates to Revenue page
2. Sees summary: Revenue ₦350,000, Pending (8), Paid (14)
3. Clicks "Pet Payment" tab
4. List filters to show only single pet treatments
5. User sees payment cards with pet photos
6. Clicks "Livestock Payment" tab
7. List filters to show single livestock treatments
8. Clicks "Farm Payments" tab
9. List shows batch livestock treatments with batch identifiers
10. Each card shows batch photo, "Batch 23", "100 dairy cattle"
```

---

### Flow 3: Animals → Vaccination Due Alert

```
1. User navigates to Animals (Pets) page
2. Sees "Don't Forget" section: "2 pets due for vaccination"
3. Pet cards show vaccination badges:
   - Bella: Green check "Vaccination as due" (Actually means "up to date")
   - Max: Yellow warning "Vaccination due"
4. User clicks Max's "View" button
5. Detail page shows:
   - Bio: "Vaccination: Due in 15 days (Oct 1, 2024)"
   - Medical History: Last vaccination Feb 15, 2024
6. User clicks "Add New" to schedule vaccination
7. Creates new scheduled treatment with diagnosis "Annual Vaccination"
```

---

## Backend Requirements Updates

### Priority 0 (MVP Blockers)

Must be implemented before frontend launch:

1. ✅ Add `paymentTerms` field to Organization model
2. ✅ Create `/orgs/:orgId/dashboard/stats` endpoint
3. ✅ Create `/orgs/:orgId/treatments/scheduled/today` endpoint
4. ✅ Create `/orgs/:orgId/treatments/follow-ups/today` endpoint
5. ✅ Add date range filtering to `/orgs/:orgId/revenue`
6. ✅ Add `paymentCategory` filter to `/orgs/:orgId/treatments`
7. ✅ Add `_counts` to organization list responses

**Estimated Time**: 2-3 days

---

### Priority 1 (High Value)

Should be implemented soon after MVP:

1. ✅ Create `/orgs/:orgId/animals/vaccination-due` endpoint
2. ✅ Create `/orgs/:orgId/animals/:animalId/revenue` endpoint
3. ✅ Add vaccination status to animal responses
4. ✅ Enhanced pagination metadata (hasNextPage, hasPrevPage, totalPages)

**Estimated Time**: 2-3 days

---

### Priority 2 (Performance)

Optimize after MVP:

1. ✅ Add `lastVaccinationDate`, `nextVaccinationDue` to Animal model (denormalized)
2. ✅ Create database indexes for common queries
3. ✅ Implement caching layer for dashboard stats
4. ✅ Create `/orgs/:orgId/clients/:clientId/stats` endpoint

**Estimated Time**: 1-2 days

---

## Frontend Specifications

### Technology Stack (Unchanged)

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod
- **Auth**: @supabase/ssr

### Component Architecture

See [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) for complete specifications.

**Key Components:**

1. **StatsWidget** - Dashboard stat cards
2. **ClinicCard** - Organization display
3. **PetCard** - Animal list item
4. **PaymentCard** - Revenue item
5. **ScheduleCard** - Scheduled treatment
6. **GreetingSection** - Dashboard header
7. **DontForgetPanel** - Reminder section
8. **FilterTabs** - Category filters with counts
9. **VaccinationBadge** - Status indicator

### Responsive Strategy

- **Mobile (< 768px)**: 
  - Bottom tab navigation
  - Single column layouts
  - Stacked cards
  
- **Tablet (768-1023px)**:
  - Side drawer (collapsible)
  - 2-column grids
  - Table views optional
  
- **Desktop (1024px+)**:
  - Persistent sidebar
  - 3-4 column grids
  - Master-detail layouts
  - Hover interactions

---

## Implementation Priorities

### Phase 1: Foundation + Core Pages (Weeks 1-4)

1. Setup + Authentication
2. Dashboard with stats
3. Organizations list
4. Animals list
5. Revenue list

**Goal**: MVP functional on mobile

---

### Phase 2: CRUD + Details (Weeks 5-6)

1. Client management
2. Animal details page
3. Treatment forms
4. Payment marking

**Goal**: Complete data management

---

### Phase 3: Desktop + Polish (Weeks 7-8)

1. Desktop layouts
2. Master-detail views
3. Keyboard shortcuts
4. Hover interactions

**Goal**: Desktop experience optimized

---

### Phase 4: Testing + Launch (Weeks 9-10)

1. E2E tests
2. Accessibility audit
3. Performance optimization
4. Production deployment

**Goal**: Production-ready

---

## Design System Reference

All design specifications are documented in:

- [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) - Colors, typography, components
- [DESKTOP_DESIGN_SPEC.md](./DESKTOP_DESIGN_SPEC.md) - Desktop layouts
- [API_FRONTEND_MAPPING.md](./API_FRONTEND_MAPPING.md) - API integration guide
- [PAGE_COMPONENT_BREAKDOWN.md](./PAGE_COMPONENT_BREAKDOWN.md) - Component details
- [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) - Technical architecture
- [FRONTEND_DESIGN_SUMMARY.md](./FRONTEND_DESIGN_SUMMARY.md) - Executive summary

---

## Open Questions & Clarifications

### 1. "Stan in network" Badge
**Question**: What does "Stan in network" mean on clinic cards?
**Assumption**: Likely should be "Status: In network" or just "In network"
**Action**: Clarify with stakeholders

### 2. Restock Features
**Question**: Should we remove all inventory/restock features?
**Decision**: Yes, not part of core veterinary practice management
**Action**: Remove from designs and backend

### 3. Vaccination Validity Periods
**Question**: How long are vaccinations valid for different species?
**Assumption**: 1 year for dogs/cats, species-specific for livestock
**Action**: Create configuration table in backend

### 4. Payment Terms Options
**Question**: What are the standard payment terms?
**Suggestion**: 
- "Instant billing"
- "Monthly invoicing"
- "Quarterly invoicing"
- "Custom"
**Action**: Add to organization form as dropdown

---

## Migration Path (Existing Users)

If there are existing users of v1.1:

1. **Data Migration**: Add `paymentTerms` field (nullable, default NULL)
2. **Feature Flags**: Enable new UI gradually
3. **Training**: Provide in-app tutorials for new features
4. **Documentation**: Update user guides

---

## Success Metrics (Updated)

### User Engagement

- Dashboard visit frequency: > 3x per day per user
- Average session duration: 5-10 minutes
- Feature adoption rate: > 70% for core features within 30 days

### Performance

- Dashboard load time: < 2s
- Search response time: < 500ms
- Page transition time: < 300ms

### Business

- User retention: > 80% after 30 days
- Active organizations: > 100 within 6 months
- Treatment records created: > 1000 per month

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Oct 2025 | Initial PRD |
| 1.1.0 | Feb 2026 | Patient types, org approval, payment tracking |
| 1.2.0 | Feb 9, 2026 | Design addendum - UI specifications |

---

## Approval & Sign-off

- [ ] **Product**: Design aligns with product vision
- [ ] **Engineering (Backend)**: API changes feasible
- [ ] **Engineering (Frontend)**: Implementation plan clear
- [ ] **Design**: UI specifications complete
- [ ] **QA**: Test plan defined

---

**Status**: ✅ Ready for Implementation

**Next Steps**:
1. Backend team implements P0 API changes
2. Frontend team begins Epic 1 (Setup)
3. Design team reviews implementation
4. QA team prepares test scenarios

