# Error Code Catalog

**Version:** 1.0.0  
**Last Updated:** February 9, 2026  
**Purpose:** Complete reference of error codes used in the backend API

---

## Table of Contents

1. [Overview](#overview)
2. [Error Response Format](#error-response-format)
3. [Authentication & Authorization Errors](#authentication--authorization-errors)
4. [Vet Profile Errors](#vet-profile-errors)
5. [Organization Errors](#organization-errors)
6. [Client Errors](#client-errors)
7. [Animal Errors](#animal-errors)
8. [Treatment Errors](#treatment-errors)
9. [Membership & Invitation Errors](#membership--invitation-errors)
10. [Frontend Error Handling Guide](#frontend-error-handling-guide)

---

## Overview

All API errors follow a consistent format with a `code` field for programmatic handling and a `message` field for human-readable descriptions. The frontend should use the `code` field to determine the appropriate user-facing action.

---

## Error Response Format

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Optional additional context
    }
  }
}
```

### HTTP Status Codes

| Status | Category | Usage |
|--------|----------|-------|
| 400 | Bad Request | Invalid input, validation errors, business logic violations |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Valid auth but insufficient permissions or account status issues |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource or state conflict |
| 500 | Server Error | Unexpected server-side error |

---

## Authentication & Authorization Errors

### UNAUTHENTICATED

**HTTP Status:** `403`  
**Message:** "User not authenticated"  
**When Returned:** User is not logged in or token is missing/invalid  
**Frontend Action:**
- Redirect to `/login`
- Clear local session/token
- Show "Session expired, please log in again"

**Example:**
```json
{
  "code": "UNAUTHENTICATED",
  "message": "User not authenticated"
}
```

---

### VET_NOT_APPROVED

**HTTP Status:** `403`  
**Message:** "Your profile is pending approval. You will receive an email once approved."  
**When Returned:** Vet's profile is submitted but not yet approved by admin  
**Frontend Action:**
- Redirect to `/onboarding/pending` page
- Show status message with explanation
- Optionally show contact information for support

**Example:**
```json
{
  "code": "VET_NOT_APPROVED",
  "message": "Your profile is pending approval. You will receive an email once approved."
}
```

---

### VET_REJECTED

**HTTP Status:** `403`  
**Message:** "Your application has been rejected."  
**When Returned:** Vet's profile has been rejected by admin  
**Frontend Action:**
- Redirect to `/account/rejected` page
- Show rejection reason if available
- Provide contact information for appeal or reapplication

**Example:**
```json
{
  "code": "VET_REJECTED",
  "message": "Your application has been rejected."
}
```

---

### VET_SUSPENDED

**HTTP Status:** `403`  
**Message:** "Your account has been suspended."  
**When Returned:** Vet's account has been suspended by admin  
**Frontend Action:**
- Redirect to `/account/suspended` page
- Show suspension reason if available
- Provide contact information for appeal

**Example:**
```json
{
  "code": "VET_SUSPENDED",
  "message": "Your account has been suspended."
}
```

---

### VET_NOT_FOUND

**HTTP Status:** `404`  
**Message:** "No vet found with this email address"  
**When Returned:** Attempting to invite a vet that doesn't exist  
**Frontend Action:**
- Show error message in invitation form
- Suggest checking the email address
- Optionally show "Invite by email" option

---

### MASTER_ADMIN_REQUIRED

**HTTP Status:** `403`  
**Message:** "This action requires Master Admin privileges"  
**When Returned:** User attempts admin-only action without proper role  
**Frontend Action:**
- Show error message
- Do not show admin-only UI elements to non-admins

---

## Vet Profile Errors

These errors don't typically occur in normal operation but are included for completeness.

---

## Organization Errors

### ORG_NOT_FOUND

**HTTP Status:** `404`  
**Message:** "Organization not found"  
**When Returned:** Attempting to access non-existent organization  
**Frontend Action:**
- Redirect to `/organizations` page
- Show "Organization not found" message
- Refresh organization list

**Example:**
```json
{
  "code": "ORG_NOT_FOUND",
  "message": "Organization not found"
}
```

---

### NOT_ORG_MEMBER

**HTTP Status:** `403`  
**Message:** "You are not a member of this organization"  
**When Returned:** Attempting to access organization user doesn't belong to  
**Frontend Action:**
- Redirect to `/organizations`
- Show "Access denied" message
- Clear org context from local storage

**Example:**
```json
{
  "code": "NOT_ORG_MEMBER",
  "message": "You are not a member of this organization"
}
```

---

### SLUG_CONFLICT

**HTTP Status:** `409`  
**Message:** "Organization slug conflict. Please try again."  
**When Returned:** Very rare - generated slug already exists  
**Frontend Action:**
- Retry the request automatically (slug has random suffix)
- If persistent, show error and ask user to retry

---

### ORG_NOT_PENDING

**HTTP Status:** `400`  
**Message:** "Organization is not pending approval"  
**When Returned:** Admin tries to approve/reject org that's not in pending state  
**Frontend Action:**
- Refresh organization status
- Show current status
- Remove approval/rejection buttons

**Example:**
```json
{
  "code": "ORG_NOT_PENDING",
  "message": "Organization is not pending approval",
  "details": {
    "currentStatus": "APPROVED"
  }
}
```

---

### ORG_ALREADY_SUSPENDED

**HTTP Status:** `400`  
**Message:** "Organization is already suspended"  
**When Returned:** Admin tries to suspend already-suspended org  
**Frontend Action:**
- Refresh organization status
- Update UI to show "Suspended" state

---

### ORG_NOT_SUSPENDED

**HTTP Status:** `400`  
**Message:** "Organization is not suspended"  
**When Returned:** Admin tries to reactivate non-suspended org  
**Frontend Action:**
- Refresh organization status
- Update UI accordingly

---

### NO_ORG_MEMBERSHIP

**HTTP Status:** `403`  
**Message:** "Organization membership required"  
**When Returned:** User attempts action requiring org membership  
**Frontend Action:**
- Redirect to `/organizations`
- Show "Access denied" message

---

## Client Errors

### CLIENT_NOT_FOUND

**HTTP Status:** `404`  
**Message:** "Client not found"  
**When Returned:** Attempting to access non-existent or deleted client  
**Frontend Action:**
- Redirect to `/dashboard/clients`
- Show "Client not found" message
- Refresh client list

---

### CLIENT_DELETED

**HTTP Status:** `400`  
**Message:** "Cannot update a deleted client. Restore it first."  
**When Returned:** Attempting to update a soft-deleted client  
**Frontend Action:**
- Show "This client has been deleted" message
- Offer "Restore" button if user has permission
- Show deletion date and reason

---

### ALREADY_DELETED

**HTTP Status:** `400`  
**Message:** "Client is already deleted" (or Animal/Treatment variant)  
**When Returned:** Attempting to delete already-deleted resource  
**Frontend Action:**
- Show "Already deleted" message
- Refresh resource status

---

### NOT_DELETED

**HTTP Status:** `400`  
**Message:** "Client is not deleted" (or Animal/Treatment variant)  
**When Returned:** Attempting to restore non-deleted resource  
**Frontend Action:**
- Refresh resource status
- Update UI to show current state

---

## Animal Errors

### ANIMAL_NOT_FOUND

**HTTP Status:** `404`  
**Message:** "Animal not found or deleted"  
**When Returned:** Attempting to access non-existent or deleted animal  
**Frontend Action:**
- Redirect to `/dashboard/animals`
- Show "Animal not found" message
- Refresh animal list

---

### BATCH_FIELDS_REQUIRED

**HTTP Status:** `400`  
**Message:** "Batch name and batch size are required for batch livestock"  
**When Returned:** Creating batch livestock without required batch fields  
**Frontend Action:**
- Highlight missing fields in form
- Show inline validation error
- Don't allow submission until fields are filled

---

### MICROCHIP_EXISTS

**HTTP Status:** `409`  
**Message:** "This microchip number is already registered"  
**When Returned:** Attempting to register duplicate microchip number  
**Frontend Action:**
- Highlight microchip field
- Show error message
- Suggest checking the number or removing it

---

### ANIMAL_DELETED

**HTTP Status:** `400`  
**Message:** "Cannot update a deleted animal. Restore it first."  
**When Returned:** Attempting to update soft-deleted animal  
**Frontend Action:**
- Show "This animal has been deleted" message
- Offer "Restore" button if user has permission

---

### PARENT_DELETED

**HTTP Status:** `400`  
**Message:** "Cannot delete animal: parent client is deleted"  
**When Returned:** Attempting to delete animal when parent client is deleted  
**Frontend Action:**
- Show error message
- Explain that parent client must be restored first
- Offer link to parent client

---

### ALREADY_DECEASED

**HTTP Status:** `400`  
**Message:** "Animal is already marked as deceased"  
**When Returned:** Attempting to record death for already-deceased animal  
**Frontend Action:**
- Refresh animal status
- Show current deceased status

---

## Treatment Errors

### TREATMENT_NOT_FOUND

**HTTP Status:** `404`  
**Message:** "Treatment record not found"  
**When Returned:** Attempting to access non-existent treatment  
**Frontend Action:**
- Redirect to treatments list
- Show "Treatment not found" message

---

### TREATMENT_DELETED

**HTTP Status:** `400`  
**Message:** "Cannot update a deleted treatment. Restore it first."  
**When Returned:** Attempting to update soft-deleted treatment  
**Frontend Action:**
- Show "This treatment has been deleted" message
- Offer "Restore" button if user has permission

---

## Membership & Invitation Errors

### ALREADY_MEMBER

**HTTP Status:** `409`  
**Message:** "This vet is already a member of the organization"  
**When Returned:** Inviting vet who is already a member  
**Frontend Action:**
- Show error in invitation form
- Refresh member list

---

### INVITATION_PENDING

**HTTP Status:** `409`  
**Message:** "An invitation is already pending for this email"  
**When Returned:** Sending duplicate invitation  
**Frontend Action:**
- Show "Invitation already sent" message
- Show pending invitation with option to resend/cancel

---

### INVITATION_NOT_FOUND

**HTTP Status:** `404`  
**Message:** "Invitation not found"  
**When Returned:** Attempting to access non-existent invitation  
**Frontend Action:**
- Redirect to invitations list
- Show "Invitation not found or expired"

---

### INVITATION_NOT_PENDING

**HTTP Status:** `400`  
**Message:** "This invitation has already been responded to"  
**When Returned:** Accepting/declining already-responded invitation  
**Frontend Action:**
- Refresh invitation status
- Show current status (accepted/declined/expired)

---

### INVITATION_EXPIRED

**HTTP Status:** `400`  
**Message:** "This invitation has expired"  
**When Returned:** Accepting expired invitation  
**Frontend Action:**
- Show "Invitation expired" message
- Suggest contacting the organization for a new invitation

---

### EMAIL_MISMATCH

**HTTP Status:** `403`  
**Message:** "This invitation is for a different email address"  
**When Returned:** User attempts to accept invitation sent to different email  
**Frontend Action:**
- Show error message
- Explain invitation is for different account
- Suggest logging in with correct account

---

### MEMBERSHIP_NOT_FOUND

**HTTP Status:** `404`  
**Message:** "Membership not found" or "You are not a member of this organization"  
**When Returned:** Attempting to access non-existent membership  
**Frontend Action:**
- Redirect to appropriate page
- Show error message

---

### CANNOT_REMOVE_OWNER

**HTTP Status:** `403`  
**Message:** "Cannot remove the organization owner"  
**When Returned:** Attempting to remove owner membership  
**Frontend Action:**
- Disable "Remove" button for owner
- Show tooltip explaining owner cannot be removed

---

### CANNOT_CHANGE_OWNER_ROLE

**HTTP Status:** `403`  
**Message:** "Cannot change the role of the organization owner"  
**When Returned:** Attempting to change owner's role  
**Frontend Action:**
- Disable role dropdown for owner
- Show tooltip explaining owner role is permanent

---

### CANNOT_ASSIGN_OWNER

**HTTP Status:** `403`  
**Message:** "Cannot assign OWNER role to members"  
**When Returned:** Attempting to assign OWNER role  
**Frontend Action:**
- Remove "OWNER" option from role dropdown
- Only show ADMIN and MEMBER options

---

### CANNOT_CHANGE_OWNER_PERMISSIONS

**HTTP Status:** `403`  
**Message:** "Owner always has all permissions"  
**When Returned:** Attempting to modify owner permissions  
**Frontend Action:**
- Disable permission checkboxes for owner
- Show tooltip explaining owner has all permissions

---

### OWNER_CANNOT_LEAVE

**HTTP Status:** `403`  
**Message:** "Organization owner cannot leave. Transfer ownership first."  
**When Returned:** Owner attempting to leave organization  
**Frontend Action:**
- Disable "Leave" button for owner
- Show message explaining ownership transfer required
- Link to ownership transfer documentation

---

### MEMBERSHIP_NOT_ACTIVE

**HTTP Status:** `400`  
**Message:** "Membership is not active"  
**When Returned:** Operating on removed/inactive membership  
**Frontend Action:**
- Refresh membership status
- Update UI accordingly

---

## Permission & Access Control Errors

### DELETE_PERMISSION_DENIED

**HTTP Status:** `403`  
**Message:** "You do not have permission to perform this delete operation"  
**When Returned:** User attempts delete without proper permission  
**Frontend Action:**
- Hide delete buttons for users without permission
- Show error if somehow triggered

---

### ACTIVITY_LOG_ACCESS_DENIED

**HTTP Status:** `403`  
**Message:** "You do not have permission to view activity logs"  
**When Returned:** User attempts to view activity log without permission  
**Frontend Action:**
- Hide activity log link/tab for users without permission
- Show error if accessed directly

---

## Frontend Error Handling Guide

### Global Error Interceptor

Implement a global error interceptor in your API client:

```typescript
// Example using Axios
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorCode = error.response?.data?.error?.code;
    
    switch (errorCode) {
      case 'UNAUTHENTICATED':
        // Clear session and redirect to login
        localStorage.removeItem('token');
        router.push('/login');
        break;
        
      case 'VET_NOT_APPROVED':
        router.push('/onboarding/pending');
        break;
        
      case 'VET_REJECTED':
        router.push('/account/rejected');
        break;
        
      case 'VET_SUSPENDED':
        router.push('/account/suspended');
        break;
        
      case 'NOT_ORG_MEMBER':
        localStorage.removeItem('currentOrgId');
        router.push('/organizations');
        toast.error('You do not have access to this organization');
        break;
        
      default:
        // Show generic error message
        const message = error.response?.data?.error?.message || 'An error occurred';
        toast.error(message);
    }
    
    return Promise.reject(error);
  }
);
```

### Component-Level Error Handling

For specific operations, handle errors at component level:

```typescript
// Example: Creating a client
const createClient = useMutation({
  mutationFn: (data) => api.post('/orgs/:orgId/clients', data),
  onError: (error) => {
    const errorCode = error.response?.data?.error?.code;
    
    switch (errorCode) {
      case 'PARENT_DELETED':
        toast.error('Cannot create client: parent organization is deleted');
        break;
      default:
        toast.error('Failed to create client');
    }
  }
});
```

### UI State Management

Hide/disable UI elements based on user permissions and account status:

```typescript
// Example: Check permissions before showing delete button
const canDelete = currentMembership?.permissions?.canDeleteClients;

{canDelete && (
  <Button onClick={handleDelete}>Delete</Button>
)}
```

### Error Messages

Use user-friendly error messages in the UI:

| Error Code | User-Facing Message |
|------------|---------------------|
| `VET_NOT_APPROVED` | "Your account is pending approval. We'll email you once it's ready!" |
| `VET_REJECTED` | "Your application was not approved. Contact support for more information." |
| `VET_SUSPENDED` | "Your account has been suspended. Please contact support." |
| `NOT_ORG_MEMBER` | "You don't have access to this organization." |
| `CLIENT_NOT_FOUND` | "This client could not be found." |
| `ANIMAL_NOT_FOUND` | "This animal could not be found." |
| `TREATMENT_NOT_FOUND` | "This treatment record could not be found." |
| `MICROCHIP_EXISTS` | "This microchip number is already registered to another animal." |
| `DELETE_PERMISSION_DENIED` | "You don't have permission to delete this item." |

---

## Support & Debugging

### For Developers

When debugging errors:

1. Check the `code` field first for programmatic handling
2. Log the full error response for context
3. Check the `details` field for additional information
4. Verify the HTTP status code matches expected behavior

### For Support Teams

When users report errors:

1. Ask for the error code (e.g., "VET_SUSPENDED")
2. Check audit logs for the specific action
3. Verify user's account status and permissions
4. Check organization status if org-related error

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Feb 9, 2026 | Initial error code catalog |

---

## Related Documentation

- [Backend API Changes](./BACKEND_API_CHANGES.md)
- [API-Frontend Mapping](../frontend/API_FRONTEND_MAPPING.md)
- [Authentication Flow](../backend/AUTH.md)
