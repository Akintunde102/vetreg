# Migration Guide: Version 1.0 to 1.1

This guide helps you migrate from version 1.0 to version 1.1, which includes patient types, organization approval, and payment tracking features.

## Overview of Changes

### Database Schema Changes
1. **New Enums**: `PatientType`, `PaymentStatus`, `OrgStatus`
2. **Animal Model**: Added patient type and batch livestock fields
3. **Organization Model**: Added approval workflow fields
4. **TreatmentRecord Model**: Added payment tracking and scheduling fields

### API Changes
1. **New Endpoints**: Organization approval, payment tracking, revenue tracking
2. **Enhanced DTOs**: Support for batch livestock and treatment history import
3. **New Query Filters**: Payment status, scheduled treatments

---

## Pre-Migration Checklist

- [ ] Backup your database
- [ ] Review the new features documentation
- [ ] Update your API client/frontend to handle new fields
- [ ] Plan for organization approval process
- [ ] Coordinate with Master Admin for organization approvals

---

## Migration Steps

### Step 1: Backup Database

```bash
# PostgreSQL backup
pg_dump -h <host> -U <user> -d <database> > backup_pre_v1.1_$(date +%Y%m%d).sql

# Or use Supabase dashboard backup feature
```

### Step 2: Update Code

```bash
cd backend
git pull origin main
npm install  # Install any new dependencies
```

### Step 3: Review Schema Changes

```bash
# View the schema
cat prisma/schema.prisma | grep -A 20 "enum PatientType"
cat prisma/schema.prisma | grep -A 20 "enum PaymentStatus"
cat prisma/schema.prisma | grep -A 20 "enum OrgStatus"
```

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

### Step 5: Run Migration

**Option A: Development (Fresh Start)**
```bash
# WARNING: This will delete all data
npx prisma migrate reset
npx prisma migrate dev
```

**Option B: Development (Preserve Data)**
```bash
# For development with existing data
npx prisma db push
```

**Option C: Production (Recommended)**
```bash
# Create migration without applying
npx prisma migrate dev --create-only --name add_patient_types_org_approval_payment_tracking

# Review the migration SQL file in prisma/migrations/

# Apply migration
npx prisma migrate deploy
```

### Step 6: Verify Migration

```bash
# Check schema status
npx prisma migrate status

# Verify Prisma client generation
npx prisma generate
```

### Step 7: Update Default Values

**Set Default Patient Type for Existing Animals:**
```sql
-- All existing animals will default to SINGLE_PET
-- Run this if needed to explicitly set:
UPDATE animals 
SET patient_type = 'SINGLE_PET' 
WHERE patient_type IS NULL;
```

**Handle Existing Organizations:**
```sql
-- IMPORTANT: Existing organizations will default to PENDING_APPROVAL
-- You may want to auto-approve existing organizations:
UPDATE organizations 
SET status = 'APPROVED', 
    approved_at = NOW(), 
    approved_by = (SELECT id FROM vets WHERE is_master_admin = true LIMIT 1)
WHERE status = 'PENDING_APPROVAL' 
  AND created_at < '2026-02-09';  -- Organizations created before migration

-- Or manually review and approve each one via the admin endpoints
```

---

## Post-Migration Tasks

### 1. Test New Endpoints

**Organization Approval:**
```bash
# Get pending organizations
curl -X GET http://localhost:3000/orgs/admin/pending-approvals \
  -H "Authorization: Bearer <master-admin-token>"

# Approve organization
curl -X POST http://localhost:3000/orgs/admin/{orgId}/approve \
  -H "Authorization: Bearer <master-admin-token>"
```

**Payment Tracking:**
```bash
# Create treatment with payment
curl -X POST http://localhost:3000/orgs/{orgId}/treatments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "animalId": "...",
    "visitDate": "2026-02-09",
    "chiefComplaint": "Vaccination",
    "treatmentGiven": "Rabies vaccine",
    "amount": 5000,
    "paymentStatus": "PAID"
  }'

# Get revenue
curl -X GET http://localhost:3000/orgs/{orgId}/revenue \
  -H "Authorization: Bearer <owner-token>"
```

**Batch Livestock:**
```bash
# Create batch livestock
curl -X POST http://localhost:3000/orgs/{orgId}/animals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "...",
    "name": "Cattle Herd A",
    "species": "CATTLE",
    "patientType": "BATCH_LIVESTOCK",
    "batchName": "Northern Herd",
    "batchSize": 50
  }'
```

### 2. Update Frontend/Client

If you have a frontend application, update it to:

1. **Handle New Patient Types**
   - Add UI for selecting patient type
   - Show batch fields when BATCH_LIVESTOCK is selected
   - Display batch information in animal lists

2. **Organization Approval**
   - Add admin interface for pending organizations
   - Show organization status to users
   - Handle pending approval state

3. **Payment Tracking**
   - Add payment fields to treatment forms
   - Show payment status in treatment lists
   - Display revenue dashboard for owners/admins

4. **Scheduled Treatments**
   - Add scheduling interface
   - Show scheduled treatments calendar
   - Send reminders for upcoming appointments

