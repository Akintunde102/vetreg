# E2E Manual Test Guide

## Test Suites Available

1. **app.e2e-spec.ts** - Basic health check and welcome endpoint
2. **e2e-automated.e2e-spec.ts** - Complete application workflow tests
3. **e2e-deep-scenarios.e2e-spec.ts** - Deep scenario and integration tests
4. **p0-features.e2e-spec.ts** - P0 backend features (Dashboard stats, date filtering, payment categories)

## Prerequisites

1. **Supabase Database must be active**
   - Go to: https://supabase.com/dashboard
   - Check if your project is paused
   - Click "Restore" if needed

2. **Environment variables configured**
   - DATABASE_URL with encoded password
   - SUPABASE_URL
   - SUPABASE_JWT_SECRET (from Supabase Settings > API)
   - SUPABASE_SERVICE_ROLE_KEY (from Supabase Settings > API)

## Step 1: Database Setup

```bash
cd /home/glory/vet-reg/backend

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Verify connection
npx prisma db push
```

## Step 2: Start the Server

```bash
npm run start:dev
```

Wait for: `🚀 Application is running on: http://localhost:3001`

## Step 3: Run Automated E2E Tests

### 3.1 Health Check
```bash
curl http://localhost:3001/api/v1/health
```

**Expected**: `{"status":"ok","timestamp":"...","service":"vet-reg-backend"}`

### 3.2 Create Master Admin (Direct DB Insert)

```sql
-- Run in Supabase SQL Editor
INSERT INTO vets (id, auth_user_id, email, full_name, status, is_master_admin, profile_completed, created_at, updated_at)
VALUES (
  'master-admin-001',
  'auth-master-001',
  'admin@vetplatform.com',
  'Master Admin',
  'APPROVED',
  true,
  true,
  NOW(),
  NOW()
);
```

### 3.3 Generate Test JWT

For testing, you'll need a valid Supabase JWT. Two options:

**Option A: Use Supabase Dashboard**
1. Go to Authentication > Users
2. Create a test user
3. Use Supabase client to sign in and get token

**Option B: Use provided test script** (see below)

## Step 4: Test Workflows

### Workflow 1: Vet Registration & Approval

1. **Create Vet (Auto on first login)**
   ```bash
   # Simulated by JWT authentication
   # Vet record auto-created on first API call
   ```

2. **Complete Profile**
   ```bash
   curl -X POST http://localhost:3001/api/v1/vets/profile/complete \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "fullName": "Dr. Jane Smith",
       "phoneNumber": "+2348012345678",
       "vcnNumber": "VCN12345",
       "practiceAddress": "123 Veterinary Lane, Lagos",
       "city": "Lagos",
       "state": "Lagos",
       "country": "NG",
       "specialization": "Small Animal Surgery",
       "yearsOfExperience": 5
     }'
   ```

3. **Get Approval Status**
   ```bash
   curl http://localhost:3001/api/v1/vets/approval-status \
     -H "Authorization: Bearer <JWT_TOKEN>"
   ```

4. **Master Admin: Get Pending Approvals**
   ```bash
   curl http://localhost:3001/api/v1/vets/pending-approvals \
     -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
   ```

5. **Master Admin: Approve Vet**
   ```bash
   curl -X PATCH http://localhost:3001/api/v1/vets/<VET_ID>/approve \
     -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
   ```

### Workflow 2: Organization Management

1. **Create Organization**
   ```bash
   curl -X POST http://localhost:3001/api/v1/orgs \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Lagos Veterinary Clinic",
       "description": "Premium pet care services",
       "address": "456 Pet Care Avenue",
       "city": "Lagos",
       "state": "Lagos",
       "phoneNumber": "+2348098765432",
       "email": "info@lagosvetclinic.com",
       "type": "CLINIC"
     }'
   ```

2. **List Organizations**
   ```bash
   curl http://localhost:3001/api/v1/orgs \
     -H "Authorization: Bearer <JWT_TOKEN>"
   ```

3. **Get Organization Details**
   ```bash
   curl http://localhost:3001/api/v1/orgs/<ORG_ID> \
     -H "Authorization: Bearer <JWT_TOKEN>"
   ```

### Workflow 3: Team Collaboration

1. **Invite Vet to Organization**
   ```bash
   curl -X POST http://localhost:3001/api/v1/orgs/<ORG_ID>/invitations \
     -H "Authorization: Bearer <OWNER_JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "invitedEmail": "vet2@example.com",
       "role": "MEMBER"
     }'
   ```

