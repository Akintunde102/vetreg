# Backend API Changes & Additions

**Version:** 1.2.0  
**Last Updated:** February 9, 2026  
**Priority:** Based on frontend design requirements

---

## Table of Contents

1. [Overview](#overview)
2. [High Priority Changes](#high-priority-changes)
3. [New Endpoints Required](#new-endpoints-required)
4. [Schema Modifications](#schema-modifications)
5. [Query Parameter Enhancements](#query-parameter-enhancements)
6. [Response Format Updates](#response-format-updates)
7. [Implementation Priority](#implementation-priority)

---

## Overview

Based on the new mobile design specifications and frontend requirements, the following backend changes are necessary to fully support the intended user experience. This document outlines required API modifications, new endpoints, and database schema updates.

---

## High Priority Changes

### P0 - Critical for Core Functionality

| # | Change | Reason | Affected Endpoints |
|---|--------|--------|-------------------|
| 1 | Add date range filtering to revenue endpoint | Revenue page needs custom date ranges | `GET /orgs/:orgId/revenue` |
| 2 | Add `patientType` filter to treatments | Revenue page filters by Pet/Livestock/Farm | `GET /orgs/:orgId/treatments` |
| 3 | Add organization `paymentTerms` field | Display on clinic cards | Organizations schema |
| 4 | Optimize vaccination status queries | Animals page shows vaccination due status | Treatments queries |
| 5 | Add treatment statistics endpoint | Dashboard quick stats | New endpoint |

---

## New Endpoints Required

### 1. Dashboard Statistics Endpoint

**Priority:** P0  
**Endpoint:** `GET /orgs/:orgId/dashboard/stats`

**Purpose:** Provide aggregated statistics for dashboard in single call (reduces N queries to 1)

**Response:**

```typescript
{
  success: true,
  data: {
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
      bySpecies: {
        DOG: number;
        CAT: number;
        CATTLE: number;
        // ... other species
      };
      vaccinationDue: number; // Count of animals needing vaccination
    };
    treatments: {
      total: number;
      thisMonth: number;
      scheduled: number; // Unsettled schedules
      followUpsDue: number; // Follow-ups for today
    };
    revenue: {
      total: number;
      totalPaid: number;
      totalOwed: number;
      totalWaived: number;
      unpaidInvoices: number;
    };
  }
}
```

**Implementation:**

```typescript
@Get(':orgId/dashboard/stats')
@UseGuards(JwtAuthGuard, ApprovalGuard, OrgScopeGuard)
async getDashboardStats(@Param('orgId') orgId: string) {
  const [clients, animals, treatments, revenue] = await Promise.all([
    this.prisma.client.groupBy({
      by: ['isActive'],
      where: { organizationId: orgId, isDeleted: false },
      _count: true
    }),
    this.getAnimalStats(orgId),
    this.getTreatmentStats(orgId),
    this.getRevenueStats(orgId)
  ]);
  
  return {
    clients: {
      total: clients.reduce((sum, g) => sum + g._count, 0),
      active: clients.find(g => g.isActive)?._count || 0,
      inactive: clients.find(g => !g.isActive)?._count || 0
    },
    animals,
    treatments,
    revenue
  };
}
```

---

### 2. Animals Vaccination Due Endpoint

**Priority:** P1  
**Endpoint:** `GET /orgs/:orgId/animals/vaccination-due`

**Purpose:** List animals that need vaccination (more efficient than client-side filtering)

**Query Parameters:**
- `days` (optional, default: 30) - Look ahead window
- `page`, `limit` - Pagination

**Response:**

```typescript
{
  success: true,
  data: [
    {
      id: string;
      name: string;
      species: AnimalSpecies;
      photoUrl?: string;
      client: {
        id: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
      };
      lastVaccination: {
        date: string; // ISO date
        type: string; // e.g., "Rabies, DHPP"
        treatmentId: string;
      } | null;
      dueDate: string; // Calculated due date
      overdueDays?: number; // If overdue
    }
  ],
  meta: {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}
```

**Implementation Notes:**
- Query treatments for each animal where `diagnosis` or `treatmentGiven` contains vaccination keywords
- Calculate due date based on species (dogs/cats: 1 year, livestock: varies)
- Return animals where due date is within `days` parameter or overdue

---

### 3. Scheduled Treatments for Today

**Priority:** P0  
**Endpoint:** `GET /orgs/:orgId/treatments/scheduled/today`

**Purpose:** Get scheduled treatments for current day (optimized for dashboard)

**Response:**

```typescript
{
  success: true,
  data: [
    {
      id: string;
      scheduledFor: string; // ISO datetime
      diagnosis?: string;
      animal: {
        id: string;
        name: string;
        species: AnimalSpecies;
        photoUrl?: string;
        client: {
          firstName: string;
          lastName: string;
          phoneNumber: string;
        };
      };
      isCompleted: boolean;
    }
  ]
}
```

**Implementation:**

```typescript
@Get(':orgId/treatments/scheduled/today')
async getScheduledToday(@Param('orgId') orgId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.prisma.treatmentRecord.findMany({
    where: {
      organizationId: orgId,
      isScheduled: true,
      scheduledFor: {
        gte: startOfDay,
        lte: endOfDay
      },
      isDeleted: false
    },
    include: {
      animal: {
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true
            }
          }
        }
      }
    },
    orderBy: { scheduledFor: 'asc' }
  });
}
```

---

### 4. Follow-ups Due Today

**Priority:** P0  
**Endpoint:** `GET /orgs/:orgId/treatments/follow-ups/today`

**Purpose:** Get treatments with follow-ups due today

**Response:**

```typescript
{
  success: true,
  data: [
    {
      id: string;
      visitDate: string;
      followUpDate: string;
      diagnosis: string;
      animal: {
        id: string;
        name: string;
        client: {
          firstName: string;
          lastName: string;
          phoneNumber: string;
        };
      };
    }
  ]
}
```

---

### 5. Client Statistics

**Priority:** P2  
**Endpoint:** `GET /orgs/:orgId/clients/:clientId/stats`

**Purpose:** Get aggregated statistics for a specific client

**Response:**

```typescript
{
  success: true,
  data: {
    totalAnimals: number;
    totalTreatments: number;
    totalRevenue: number;
    totalOwed: number;
    lastVisit?: string; // ISO date
    nextScheduled?: string; // ISO date
  }
}
```

---

### 6. Animal Revenue Summary

**Priority:** P1  
**Endpoint:** `GET /orgs/:orgId/animals/:animalId/revenue`

**Purpose:** Calculate total revenue for a specific animal

**Response:**

```typescript
{
  success: true,
  data: {
    totalRevenue: number;
    totalPaid: number;
    totalOwed: number;
    treatmentCount: number;
    revenueByYear: {
      [year: string]: number;
    };
  }
}
```

---

## Schema Modifications

### 1. Organization Model - Add Payment Terms

**Priority:** P0

```prisma
model Organization {
  // ... existing fields
  
  paymentTerms String? @map("payment_terms") // e.g., "Monthly invoicing", "Instant billing"
  
  // ... rest of model
}
```

**Migration:**

```sql
ALTER TABLE organizations ADD COLUMN payment_terms VARCHAR(255);
```

**Update DTO:**

```typescript
// create-organization.dto.ts
export class CreateOrganizationDto {
  // ... existing fields
  
  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentTerms?: string;
}
```

---

### 2. Animal Model - Add Last Vaccination Date (Optional Optimization)

**Priority:** P2 (Nice to have, not critical)

```prisma
model Animal {
  // ... existing fields
  
  lastVaccinationDate DateTime? @map("last_vaccination_date") @db.Date
  lastVaccinationType String?   @map("last_vaccination_type")
  nextVaccinationDue  DateTime? @map("next_vaccination_due") @db.Date
  
  // ... rest of model
}
```

**Update Logic:**
- When creating/updating treatment with vaccination, update these fields on Animal
- Eliminates need to query all treatments to check vaccination status

---

### 3. Treatment Model - Add Patient Category (Computed Field)

**Priority:** P1

Add a computed/virtual field or index for easier filtering.

**Option A: Virtual Field (Computed on query)**

```typescript
// In treatments.service.ts
async findAll(orgId: string, filters: FindTreatmentsDto) {
  const treatments = await this.prisma.treatmentRecord.findMany({
    where: {
      organizationId: orgId,
      // Filter by patient type via relation
      ...(filters.paymentCategory && {
        animal: {
          patientType: this.getPatientTypeFromCategory(filters.paymentCategory)
        }
      })
    },
    include: {
      animal: {
        select: {
          id: true,
          name: true,
          species: true,
          patientType: true,
          // ... other fields
        }
      }
    }
  });
  
  return treatments;
}

private getPatientTypeFromCategory(category: string): PatientType | undefined {
  switch (category) {
    case 'PET': return 'SINGLE_PET';
    case 'LIVESTOCK': return 'SINGLE_LIVESTOCK';
    case 'FARM': return 'BATCH_LIVESTOCK';
    default: return undefined;
  }
}
```

---

## Query Parameter Enhancements

### 1. GET /orgs/:orgId/revenue - Add Date Range

**Priority:** P0

**Current:**
```
GET /orgs/:orgId/revenue
```

**Enhanced:**
```
GET /orgs/:orgId/revenue?fromDate=2024-01-01&toDate=2024-12-31
```

**Implementation:**

```typescript
// update-revenue.dto.ts (query params)
export class GetRevenueQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;
  
  @IsOptional()
  @IsDateString()
  toDate?: string;
}

// organizations.controller.ts
@Get(':orgId/revenue')
async getRevenue(
  @Param('orgId') orgId: string,
  @Query() query: GetRevenueQueryDto
) {
  return this.organizationsService.getRevenue(orgId, query);
}

// organizations.service.ts
async getRevenue(orgId: string, query: GetRevenueQueryDto) {
  const dateFilter = {};
  
  if (query.fromDate || query.toDate) {
    dateFilter.visitDate = {};
    if (query.fromDate) dateFilter.visitDate.gte = new Date(query.fromDate);
    if (query.toDate) dateFilter.visitDate.lte = new Date(query.toDate);
  }
  
  const treatments = await this.prisma.treatmentRecord.findMany({
    where: {
      organizationId: orgId,
      isDeleted: false,
      amount: { not: null },
      ...dateFilter
    },
    select: {
      amount: true,
      amountPaid: true,
      paymentStatus: true
    }
  });
  
  // ... calculate revenue stats
}
```

---

### 2. GET /orgs/:orgId/treatments - Add Payment Category Filter

**Priority:** P0

**Current:**
```
GET /orgs/:orgId/treatments?paymentStatus=PAID
```

**Enhanced:**
```
GET /orgs/:orgId/treatments?paymentCategory=PET&paymentStatus=PAID
```

**Values:** `PET`, `LIVESTOCK`, `FARM`, `ALL`

**Implementation:**

```typescript
// find-treatments.dto.ts
export class FindTreatmentsDto {
  // ... existing fields
  
  @IsOptional()
  @IsEnum(['PET', 'LIVESTOCK', 'FARM', 'ALL'])
  paymentCategory?: 'PET' | 'LIVESTOCK' | 'FARM' | 'ALL';
}

// treatments.service.ts
async findAll(orgId: string, filters: FindTreatmentsDto) {
  const patientTypeFilter = {};
  
  if (filters.paymentCategory && filters.paymentCategory !== 'ALL') {
    switch (filters.paymentCategory) {
      case 'PET':
        patientTypeFilter.patientType = 'SINGLE_PET';
        break;
      case 'LIVESTOCK':
        patientTypeFilter.patientType = 'SINGLE_LIVESTOCK';
        break;
      case 'FARM':
        patientTypeFilter.patientType = 'BATCH_LIVESTOCK';
        break;
    }
  }
  
  return this.prisma.treatmentRecord.findMany({
    where: {
      organizationId: orgId,
      isDeleted: false,
      ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
      animal: patientTypeFilter
    },
    include: {
      animal: {
        include: {
          client: true
        }
      }
    }
  });
}
```

---

### 3. GET /orgs/:orgId/animals - Add Vaccination Status Filter

**Priority:** P1

**Enhanced:**
```
GET /orgs/:orgId/animals?vaccinationStatus=DUE
```

**Values:** `DUE`, `OVERDUE`, `CURRENT`, `UNKNOWN`

**Implementation:**

```typescript
// find-animals.dto.ts
export class FindAnimalsDto {
  // ... existing fields
  
  @IsOptional()
  @IsEnum(['DUE', 'OVERDUE', 'CURRENT', 'UNKNOWN'])
  vaccinationStatus?: 'DUE' | 'OVERDUE' | 'CURRENT' | 'UNKNOWN';
}

// animals.service.ts
async findAll(orgId: string, filters: FindAnimalsDto) {
  let animals = await this.prisma.animal.findMany({
    where: {
      organizationId: orgId,
      isDeleted: false,
      // ... other filters
    },
    include: {
      treatments: {
        where: {
          OR: [
            { diagnosis: { contains: 'vaccination', mode: 'insensitive' } },
            { treatmentGiven: { contains: 'vaccination', mode: 'insensitive' } }
          ],
          isDeleted: false
        },
        orderBy: { visitDate: 'desc' },
        take: 1
      }
    }
  });
  
  // Filter by vaccination status on application layer
  if (filters.vaccinationStatus) {
    animals = animals.filter(animal => {
      const status = this.calculateVaccinationStatus(animal);
      return status === filters.vaccinationStatus;
    });
  }
  
  return animals;
}

private calculateVaccinationStatus(animal: any): 'DUE' | 'OVERDUE' | 'CURRENT' | 'UNKNOWN' {
  const lastVaccination = animal.treatments[0];
  
  if (!lastVaccination) return 'UNKNOWN';
  
  const daysSince = differenceInDays(new Date(), new Date(lastVaccination.visitDate));
  
  if (daysSince > 365) return 'OVERDUE';
  if (daysSince > 330) return 'DUE';
  return 'CURRENT';
}
```

---

## Response Format Updates

### 1. Add Pagination Metadata

**Current:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "totalCount": 50,
    "page": 1,
    "limit": 20
  }
}
```

**Enhanced:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "totalCount": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Implementation:**

```typescript
// response.interceptor.ts
transform(data, context) {
  if (data.meta && 'totalCount' in data.meta) {
    const totalPages = Math.ceil(data.meta.totalCount / data.meta.limit);
    const hasNextPage = data.meta.page < totalPages;
    const hasPrevPage = data.meta.page > 1;
    
    data.meta = {
      ...data.meta,
      totalPages,
      hasNextPage,
      hasPrevPage
    };
  }
  
  return data;
}
```

---

### 2. Include Related Counts in List Responses

**Example: Organization List**

**Current:**
```json
{
  "id": "org-1",
  "name": "Greenleaf Clinic",
  "address": "123 Maple St"
}
```

**Enhanced:**
```json
{
  "id": "org-1",
  "name": "Greenleaf Clinic",
  "address": "123 Maple St",
  "_counts": {
    "clients": 18,
    "animals": 32,
    "members": 5
  }
}
```

**Implementation:**

```typescript
async findAll() {
  const orgs = await this.prisma.organization.findMany({
    where: { /* ... */ },
    include: {
      _count: {
        select: {
          clients: true,
          animals: true,
          memberships: {
            where: { status: 'ACTIVE' }
          }
        }
      }
    }
  });
  
  return orgs.map(org => ({
    ...org,
    _counts: {
      clients: org._count.clients,
      animals: org._count.animals,
      members: org._count.memberships
    },
    _count: undefined // Remove original _count
  }));
}
```

---

## Implementation Priority

### Phase 1: Critical (Week 1) - P0 ✅ **COMPLETED (Feb 9, 2026)**

Must be completed for MVP frontend:

1. ✅ Add `paymentTerms` to Organization model **[DONE]**
2. ✅ Add date range to `/orgs/:orgId/revenue` **[DONE]**
3. ✅ Add payment category filter to `/orgs/:orgId/treatments` **[DONE]**
4. ✅ Create `/orgs/:orgId/dashboard/stats` endpoint **[DONE]**
5. ✅ Create `/orgs/:orgId/treatments/scheduled/today` endpoint **[DONE]**
6. ✅ Create `/orgs/:orgId/treatments/follow-ups/today` endpoint **[DONE]**

**Status:** ✅ All items completed and tested
**Tests:** See `test/p0-features.e2e-spec.ts` (47 test cases)
**Documentation:** See `docs/backend/P0_IMPLEMENTATION_SUMMARY.md`

---

### Phase 2: Important (Week 2) - P1

Improves UX significantly:

1. Create `/orgs/:orgId/animals/vaccination-due` endpoint
2. Create `/orgs/:orgId/animals/:animalId/revenue` endpoint
3. Add vaccination status filter to animals endpoint
4. Add `_counts` to list responses
5. Enhanced pagination metadata

**Estimated Time:** 2-3 days

---

### Phase 3: Nice to Have (Week 3+) - P2

Performance optimizations:

1. Add `lastVaccinationDate` to Animal model (denormalized)
2. Create `/orgs/:orgId/clients/:clientId/stats` endpoint
3. Add caching layer for dashboard stats
4. Add database indexes for common queries

**Estimated Time:** 1-2 days

---

## Migration Scripts

### Migration 1: Add Payment Terms

```sql
-- Add payment_terms column
ALTER TABLE organizations 
ADD COLUMN payment_terms VARCHAR(255);

-- Add default values for existing orgs
UPDATE organizations 
SET payment_terms = 'Monthly invoicing' 
WHERE payment_terms IS NULL;
```

### Migration 2: Add Vaccination Fields (Optional - P2)

```sql
-- Add vaccination tracking fields to animals
ALTER TABLE animals 
ADD COLUMN last_vaccination_date DATE,
ADD COLUMN last_vaccination_type VARCHAR(255),
ADD COLUMN next_vaccination_due DATE;

-- Create index for vaccination due queries
CREATE INDEX idx_animals_vaccination_due 
ON animals(organization_id, next_vaccination_due) 
WHERE is_deleted = false AND is_alive = true;
```

### Migration 3: Add Indexes for Performance

```sql
-- Index for payment category queries
CREATE INDEX idx_animals_patient_type 
ON animals(organization_id, patient_type) 
WHERE is_deleted = false;

-- Index for scheduled treatments
CREATE INDEX idx_treatments_scheduled 
ON treatment_records(organization_id, scheduled_for) 
WHERE is_scheduled = true AND is_deleted = false;

-- Index for follow-ups
CREATE INDEX idx_treatments_follow_up 
ON treatment_records(organization_id, follow_up_date) 
WHERE follow_up_date IS NOT NULL AND is_deleted = false;

-- Index for revenue queries with date range
CREATE INDEX idx_treatments_revenue_date 
ON treatment_records(organization_id, visit_date, payment_status) 
WHERE is_deleted = false AND amount IS NOT NULL;
```

---

## Testing Checklist

### Unit Tests

- [ ] Test dashboard stats aggregation
- [ ] Test vaccination due calculation
- [ ] Test date range filtering
- [ ] Test payment category filtering
- [ ] Test pagination metadata

### Integration Tests

- [ ] Test dashboard stats endpoint returns correct counts
- [ ] Test revenue endpoint with date ranges
- [ ] Test treatments endpoint with payment categories
- [ ] Test scheduled today endpoint with timezone handling
- [ ] Test vaccination due endpoint with various scenarios

### Performance Tests

- [ ] Benchmark dashboard stats with 1000+ animals
- [ ] Test revenue calculation with 10,000+ treatments
- [ ] Verify index usage in EXPLAIN ANALYZE
- [ ] Test concurrent requests to dashboard

---

## API Documentation Updates

All new/updated endpoints must be documented in Swagger:

```typescript
@ApiOperation({ summary: 'Get dashboard statistics' })
@ApiResponse({
  status: 200,
  description: 'Dashboard statistics retrieved successfully',
  type: DashboardStatsResponseDto
})
@Get(':orgId/dashboard/stats')
async getDashboardStats(@Param('orgId') orgId: string) {
  // ...
}
```

---

## Summary

**Total New Endpoints:** 6  
**Schema Changes:** 1 required, 1 optional  
**Query Enhancements:** 3  
**Estimated Implementation Time:** 5-8 days

**Next Steps:**
1. Review and approve changes with backend team
2. Create GitHub issues for each change
3. Implement Phase 1 (P0) changes
4. Update API documentation
5. Deploy to staging for frontend integration testing

---

**Version History:**

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Feb 9, 2026 | Initial backend API changes proposal |
| 1.2.0 | Feb 9, 2026 | P0 implementation complete; Phase 1 all items done; 47 P0 e2e tests |
