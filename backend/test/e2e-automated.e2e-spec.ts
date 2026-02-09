import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('E2E Tests - Complete Application', () => {
  jest.setTimeout(60000); // DB connection + full flow can be slow on real Supabase

  let app: INestApplication;
  let prisma: PrismaService;
  
  // Test data storage
  let masterAdminToken: string;
  let vet1Token: string;
  let vet2Token: string;
  let vet1Id: string;
  let vet2Id: string;
  let orgId: string;
  let clientId: string;
  let animalId: string;
  let treatmentId: string;
  let invitationToken: string;
  let membershipId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api/v1');
    await app.init();
    prisma = app.get(PrismaService);
    
    // Clean database before tests
    await cleanDatabase();
    
    // Setup test users
    await setupTestData();
  }, 55000);

  afterAll(async () => {
    await cleanDatabase();
    await app.close();
  });

  async function cleanDatabase() {
    await prisma.activityLog.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.treatmentRecord.deleteMany();
    await prisma.animal.deleteMany();
    await prisma.client.deleteMany();
    await prisma.invitation.deleteMany();
    await prisma.orgMembership.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.vet.deleteMany();
  }

  async function setupTestData() {
    // Create Master Admin
    const masterAdmin = await prisma.vet.create({
      data: {
        authUserId: 'auth-master-admin',
        email: 'admin@vetplatform.com',
        fullName: 'Master Admin',
        status: 'APPROVED',
        isMasterAdmin: true,
        profileCompleted: true,
      },
    });

    // Create test vets
    const vet1 = await prisma.vet.create({
      data: {
        authUserId: 'auth-vet-1',
        email: 'vet1@example.com',
        fullName: 'Dr. Jane Smith',
        vcnNumber: 'VCN001',
        status: 'APPROVED',
        profileCompleted: true,
      },
    });

    const vet2 = await prisma.vet.create({
      data: {
        authUserId: 'auth-vet-2',
        email: 'vet2@example.com',
        fullName: 'Dr. John Doe',
        vcnNumber: 'VCN002',
        status: 'APPROVED',
        profileCompleted: true,
      },
    });

    vet1Id = vet1.id;
    vet2Id = vet2.id;

    // Generate real JWTs signed with SUPABASE_JWT_SECRET so auth works against real DB
    const jwtService = app.get(JwtService);
    masterAdminToken = await jwtService.signAsync({
      sub: 'auth-master-admin',
      email: 'admin@vetplatform.com',
    });
    vet1Token = await jwtService.signAsync({
      sub: 'auth-vet-1',
      email: 'vet1@example.com',
    });
    vet2Token = await jwtService.signAsync({
      sub: 'auth-vet-2',
      email: 'vet2@example.com',
    });
  }

  describe('1. Health & Public Endpoints', () => {
    it('GET /health should return ok', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          const body = res.body?.data ?? res.body;
          expect(body.status).toBe('ok');
          expect(body.service).toBe('vet-reg-backend');
        });
    });

    it('GET / should return welcome message', () => {
      return request(app.getHttpServer())
        .get('/api/v1')
        .expect(200);
    });
  });

  describe('2. Vet Profile & Approval Workflow', () => {
    it('Should require authentication for profile', () => {
      return request(app.getHttpServer())
        .get('/api/v1/vets/profile')
        .expect(401);
    });

    it('Should get vet profile', () => {
      return request(app.getHttpServer())
        .get('/api/v1/vets/profile')
        .set('Authorization', `Bearer ${vet1Token}`)
        .expect(200);
    });

    it('Should get approval status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/vets/approval-status')
        .set('Authorization', `Bearer ${vet1Token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('APPROVED');
        });
    });
  });

  describe('3. Organization Management', () => {
    it('Should create organization', () => {
      return request(app.getHttpServer())
        .post('/api/v1/orgs')
        .set('Authorization', `Bearer ${vet1Token}`)
        .send({
          name: 'Lagos Veterinary Clinic',
          address: '123 Pet Care Street',
          city: 'Lagos',
          state: 'Lagos',
          phoneNumber: '+2348012345678',
          type: 'CLINIC',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toBe('Lagos Veterinary Clinic');
          orgId = res.body.data.id;
        });
    });

    it('Should list user organizations', () => {
      return request(app.getHttpServer())
        .get('/api/v1/orgs')
        .set('Authorization', `Bearer ${vet1Token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('Should get organization details', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(orgId);
        });
    });

    it('Should block non-member access', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}`)
        .set('Authorization', `Bearer ${vet2Token}`)
        .expect(403);
    });
  });

  describe('4. Membership & Invitations', () => {
    it('Should invite vet to organization', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/orgs/${orgId}/invitations`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .send({
          invitedEmail: 'vet2@example.com',
          role: 'MEMBER',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          invitationToken = res.body.data.token;
        });
    });

    it('Should accept invitation', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/invitations/${invitationToken}/accept`)
        .set('Authorization', `Bearer ${vet2Token}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          membershipId = res.body.data.membership.id;
        });
    });

    it('Should list organization members', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/members`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBe(2); // OWNER + MEMBER
        });
    });

    it('OWNER should update member permissions', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/orgs/${orgId}/members/${membershipId}/permissions`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .send({
          canDeleteClients: false,
          canDeleteAnimals: false,
          canViewActivityLog: false,
        })
        .expect(200);
    });

    it('MEMBER should NOT update permissions', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/orgs/${orgId}/members/${membershipId}/permissions`)
        .set('Authorization', `Bearer ${vet2Token}`)
        .send({
          canDeleteClients: false,
        })
        .expect(403);
    });
  });

  describe('5. Client Management', () => {
    it('Should create client', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/orgs/${orgId}/clients`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phoneNumber: '+2348011112222',
          address: '456 Owner Street',
          city: 'Lagos',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          clientId = res.body.data.id;
        });
    });

    it('Should list clients with pagination', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/clients?page=1&limit=10`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.clients).toBeDefined();
          expect(res.body.data.pagination).toBeDefined();
        });
    });

    it('Should search clients', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/clients?search=John`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.clients.length).toBeGreaterThan(0);
        });
    });

    it('Should update client', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/orgs/${orgId}/clients/${clientId}`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .send({
          notes: 'Updated client notes',
        })
        .expect(200);
    });
  });

  describe('6. Animal Management', () => {
    it('Should register animal', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/orgs/${orgId}/animals`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .send({
          clientId,
          name: 'Max',
          species: 'DOG',
          breed: 'Golden Retriever',
          gender: 'MALE',
          dateOfBirth: '2020-05-15',
          weight: 30.5,
          weightUnit: 'KG',
          microchipNumber: 'MC123456789',
        })
        .expect(201)
        .expect((res) => {
          animalId = res.body.data.id;
        });
    });

    it('Should enforce microchip uniqueness', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/orgs/${orgId}/animals`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .send({
          clientId,
          name: 'Another Dog',
          species: 'DOG',
          microchipNumber: 'MC123456789', // Duplicate
        })
        .expect(409);
    });

    it('Should list client animals', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/clients/${clientId}/animals`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .expect(200);
    });

    it('Should record animal death', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/orgs/${orgId}/animals/${animalId}/death`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .send({
          dateOfDeath: '2026-02-07',
          causeOfDeath: 'Natural causes',
        })
        .expect(200);
    });
  });

  describe('7. Treatment Records with Versioning', () => {
    beforeAll(async () => {
      if (animalId) {
        await prisma.animal.update({
          where: { id: animalId },
          data: { isAlive: true },
        });
      }
    });

    it('Should create treatment record', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/orgs/${orgId}/treatments`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .send({
          animalId,
          visitDate: '2026-02-08',
          chiefComplaint: 'Vomiting and lethargy',
          diagnosis: 'Gastroenteritis',
          treatmentGiven: 'Fluid therapy and antibiotics',
          status: 'COMPLETED',
        })
        .expect(201)
        .expect((res) => {
          treatmentId = res.body.data.id;
          expect(res.body.data.version).toBe(1);
        });
    });

    it('Should update treatment (create new version)', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/orgs/${orgId}/treatments/${treatmentId}`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .send({
          followUpNotes: 'Patient improved',
          status: 'FOLLOW_UP_REQUIRED',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.version).toBe(2);
        });
    });

    it('Should get treatment version history', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments/${treatmentId}/versions`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeGreaterThan(1);
        });
    });

    it('Should list animal treatment history', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/animals/${animalId}/treatments`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .expect(200);
    });
  });

  describe('8. Soft Delete & Cascade', () => {
    it('MEMBER without delete permission should get 403', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/orgs/${orgId}/animals/${animalId}`)
        .set('Authorization', `Bearer ${vet2Token}`)
        .send({ reason: 'Test' })
        .expect(403);
    });

    it('Should require deletion reason', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/orgs/${orgId}/animals/${animalId}`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .send({}) // No reason
        .expect(400);
    });

    it('Should soft delete animal', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/orgs/${orgId}/animals/${animalId}`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .send({
          reason: 'Test deletion for e2e testing',
        })
        .expect(200);
    });

    it('Should include deleted in filtered list', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/animals?includeDeleted=true`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .expect(200)
        .expect((res) => {
          const deletedAnimal = res.body.data.animals.find(
            (a) => a.id === animalId,
          );
          expect(deletedAnimal.isDeleted).toBe(true);
        });
    });

    it('Should restore deleted animal', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/orgs/${orgId}/animals/${animalId}/restore`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .expect(201);
    });

    it('Should cascade delete client', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/orgs/${orgId}/clients/${clientId}`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .send({
          reason: 'Test cascade delete',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.cascadedAnimals).toBeGreaterThan(0);
        });
    });
  });

  describe('9. Activity Log', () => {
    it('OWNER should access activity log', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/activity-log`)
        .set('Authorization', `Bearer ${vet1Token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.logs).toBeDefined();
          expect(res.body.data.logs.length).toBeGreaterThan(0);
        });
    });

    it('MEMBER without permission should NOT access', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/activity-log`)
        .set('Authorization', `Bearer ${vet2Token}`)
        .expect(403);
    });
  });

  describe('10. Master Admin Operations', () => {
    it('Should get pending approvals', () => {
      return request(app.getHttpServer())
        .get('/api/v1/vets/pending-approvals')
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .expect(200);
    });

    it('Non-admin should NOT access', () => {
      return request(app.getHttpServer())
        .get('/api/v1/vets/pending-approvals')
        .set('Authorization', `Bearer ${vet1Token}`)
        .expect(403);
    });
  });
});