2. **Accept Invitation**
   ```bash
   curl -X POST http://localhost:3001/api/v1/invitations/<TOKEN>/accept \
     -H "Authorization: Bearer <INVITED_VET_JWT>"
   ```

3. **Update Member Permissions (OWNER only)**
   ```bash
   curl -X PATCH http://localhost:3001/api/v1/orgs/<ORG_ID>/members/<MEMBERSHIP_ID>/permissions \
     -H "Authorization: Bearer <OWNER_JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "canDeleteClients": true,
       "canDeleteAnimals": true,
       "canViewActivityLog": true
     }'
   ```

### Workflow 4: Client & Animal Management

1. **Create Client**
   ```bash
   curl -X POST http://localhost:3001/api/v1/orgs/<ORG_ID>/clients \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "John",
       "lastName": "Doe",
       "email": "john.doe@example.com",
       "phoneNumber": "+2348011112222",
       "address": "789 Pet Owner Street",
       "city": "Lagos",
       "state": "Lagos"
     }'
   ```

2. **List Clients with Search**
   ```bash
   curl "http://localhost:3001/api/v1/orgs/<ORG_ID>/clients?page=1&limit=10&search=John" \
     -H "Authorization: Bearer <JWT_TOKEN>"
   ```

3. **Register Animal**
   ```bash
   curl -X POST http://localhost:3001/api/v1/orgs/<ORG_ID>/animals \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "clientId": "<CLIENT_ID>",
       "name": "Max",
       "species": "DOG",
       "breed": "Golden Retriever",
       "gender": "MALE",
       "dateOfBirth": "2020-05-15",
       "weight": 30.5,
       "weightUnit": "KG",
       "microchipNumber": "MC123456789"
     }'
   ```

4. **Get Client Animals**
   ```bash
   curl http://localhost:3001/api/v1/orgs/<ORG_ID>/clients/<CLIENT_ID>/animals \
     -H "Authorization: Bearer <JWT_TOKEN>"
   ```

### Workflow 5: Treatment Records (with Versioning)

1. **Create Treatment Record**
   ```bash
   curl -X POST http://localhost:3001/api/v1/orgs/<ORG_ID>/treatments \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "animalId": "<ANIMAL_ID>",
       "visitDate": "2026-02-08",
       "chiefComplaint": "Vomiting and lethargy for 2 days",
       "clinicalFindings": "Mild dehydration, elevated temperature",
       "diagnosis": "Gastroenteritis",
       "treatmentGiven": "Fluid therapy, antiemetics, antibiotics",
       "prescriptions": {
         "medications": [
           {"name": "Metoclopramide", "dosage": "0.5mg/kg", "frequency": "BID", "duration": "3 days"},
           {"name": "Amoxicillin", "dosage": "20mg/kg", "frequency": "BID", "duration": "7 days"}
         ]
       },
       "weight": 29.8,
       "weightUnit": "KG",
       "temperature": 39.5,
       "temperatureUnit": "CELSIUS",
       "followUpDate": "2026-02-15",
       "status": "COMPLETED"
     }'
   ```

2. **Update Treatment (Creates New Version)**
   ```bash
   curl -X PATCH http://localhost:3001/api/v1/orgs/<ORG_ID>/treatments/<TREATMENT_ID> \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "followUpNotes": "Patient responded well to treatment. Continue medications as prescribed.",
       "status": "FOLLOW_UP_REQUIRED"
     }'
   ```

3. **Get Treatment Version History**
   ```bash
   curl http://localhost:3001/api/v1/orgs/<ORG_ID>/treatments/<TREATMENT_ID>/versions \
     -H "Authorization: Bearer <JWT_TOKEN>"
   ```

4. **List Animal Treatment History**
   ```bash
   curl http://localhost:3001/api/v1/orgs/<ORG_ID>/animals/<ANIMAL_ID>/treatments \
     -H "Authorization: Bearer <JWT_TOKEN>"
   ```

### Workflow 6: Soft Delete & Restore

1. **Delete Animal (Requires Permission)**
   ```bash
   curl -X DELETE http://localhost:3001/api/v1/orgs/<ORG_ID>/animals/<ANIMAL_ID> \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "reason": "Duplicate record created by mistake"
     }'
   ```

