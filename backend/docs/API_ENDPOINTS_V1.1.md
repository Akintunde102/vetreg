# API Endpoints - Version 1.1.0

Complete API reference for the Veterinary Registration & Practice Management Platform.

**Base URL:** `http://localhost:3000/api/v1`  
**Authentication:** Bearer token (Supabase JWT) in Authorization header

**Interactive API docs (Scalar):** When the backend is running, open [http://localhost:3001/docs](http://localhost:3001/docs) for a live, try-it-out API reference.

---

## Authentication

### Get Current User
```
GET /auth/me
```
Returns current vet profile and creates record if first-time user.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "vet@example.com",
    "fullName": "Dr. John Doe",
    "status": "APPROVED",
    "profileCompleted": true
  }
}
```

---

## Vets

### Complete Profile
```
POST /vets/profile/complete
Authorization: Bearer <token>
```

**Body:**
```json
{
  "fullName": "Dr. John Doe",
  "phoneNumber": "+2348012345678",
  "vcnNumber": "VCN123456",
  "specialization": "Small Animal Medicine",
  "yearsOfExperience": 5,
  "universityAttended": "University of Ibadan",
  "graduationYear": 2018,
  "practiceAddress": "123 Main St",
  "city": "Lagos",
  "state": "Lagos",
  "practiceType": "SMALL_ANIMAL"
}
```

### Get Profile
```
GET /vets/profile
Authorization: Bearer <token>
```

### Get Approval Status
```
GET /vets/approval-status
Authorization: Bearer <token>
```

### Master Admin - Get Pending Approvals
```
GET /vets/pending-approvals
Authorization: Bearer <master-admin-token>
```

### Master Admin - Approve Vet
```
POST /vets/:vetId/approve
Authorization: Bearer <master-admin-token>
```

### Master Admin - Reject Vet
```
POST /vets/:vetId/reject
Authorization: Bearer <master-admin-token>

Body: { "reason": "Incomplete documentation" }
```

### Master Admin - Suspend Vet
```
POST /vets/:vetId/suspend
Authorization: Bearer <master-admin-token>

Body: { "reason": "Violation of terms" }
```

### Master Admin - Reactivate Vet
```
POST /vets/:vetId/reactivate
Authorization: Bearer <master-admin-token>
```

---

## Organizations

### Create Organization
```
POST /orgs
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Happy Paws Veterinary Clinic",
  "address": "456 Pet Street",
  "city": "Lagos",
  "state": "Lagos",
  "country": "NG",
  "phoneNumber": "+2348012345678",
  "email": "info@happypaws.com",
  "type": "CLINIC"
}
```

### Get All Organizations
```
GET /orgs
Authorization: Bearer <token>
```

### Get Organization Details
```
GET /orgs/:orgId
Authorization: Bearer <token>
```

### Update Organization
```
PATCH /orgs/:orgId
Authorization: Bearer <token>
Roles: OWNER, ADMIN
```

### Get Organization Members
```
GET /orgs/:orgId/members
Authorization: Bearer <token>
```

### Get Activity Logs
```
GET /orgs/:orgId/activity-log?page=1&limit=50
Authorization: Bearer <token>
Permission: canViewActivityLog OR role=OWNER
```

### Get Organization Revenue ✨ v1.1
```
GET /orgs/:orgId/revenue
Authorization: Bearer <token>
Roles: OWNER, ADMIN
```

**Response:**
```json
{
  "success": true,
  "data": {
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
      }
    ]
  }
}
```

### Master Admin - Get Pending Organizations ✨ v1.1
```
GET /orgs/admin/pending-approvals
Authorization: Bearer <master-admin-token>
```

### Master Admin - Approve Organization ✨ v1.1
```
POST /orgs/admin/:orgId/approve
Authorization: Bearer <master-admin-token>
```

### Master Admin - Reject Organization ✨ v1.1
```
POST /orgs/admin/:orgId/reject
Authorization: Bearer <master-admin-token>

Body: { "reason": "Incomplete information" }
```

### Master Admin - Suspend Organization ✨ v1.1
```
POST /orgs/admin/:orgId/suspend
Authorization: Bearer <master-admin-token>

