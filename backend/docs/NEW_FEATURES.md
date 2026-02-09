# New Features Documentation

This document outlines the new features added to the Veterinary Registration & Practice Management Platform.

## Table of Contents

1. [Patient Types Enhancement](#patient-types-enhancement)
2. [Organization Approval Workflow](#organization-approval-workflow)
3. [Treatment Payment Tracking](#treatment-payment-tracking)
4. [Scheduled Treatments](#scheduled-treatments)
5. [Treatment History Import](#treatment-history-import)
6. [Organization Revenue Tracking](#organization-revenue-tracking)

---

## Patient Types Enhancement

### Overview
The system now supports three types of patients:
- **Single Pet**: Individual companion animals (dogs, cats, etc.)
- **Single Livestock**: Individual farm animals (cattle, goat, sheep, etc.)
- **Batch Livestock**: Groups of livestock managed as a single unit

### Database Schema Changes

**New Enum:**
```prisma
enum PatientType {
  SINGLE_PET
  SINGLE_LIVESTOCK
  BATCH_LIVESTOCK
}
```

**New Fields in Animal Model:**
- `patientType`: PatientType (default: SINGLE_PET)
- `batchName`: String? (for batch livestock)
- `batchSize`: Int? (number of animals in batch)
- `batchIdentifier`: String? (unique identifier for the batch)

### API Usage

**Creating a Single Pet/Livestock:**
```json
POST /orgs/{orgId}/animals
{
  "clientId": "client-uuid",
  "name": "Max",
  "species": "DOG",
  "breed": "Golden Retriever",
  "patientType": "SINGLE_PET"
}
```

**Creating a Batch of Livestock:**
```json
POST /orgs/{orgId}/animals
{
  "clientId": "client-uuid",
  "name": "Cattle Batch #1",
  "species": "CATTLE",
  "patientType": "BATCH_LIVESTOCK",
  "batchName": "Northern Herd Q1",
  "batchSize": 50,
  "batchIdentifier": "NH-Q1-2026"
}
```

---

## Organization Approval Workflow

### Overview
Organizations now require manual approval by a Master Admin before they become active, similar to the veterinarian approval process.

### Database Schema Changes

**New Enum:**
```prisma
enum OrgStatus {
  PENDING_APPROVAL
  APPROVED
  REJECTED
  SUSPENDED
}
```

**New Fields in Organization Model:**
- `status`: OrgStatus (default: PENDING_APPROVAL)
- `approvedAt`: DateTime?
- `approvedBy`: String?
- `rejectedAt`: DateTime?
- `rejectedBy`: String?
- `rejectionReason`: String?
- `suspendedAt`: DateTime?
- `suspendedBy`: String?
- `suspensionReason`: String?
- `reactivatedAt`: DateTime?
- `reactivatedBy`: String?

### API Endpoints

**Get Pending Organizations (Master Admin Only):**
```
GET /orgs/admin/pending-approvals
```

**Approve Organization (Master Admin Only):**
```
POST /orgs/admin/{orgId}/approve
```

**Reject Organization (Master Admin Only):**
```json
POST /orgs/admin/{orgId}/reject
{
  "reason": "Incomplete documentation"
}
```

**Suspend Organization (Master Admin Only):**
```json
POST /orgs/admin/{orgId}/suspend
{
  "reason": "Compliance violation"
}
```

**Reactivate Organization (Master Admin Only):**
```
POST /orgs/admin/{orgId}/reactivate
```

### Workflow
1. Vet creates organization → Status: PENDING_APPROVAL
2. Master Admin reviews organization
3. Master Admin approves/rejects
4. If approved, organization can operate normally
5. Master Admin can suspend/reactivate organizations at any time

---

## Treatment Payment Tracking

### Overview
Each treatment can now have payment information tracked, including amount, payment status, and who marked it as paid.

### Database Schema Changes

**New Enum:**
```prisma
enum PaymentStatus {
  PAID
  OWED
  PARTIALLY_PAID
  WAIVED
}
```

**New Fields in TreatmentRecord Model:**
- `amount`: Decimal? (treatment cost)
- `currency`: String? (default: "NGN")
- `paymentStatus`: PaymentStatus?
- `paidAt`: DateTime?
- `paidBy`: String? (vet who marked as paid)
- `amountPaid`: Decimal? (for partial payments)
- `paymentNotes`: String?

### API Usage

**Creating Treatment with Payment Info:**
```json
POST /orgs/{orgId}/treatments
{
  "animalId": "animal-uuid",
  "visitDate": "2026-02-09",
  "chiefComplaint": "Vaccination",
  "treatmentGiven": "Rabies vaccine administered",
  "amount": 5000,
  "currency": "NGN",
  "paymentStatus": "PAID"
}
```

**Marking Payment:**
```json
POST /orgs/{orgId}/treatments/{treatmentId}/payment
{
  "paymentStatus": "PAID",
  "amountPaid": 5000,
  "paymentNotes": "Cash payment received"
}
```

**Partial Payment:**
```json
POST /orgs/{orgId}/treatments/{treatmentId}/payment
{
  "paymentStatus": "PARTIALLY_PAID",
  "amountPaid": 3000,
  "paymentNotes": "Partial payment, balance: 2000"
}
```

---

## Scheduled Treatments

### Overview
Vets can now schedule treatments in advance, allowing for appointment management and follow-up scheduling.

### Database Schema Changes

**New Fields in TreatmentRecord Model:**
- `isScheduled`: Boolean (default: false)
- `scheduledFor`: DateTime?

### API Usage

**Creating a Scheduled Treatment:**
```json
POST /orgs/{orgId}/treatments
{
  "animalId": "animal-uuid",
  "visitDate": "2026-02-09",
  "chiefComplaint": "Follow-up vaccination",
  "treatmentGiven": "To be administered",
  "isScheduled": true,
  "scheduledFor": "2026-03-09T10:00:00Z",
  "status": "IN_PROGRESS"
}
```

**Getting Scheduled Treatments:**
```
GET /orgs/{orgId}/treatments/scheduled/list?page=1&limit=50
```

### Use Cases
- Schedule follow-up appointments
- Plan routine vaccinations
- Book surgical procedures in advance
- Manage appointment calendar

---

## Treatment History Import

### Overview
When adding livestock (especially batch livestock), vets can now import previous treatment history. This is useful when onboarding existing clients with historical records.

### API Usage

**Creating Livestock with Treatment History:**
```json
POST /orgs/{orgId}/animals
{
  "clientId": "client-uuid",
  "name": "Dairy Cow Herd",
  "species": "CATTLE",
  "patientType": "BATCH_LIVESTOCK",
  "batchName": "Dairy Herd A",
  "batchSize": 30,
  "treatmentHistory": [
    {
      "visitDate": "2025-12-15",
      "chiefComplaint": "Routine vaccination",
      "diagnosis": "Healthy",
      "treatmentGiven": "FMD vaccine administered to entire herd",
      "notes": "All animals responded well"
    },
    {
      "visitDate": "2026-01-10",
      "chiefComplaint": "Deworming",
      "diagnosis": "Parasitic prevention",
      "treatmentGiven": "Ivermectin administered",
      "notes": "Follow-up in 3 months"
    }
  ]
}
```

### Benefits
- Maintain complete medical history when transferring from other systems
- Import records from paper-based systems
- Ensure continuity of care
- Better decision-making with complete historical data

---

## Organization Revenue Tracking

### Overview
Organizations can now view their revenue statistics, including total revenue, amount paid, and amount owed.

### API Endpoint

**Get Organization Revenue (Owner/Admin Only):**
```
GET /orgs/{orgId}/revenue
```

**Response:**
```json
{
  "totalRevenue": "150000.00",
  "totalPaid": "120000.00",
  "totalOwed": "30000.00",
  "totalTreatments": 45,
  "paymentBreakdown": [
    {
      "status": "PAID",
      "count": 35,
      "totalAmount": "120000.00",
      "amountPaid": "120000.00"
    },
    {
      "status": "OWED",
      "count": 8,
      "totalAmount": "25000.00",
      "amountPaid": "0.00"
    },
    {
      "status": "PARTIALLY_PAID",
      "count": 2,
      "totalAmount": "5000.00",
      "amountPaid": "0.00"
    }
  ]
}
```

### Features
- Total revenue calculation across all treatments
- Track paid vs. owed amounts
- Payment status breakdown
- Treatment count statistics
- Only accessible to organization owners and admins

---

## Migration Notes

### Database Migration
Due to schema changes, a database migration is required. The migration includes:

1. New enums: `PatientType`, `PaymentStatus`, `OrgStatus`
2. New fields in `Animal` model for batch livestock
3. New fields in `Organization` model for approval workflow
4. New fields in `TreatmentRecord` model for payment tracking and scheduling

### Running the Migration

```bash
cd backend
npx prisma migrate dev --name add_patient_types_org_approval_payment_tracking
```

**Note:** If you encounter drift issues with existing database, you may need to:
```bash
npx prisma migrate reset  # Caution: This will delete all data
# OR
npx prisma db push  # For development only
```

### Backward Compatibility

- Existing animals will default to `patientType: SINGLE_PET`
- Existing organizations will default to `status: PENDING_APPROVAL` (may require manual approval)
- Existing treatments without payment info will have `NULL` values for payment fields
- All new fields are optional or have sensible defaults

---

## Security Considerations

### Organization Approval
- Only Master Admins can approve/reject/suspend organizations
- Endpoints use `@SkipApproval()` and `@UseGuards(MasterAdminGuard)`
- All actions are logged in audit logs

### Payment Tracking
- All organization members can create treatments with payment info
- Only the vet who marks payment updates the `paidBy` field
- Revenue endpoint restricted to owners and admins

### Treatment History Import
- Imported treatments are created with `status: COMPLETED`
- All imported treatments are linked to the creating vet
- Cannot be used to forge treatments (all are audited)

---

## API Testing Examples

### Postman Collection Updates

Add these requests to your Postman collection:

1. **Create Batch Livestock**
   - Method: POST
   - URL: `{{baseUrl}}/orgs/{{orgId}}/animals`
   - Body: (see Batch Livestock example above)

2. **Mark Payment**
   - Method: POST
   - URL: `{{baseUrl}}/orgs/{{orgId}}/treatments/{{treatmentId}}/payment`
   - Body: (see Payment tracking example above)

3. **Get Organization Revenue**
   - Method: GET
   - URL: `{{baseUrl}}/orgs/{{orgId}}/revenue`

4. **Approve Organization (Master Admin)**
   - Method: POST
   - URL: `{{baseUrl}}/orgs/admin/{{orgId}}/approve`

---

## Future Enhancements

Potential future additions:
- Payment reminders for owed treatments
- Automated revenue reports (daily/weekly/monthly)
- Batch treatment scheduling for livestock
- Integration with payment gateways
- SMS/Email notifications for scheduled treatments
- Revenue analytics and charts
- Batch operations for livestock (treat entire batch at once)

---

## Support

For questions or issues related to these new features:
1. Check the API documentation
2. Review the Prisma schema for field details
3. Check audit logs for approval/payment history
4. Contact the development team

---

**Last Updated:** February 9, 2026
**Version:** 1.1.0
