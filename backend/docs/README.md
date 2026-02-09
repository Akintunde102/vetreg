# Backend Documentation

Welcome to the Veterinary Registration & Practice Management Platform backend documentation.

## Quick Links

- **[New Features (v1.1)](./NEW_FEATURES.md)** - Comprehensive guide to all new features
- **[Migration Guide](./MIGRATION_GUIDE.md)** - Step-by-step migration from v1.0 to v1.1
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY_V1.1.md)** - Technical implementation details
- **[Supabase Connection](./SUPABASE_CONNECTION.md)** - Database connection setup

## Version History

### Version 1.1.0 (February 9, 2026)
Major feature release including:
- Patient Types (Single Pet, Single Livestock, Batch Livestock)
- Organization Approval Workflow
- Treatment Payment Tracking
- Scheduled Treatments
- Treatment History Import
- Organization Revenue Tracking

### Version 1.0.0
Initial release with core functionality:
- Vet registration and approval
- Organization management
- Client management
- Animal records
- Treatment records
- Multi-organization support
- Role-based access control

## Documentation Structure

```
backend/docs/
├── README.md                           # This file
├── NEW_FEATURES.md                     # v1.1 features documentation
├── MIGRATION_GUIDE.md                  # Migration instructions
├── IMPLEMENTATION_SUMMARY_V1.1.md      # Technical implementation summary
└── SUPABASE_CONNECTION.md              # Database setup
```

## Getting Started

### For New Developers

1. Read the [Implementation Summary](./IMPLEMENTATION_SUMMARY_V1.1.md) for architecture overview
2. Review [New Features](./NEW_FEATURES.md) to understand capabilities
3. Set up database using [Supabase Connection](./SUPABASE_CONNECTION.md)
4. Run migrations as described in [Migration Guide](./MIGRATION_GUIDE.md)

### For Existing Team Members (Upgrading to v1.1)

1. Review [New Features](./NEW_FEATURES.md) to understand changes
2. Follow [Migration Guide](./MIGRATION_GUIDE.md) step-by-step
3. Test new endpoints using examples in documentation
4. Update frontend/client applications as needed

## API Documentation

### Core Endpoints

**Authentication & Vets:**
- `POST /auth/google` - Google OAuth login
- `GET /vets/profile` - Get vet profile
- `POST /vets/profile/complete` - Complete profile
- `GET /vets/approval-status` - Check approval status

**Organizations:**
- `POST /orgs` - Create organization
- `GET /orgs` - List user's organizations
- `GET /orgs/{orgId}` - Get organization details
- `PATCH /orgs/{orgId}` - Update organization
- `GET /orgs/{orgId}/members` - List members
- `GET /orgs/{orgId}/revenue` - Get revenue (v1.1)

**Organization Approval (Master Admin):**
- `GET /orgs/admin/pending-approvals` - List pending (v1.1)
- `POST /orgs/admin/{orgId}/approve` - Approve (v1.1)
- `POST /orgs/admin/{orgId}/reject` - Reject (v1.1)
- `POST /orgs/admin/{orgId}/suspend` - Suspend (v1.1)
- `POST /orgs/admin/{orgId}/reactivate` - Reactivate (v1.1)

**Clients:**
- `POST /orgs/{orgId}/clients` - Create client
- `GET /orgs/{orgId}/clients` - List clients
- `GET /orgs/{orgId}/clients/{clientId}` - Get client
- `PATCH /orgs/{orgId}/clients/{clientId}` - Update client
- `DELETE /orgs/{orgId}/clients/{clientId}` - Soft delete client

**Animals:**
- `POST /orgs/{orgId}/animals` - Create animal (supports batch, v1.1)
- `GET /orgs/{orgId}/animals` - List animals
- `GET /orgs/{orgId}/animals/{animalId}` - Get animal
- `PATCH /orgs/{orgId}/animals/{animalId}` - Update animal
- `DELETE /orgs/{orgId}/animals/{animalId}` - Soft delete animal
- `POST /orgs/{orgId}/animals/{animalId}/restore` - Restore animal

**Treatments:**
- `POST /orgs/{orgId}/treatments` - Create treatment (supports payment, v1.1)
- `GET /orgs/{orgId}/treatments` - List treatments
- `GET /orgs/{orgId}/treatments/scheduled/list` - List scheduled (v1.1)
- `GET /orgs/{orgId}/treatments/{treatmentId}` - Get treatment
- `PATCH /orgs/{orgId}/treatments/{treatmentId}` - Update treatment
- `DELETE /orgs/{orgId}/treatments/{treatmentId}` - Soft delete treatment
- `POST /orgs/{orgId}/treatments/{treatmentId}/payment` - Update payment (v1.1)