Body: { "reason": "Compliance violation" }
```

### Master Admin - Reactivate Organization ✨ v1.1
```
POST /orgs/admin/:orgId/reactivate
Authorization: Bearer <master-admin-token>
```

---

## Memberships & Invitations

### Create Invitation
```
POST /orgs/:orgId/invitations
Authorization: Bearer <token>
Roles: OWNER, ADMIN
```

**Body:**
```json
{
  "email": "vet@example.com",
  "role": "MEMBER"
}
```

### Get Invitations
```
GET /orgs/:orgId/invitations
Authorization: Bearer <token>
Roles: OWNER, ADMIN
```

### Accept Invitation
```
POST /invitations/:token/accept
Authorization: Bearer <token>
```

### Decline Invitation
```
POST /invitations/:token/decline
Authorization: Bearer <token>
```

### Cancel Invitation
```
DELETE /orgs/:orgId/invitations/:invitationId
Authorization: Bearer <token>
Roles: OWNER, ADMIN
```

### Remove Member
```
DELETE /orgs/:orgId/members/:membershipId
Authorization: Bearer <token>
Roles: OWNER
```

### Update Member Role
```
PATCH /orgs/:orgId/members/:membershipId/role
Authorization: Bearer <token>
Roles: OWNER

Body: { "role": "ADMIN" }
```

### Update Member Permissions
```
PATCH /orgs/:orgId/members/:membershipId/permissions
Authorization: Bearer <token>
Roles: OWNER

Body: {
  "canDeleteClients": true,
  "canDeleteAnimals": true,
  "canDeleteTreatments": false,
  "canViewActivityLog": true
}
```

### Leave Organization
```
POST /orgs/:orgId/leave
Authorization: Bearer <token>
```

---

## Clients

### Create Client
```
POST /orgs/:orgId/clients
Authorization: Bearer <token>
```

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phoneNumber": "+2348012345678",
  "address": "789 Client Ave",
  "city": "Lagos",
  "state": "Lagos"
}
```

### Get All Clients
```
GET /orgs/:orgId/clients?page=1&limit=50&search=jane
Authorization: Bearer <token>
```

### Get Client Details
```
GET /orgs/:orgId/clients/:clientId
Authorization: Bearer <token>
```

### Update Client
```
PATCH /orgs/:orgId/clients/:clientId
Authorization: Bearer <token>
```

### Soft Delete Client
```
DELETE /orgs/:orgId/clients/:clientId
Authorization: Bearer <token>
Permission: canDeleteClients

Body: { "reason": "Duplicate entry" }
```

### Restore Client
```
POST /orgs/:orgId/clients/:clientId/restore
Authorization: Bearer <token>
Roles: OWNER, ADMIN
```

### Get Client's Animals
```
GET /orgs/:orgId/clients/:clientId/animals
Authorization: Bearer <token>
```

---

## Animals

### Register Animal (Enhanced v1.1) ✨
```
POST /orgs/:orgId/animals
Authorization: Bearer <token>
```

**Body - Single Pet:**
```json
{
  "clientId": "uuid",
  "name": "Max",
  "species": "DOG",
  "breed": "Golden Retriever",
  "gender": "MALE",
  "patientType": "SINGLE_PET"
}
```

**Body - Batch Livestock with Treatment History:** ✨ v1.1
```json
{
  "clientId": "uuid",
  "name": "Dairy Herd A",
  "species": "CATTLE",
  "patientType": "BATCH_LIVESTOCK",
  "batchName": "Northern Herd",
  "batchSize": 50,
  "batchIdentifier": "NH-2026-Q1",
  "treatmentHistory": [
    {
      "visitDate": "2025-12-15",
      "chiefComplaint": "Routine vaccination",
      "diagnosis": "Healthy",
      "treatmentGiven": "FMD vaccine administered",
      "notes": "All animals responded well"
    },
    {
      "visitDate": "2026-01-10",
      "chiefComplaint": "Deworming",
      "treatmentGiven": "Ivermectin administered"
    }
  ]
}
```

### Get All Animals
```
GET /orgs/:orgId/animals?page=1&limit=50&search=max&species=DOG
Authorization: Bearer <token>
```

### Get Animal Details
```
GET /orgs/:orgId/animals/:animalId
Authorization: Bearer <token>
```

### Update Animal
```
PATCH /orgs/:orgId/animals/:animalId
Authorization: Bearer <token>
```

### Soft Delete Animal
```
DELETE /orgs/:orgId/animals/:animalId
Authorization: Bearer <token>
Permission: canDeleteAnimals

Body: { "reason": "Owner request" }
```