### 3. Data Migration (Optional)

If you need to import historical data:

**Import Treatment History:**
```javascript
// Example: Import historical treatments for livestock
const historicalTreatments = [
  {
    visitDate: "2025-12-01",
    chiefComplaint: "Vaccination",
    treatmentGiven: "FMD vaccine",
    diagnosis: "Healthy"
  }
  // ... more treatments
];

// Include in animal creation
await createAnimal({
  // ... animal fields
  treatmentHistory: historicalTreatments
});
```

**Bulk Update Organizations:**
```sql
-- If you want to bulk approve organizations from a specific creator
UPDATE organizations 
SET status = 'APPROVED', 
    approved_at = NOW(),
    approved_by = '<master-admin-id>'
WHERE created_by IN (
  SELECT id FROM vets WHERE status = 'APPROVED' AND profile_completed = true
);
```

---

## Rollback Plan

If you need to rollback:

### Option 1: Database Restore
```bash
# Restore from backup
psql -h <host> -U <user> -d <database> < backup_pre_v1.1_YYYYMMDD.sql
```

### Option 2: Revert Migration
```bash
# Find the migration
npx prisma migrate status

# Rollback (manual SQL)
# You'll need to manually drop the new columns/enums
```

**Rollback SQL:**
```sql
-- Remove new columns
ALTER TABLE animals DROP COLUMN IF EXISTS patient_type;
ALTER TABLE animals DROP COLUMN IF EXISTS batch_name;
ALTER TABLE animals DROP COLUMN IF EXISTS batch_size;
ALTER TABLE animals DROP COLUMN IF EXISTS batch_identifier;

ALTER TABLE organizations DROP COLUMN IF EXISTS status;
ALTER TABLE organizations DROP COLUMN IF EXISTS approved_at;
ALTER TABLE organizations DROP COLUMN IF EXISTS approved_by;
-- ... (continue for all new fields)

ALTER TABLE treatment_records DROP COLUMN IF EXISTS is_scheduled;
ALTER TABLE treatment_records DROP COLUMN IF EXISTS scheduled_for;
ALTER TABLE treatment_records DROP COLUMN IF EXISTS amount;
-- ... (continue for all new fields)

-- Drop new enums
DROP TYPE IF EXISTS "PatientType";
DROP TYPE IF EXISTS "PaymentStatus";
DROP TYPE IF EXISTS "OrgStatus";
```

### Option 3: Revert Code
```bash
# Revert to previous version
git checkout v1.0.0
npm install
npx prisma generate
```

---

## Troubleshooting

### Issue: Migration Drift Detected

**Problem:**
```
Drift detected: Your database schema is not in sync with your migration history.
```

**Solution:**
```bash
# Development: Reset and re-migrate
npx prisma migrate reset

# Production: Create a baseline migration
npx prisma migrate resolve --applied <migration-name>
npx prisma migrate deploy
```

### Issue: Organizations Not Accessible

**Problem:** Existing organizations are pending approval and users can't access them.

**Solution:**
```sql
-- Auto-approve all existing organizations
UPDATE organizations 
SET status = 'APPROVED', 
    approved_at = NOW()
WHERE created_at < NOW() - INTERVAL '1 hour';
```

### Issue: Payment Fields Showing NULL

**Problem:** Existing treatments show NULL for payment fields.

**Solution:** This is expected. Payment tracking is optional. You can:
1. Leave as is (NULL means no payment tracking)
2. Bulk update with default values if needed:
```sql
UPDATE treatment_records 
SET payment_status = 'OWED', 
    amount = 0 
WHERE amount IS NULL 
  AND created_at < '2026-02-09';
```

### Issue: Prisma Client Type Errors

**Problem:** TypeScript errors about missing enum types.

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Restart TypeScript server in your IDE
# VS Code: Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

---

## Validation Steps

After migration, verify:

- [ ] All existing animals are accessible
- [ ] Existing treatments are intact
- [ ] Organizations are accessible (check approval status)
- [ ] New animal creation works (with and without batch fields)
- [ ] Treatment creation with payment tracking works
- [ ] Organization approval endpoints work (master admin only)
- [ ] Revenue tracking endpoint works
- [ ] Scheduled treatments can be created and retrieved
- [ ] Treatment history import works for livestock

---

## Timeline Recommendation

For production environments:

1. **Day 1**: Backup database, review migration plan
2. **Day 2**: Run migration in staging environment, test thoroughly
3. **Day 3**: Update frontend/client applications
4. **Day 4**: Schedule maintenance window for production migration
5. **Day 5**: Execute production migration, monitor for issues
6. **Week 2**: Train users on new features, especially Master Admins

---

## Support

If you encounter issues during migration:

1. Check the troubleshooting section above
2. Review Prisma migration logs: `prisma/migrations/`
3. Check application logs for errors
4. Verify database connection and permissions
5. Contact the development team with:
   - Migration logs
   - Error messages
   - Database version
   - Node.js version

---

**Last Updated:** February 9, 2026
**Version:** 1.0 → 1.1