2. **List with Deleted Records**
   ```bash
   curl "http://localhost:3001/api/v1/orgs/<ORG_ID>/animals?includeDeleted=true" \
     -H "Authorization: Bearer <JWT_TOKEN>"
   ```

3. **Restore Deleted Animal**
   ```bash
   curl -X POST http://localhost:3001/api/v1/orgs/<ORG_ID>/animals/<ANIMAL_ID>/restore \
     -H "Authorization: Bearer <JWT_TOKEN>"
   ```

4. **Delete Client (Cascade to Animals & Treatments)**
   ```bash
   curl -X DELETE http://localhost:3001/api/v1/orgs/<ORG_ID>/clients/<CLIENT_ID> \
     -H "Authorization: Bearer <JWT_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "reason": "Client relocated and requested data removal"
     }'
   ```

### Workflow 7: Activity Log

1. **View Activity Log (OWNER or granted permission)**
   ```bash
   curl "http://localhost:3001/api/v1/orgs/<ORG_ID>/activity-log?page=1&limit=20" \
     -H "Authorization: Bearer <JWT_TOKEN>"
   ```

2. **Verify Activity Logged**
   - Every create, update, delete should appear
   - Check descriptions are human-readable
   - Verify vet information is included

### Workflow 8: Record Animal Death

```bash
curl -X PATCH http://localhost:3001/api/v1/orgs/<ORG_ID>/animals/<ANIMAL_ID>/death \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "dateOfDeath": "2026-02-07",
    "causeOfDeath": "Natural causes - old age"
  }'
```

## Verification Checklist

### ✅ Authentication & Authorization
- [ ] JWT token validation works
- [ ] Unapproved vets blocked from core features
- [ ] Suspended vets blocked
- [ ] Public endpoints accessible without auth

### ✅ Organization Scoping
- [ ] Members can only access their orgs
- [ ] Cross-org access blocked
- [ ] OrgScopeGuard enforced on all scoped endpoints

### ✅ Role-Based Access
- [ ] OWNER can do everything
- [ ] ADMIN can manage but not grant permissions
- [ ] MEMBER has limited access
- [ ] OWNER cannot be removed

### ✅ Granular Permissions
- [ ] Delete operations require explicit permission
- [ ] Activity log requires permission (except OWNER)
- [ ] Permission changes only by OWNER
- [ ] OWNER always has all permissions

### ✅ Soft Delete
- [ ] Clients soft delete correctly
- [ ] Animals soft delete correctly
- [ ] Treatments soft delete correctly
- [ ] Cascade delete works (client → animals → treatments)
- [ ] Deletion reason required
- [ ] Cannot update deleted records
- [ ] Restore functionality works

### ✅ Treatment Versioning
- [ ] Updates create new versions
- [ ] Old versions preserved
- [ ] isLatestVersion flag correct
- [ ] Version history retrievable
- [ ] parentRecordId links correct

### ✅ Data Integrity
- [ ] Microchip uniqueness within org
- [ ] VCN uniqueness platform-wide
- [ ] Animals require valid client
- [ ] Treatments require valid animal
- [ ] Cannot delete if children exist (with soft delete)

### ✅ Logging
- [ ] Audit logs created for all mutations
- [ ] Activity logs created for org actions
- [ ] Logs immutable
- [ ] Metadata captured correctly

### ✅ Pagination & Search
- [ ] Clients pagination works
- [ ] Animals pagination works
- [ ] Treatments pagination works
- [ ] Search filters work
- [ ] Species filter works
- [ ] Status filter works

### ✅ Invitations
- [ ] Email validation works
- [ ] Only invite approved vets
- [ ] Token generation unique
- [ ] 7-day expiration enforced
- [ ] Cannot accept expired
- [ ] Email mismatch blocked

## Performance Tests

### Load Test Example (Optional)

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test health endpoint
ab -n 1000 -c 10 http://localhost:3001/api/v1/health