### Restore Animal
```
POST /orgs/:orgId/animals/:animalId/restore
Authorization: Bearer <token>
Roles: OWNER, ADMIN
```

### Record Animal Death
```
POST /orgs/:orgId/animals/:animalId/death
Authorization: Bearer <token>

Body: {
  "dateOfDeath": "2026-02-09",
  "causeOfDeath": "Old age"
}
```

### Get Treatment History
```
GET /orgs/:orgId/animals/:animalId/treatments
Authorization: Bearer <token>
```

---

## Treatments

### Create Treatment (Enhanced v1.1) ✨
```
POST /orgs/:orgId/treatments
Authorization: Bearer <token>
```

**Body - Regular Treatment:**
```json
{
  "animalId": "uuid",
  "visitDate": "2026-02-09",
  "chiefComplaint": "Vaccination",
  "diagnosis": "Healthy",
  "treatmentGiven": "Rabies vaccine administered",
  "notes": "Animal tolerated well",
  "status": "COMPLETED"
}
```

**Body - Treatment with Payment:** ✨ v1.1
```json
{
  "animalId": "uuid",
  "visitDate": "2026-02-09",
  "chiefComplaint": "Vaccination",
  "treatmentGiven": "Rabies vaccine",
  "amount": 5000,
  "currency": "NGN",
  "paymentStatus": "PAID"
}
```

**Body - Scheduled Treatment:** ✨ v1.1
```json
{
  "animalId": "uuid",
  "visitDate": "2026-02-09",
  "chiefComplaint": "Follow-up checkup",
  "treatmentGiven": "To be administered",
  "isScheduled": true,
  "scheduledFor": "2026-03-09T10:00:00Z",
  "status": "IN_PROGRESS"
}
```

### Get All Treatments
```
GET /orgs/:orgId/treatments?page=1&limit=50&animalId=uuid&status=COMPLETED
Authorization: Bearer <token>
```

### Get Scheduled Treatments ✨ v1.1
```
GET /orgs/:orgId/treatments/scheduled/list?page=1&limit=50
Authorization: Bearer <token>
```

### Get Treatment Details
```
GET /orgs/:orgId/treatments/:treatmentId
Authorization: Bearer <token>
```

### Update Treatment (Creates New Version)
```
PATCH /orgs/:orgId/treatments/:treatmentId
Authorization: Bearer <token>
```

### Mark Payment ✨ v1.1
```
POST /orgs/:orgId/treatments/:treatmentId/payment
Authorization: Bearer <token>
```

**Body:**
```json
{
  "paymentStatus": "PAID",
  "amountPaid": 5000,
  "paymentNotes": "Cash payment received"
}
```

**Body - Partial Payment:**
```json
{
  "paymentStatus": "PARTIALLY_PAID",
  "amountPaid": 3000,
  "paymentNotes": "Partial payment, balance: 2000"
}
```

### Soft Delete Treatment
```
DELETE /orgs/:orgId/treatments/:treatmentId
Authorization: Bearer <token>
Permission: canDeleteTreatments

Body: { "reason": "Data entry error" }
```

### Restore Treatment
```
POST /orgs/:orgId/treatments/:treatmentId/restore
Authorization: Bearer <token>
Roles: OWNER, ADMIN
```

### Get Treatment Versions
```
GET /orgs/:orgId/treatments/:treatmentId/versions
Authorization: Bearer <token>
```

---

## Response Format

All endpoints follow this standard envelope:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2026-02-09T12:00:00Z",
    "requestId": "uuid",
    "pagination": { /* if applicable */ }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "statusCode": 400,
    "details": { /* optional additional details */ }
  },
  "meta": {
    "timestamp": "2026-02-09T12:00:00Z",
    "requestId": "uuid"
  }
}
```

---

## Status Codes

- `200` - OK (Success)
- `201` - Created (Resource created successfully)
- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Missing or invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource not found)
- `409` - Conflict (Duplicate resource)
- `429` - Too Many Requests (Rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limits

- 100 requests per minute per IP
- Additional per-user limits may apply

---

## Notes

- All dates should be in ISO 8601 format
- All IDs are UUIDs
- Pagination defaults: page=1, limit=50
- Search parameters are case-insensitive
- Soft-deleted records are excluded by default (use `?includeDeleted=true` where supported)

---

**Version:** 1.1.0  
**Last Updated:** February 9, 2026