**Memberships:**
- `POST /orgs/{orgId}/invitations` - Invite member
- `POST /invitations/{token}/accept` - Accept invitation
- `POST /invitations/{token}/decline` - Decline invitation
- `PATCH /orgs/{orgId}/members/{membershipId}/role` - Update role
- `DELETE /orgs/{orgId}/members/{membershipId}` - Remove member

## Key Features

### Authentication & Authorization
- Google OAuth 2.0 integration
- JWT-based authentication
- Role-based access control (Owner, Admin, Member)
- Vet approval workflow by Master Admin
- Organization approval workflow (v1.1)

### Multi-Organization Support
- Vets can belong to multiple organizations
- Organization-scoped data access
- Flexible role and permission management
- Per-organization activity logs

### Patient Management
- Single pets and livestock (v1.1)
- Batch livestock management (v1.1)
- Treatment history import (v1.1)
- Soft delete with cascade
- Death recording
- Microchip tracking

### Treatment Records
- Comprehensive clinical data
- Immutable history with versioning
- Payment tracking (v1.1)
- Scheduled treatments (v1.1)
- File attachments support
- Follow-up management

### Financial Management (v1.1)
- Treatment payment tracking
- Multiple payment statuses (Paid, Owed, Partially Paid, Waived)
- Organization revenue tracking
- Payment breakdown by status
- Owner/Admin-only access

### Audit & Activity Logs
- Comprehensive audit trail
- Organization-specific activity logs
- Permission-based access
- Searchable and filterable

## Database Schema

### Core Models
- **Vet** - Veterinarian profiles with approval workflow
- **Organization** - Practice organizations with approval workflow (v1.1)
- **OrgMembership** - Organization memberships with roles
- **Client** - Client records
- **Animal** - Animal/patient records with patient types (v1.1)
- **TreatmentRecord** - Treatment records with payment tracking (v1.1)

### Supporting Models
- **Invitation** - Organization invitations
- **Notification** - System notifications
- **AuditLog** - System-wide audit trail
- **ActivityLog** - Organization activity logs

## Technology Stack

- **Runtime:** Node.js 20+
- **Framework:** NestJS 10
- **Language:** TypeScript 5
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma 7
- **Authentication:** Passport JWT + Google OAuth
- **Validation:** class-validator
- **Testing:** Jest

## Development Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run start:dev

# Run tests
npm run test
npm run test:e2e
```

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Security Best Practices

1. **Authentication:**
   - All endpoints protected by JWT guard (except auth endpoints)
   - Approval guard checks vet approval status
   - Master Admin guard for sensitive operations

2. **Authorization:**
   - Organization-scoped data access
   - Role-based permissions (Owner, Admin, Member)
   - Granular delete permissions

3. **Data Protection:**
   - Soft delete for important records
   - Audit logging for all critical actions
   - Activity logs per organization

4. **Validation:**
   - DTO validation on all inputs
   - Type safety with TypeScript
   - Database constraints in Prisma schema

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Manual Testing
See [NEW_FEATURES.md](./NEW_FEATURES.md) for API usage examples.

## Troubleshooting

### Common Issues

**Prisma Client Errors:**
```bash
# Regenerate Prisma client
npx prisma generate
```

**Migration Issues:**
```bash
# Check migration status
npx prisma migrate status

# Reset database (development only)
npx prisma migrate reset
```

**TypeScript Errors:**
```bash
# Clean build
rm -rf dist/
npm run build
```

### Support

For issues or questions:
1. Check documentation in this folder
2. Review error logs
3. Check Prisma schema for field details
4. Review audit logs for debugging
5. Contact development team

## Contributing

When adding new features:
1. Update Prisma schema if needed
2. Create/update DTOs with validation
3. Implement service methods with error handling
4. Add controller endpoints with guards
5. Add audit/activity logging
6. Update documentation
7. Add tests
8. Run linter and tests before committing

## Roadmap

### Planned Features (v1.2+)
- Payment gateway integration
- Automated notifications
- Advanced reporting and analytics
- Mobile app support
- Multi-language support
- SMS notifications
- Calendar integration
- Appointment scheduling UI
- Invoice generation
- Inventory management

## License

[Your License Here]

---

**Last Updated:** February 9, 2026  
**Current Version:** 1.1.0