# Test authenticated endpoint (need valid token)
ab -n 100 -c 5 -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3001/api/v1/orgs
```

## Common Issues & Solutions

### Issue: "VET_NOT_APPROVED"
**Solution**: Vet must be approved by Master Admin first

### Issue: "NOT_ORG_MEMBER"
**Solution**: User not a member of the organization

### Issue: "DELETE_PERMISSION_DENIED"
**Solution**: Member needs explicit delete permission from OWNER

### Issue: "ACTIVITY_LOG_ACCESS_DENIED"
**Solution**: Only OWNER or members with canViewActivityLog can access

### Issue: "MICROCHIP_EXISTS"
**Solution**: Microchip already registered in the organization

### Issue: "PARENT_DELETED"
**Solution**: Cannot perform operation on child of deleted parent

## Test Data Cleanup

```bash
# Connect to database
psql postgresql://postgres:%21iHky5AHQy%2FQW4D@db.blyhaayyzwvcdyrkejgr.supabase.co:5432/postgres

# Clear test data (careful!)
DELETE FROM activity_logs;
DELETE FROM audit_logs;
DELETE FROM treatment_records;
DELETE FROM animals;
DELETE FROM clients;
DELETE FROM invitations;
DELETE FROM org_memberships;
DELETE FROM organizations;
DELETE FROM vets WHERE email LIKE '%test%';
```

## Success Criteria

All workflows should complete without errors, and:
- ✅ All CRUD operations work
- ✅ All guards enforce correctly
- ✅ Soft delete cascades properly
- ✅ Versioning creates new records
- ✅ Permissions are enforced
- ✅ Logs are created
- ✅ Data integrity maintained
- ✅ No orphaned records
- ✅ Response format consistent

---

## P0 Features Test Suite (test/p0-features.e2e-spec.ts)

### Running P0 Tests

```bash
# Run P0 feature tests only
npm run test:e2e test/p0-features.e2e-spec.ts

# Run all e2e tests including P0
npm run test:e2e
```

### P0 Features Covered

1. **Organization paymentTerms Field**
   - Create organization with paymentTerms
   - Update paymentTerms
   - Get organization with paymentTerms

2. **Date Range Filtering on Revenue**
   - Filter by specific date range
   - Filter by today only
   - Filter by last month
   - Handle empty results for future dates

3. **Payment Category Filter on Treatments**
   - Filter by PET category (SINGLE_PET)
   - Filter by LIVESTOCK category (SINGLE_LIVESTOCK)
   - Filter by FARM category (BATCH_LIVESTOCK)
   - Combine with paymentStatus filter

4. **Dashboard Statistics Endpoint**
   - Get complete dashboard stats
   - Verify client counts (active/inactive)
   - Verify animal counts by patient type
   - Verify treatment counts (total, this month, scheduled, follow-ups)
   - Verify revenue breakdown (total, paid, owed, waived)

5. **Scheduled Treatments for Today**
   - Get all scheduled treatments for current day
   - Verify animal and client details included
   - Verify proper date filtering
   - Verify ordering by time

6. **Follow-ups Due Today**
   - Get all follow-ups due today
   - Verify proper date filtering
   - Verify included details

### Manual Testing P0 Endpoints

```bash
# 1. Dashboard Stats
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/orgs/{orgId}/dashboard/stats

# 2. Scheduled Today
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/orgs/{orgId}/treatments/scheduled/today

# 3. Follow-ups Today
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/orgs/{orgId}/treatments/follow-ups/today

# 4. Revenue with Date Range
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/v1/orgs/{orgId}/revenue?fromDate=2024-01-01&toDate=2024-12-31"

# 5. Filter Treatments by Category
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3001/api/v1/orgs/{orgId}/treatments?paymentCategory=PET&paymentStatus=OWED"
```

### Expected Test Results

- **Total Test Suites**: 4 (app, e2e-automated, e2e-deep-scenarios, p0-features)
- **P0 Test Cases**: 47 tests covering all P0 features
- **Coverage**: All new endpoints and enhanced features

### Test Data Requirements

The P0 test suite creates its own test data including:
- 3 vets (OWNER, ADMIN, MEMBER) with proper permissions
- 1 organization with approved status and paymentTerms
- 1 client
- 3 animals (1 PET, 1 LIVESTOCK, 1 FARM BATCH)
- Multiple treatments with different payment statuses
- Scheduled treatments for today
- Follow-ups due today

---

## Documentation References

- **Error Codes**: See `docs/backend/ERROR_CODE_CATALOG.md`
- **P0 Implementation**: See `docs/backend/P0_IMPLEMENTATION_SUMMARY.md`
- **API-Frontend Mapping**: See `docs/frontend/API_FRONTEND_MAPPING.md`

---

**Note**: This guide assumes Supabase is active and accessible. If database connection fails, check Supabase dashboard for project status.
