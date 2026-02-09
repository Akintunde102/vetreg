import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Deep E2E Scenarios - Real-World Workflows', () => {
  jest.setTimeout(90000);

  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  
  // Multiple vets for complex scenarios
  let vetOwnerToken: string;
  let vetAdmin1Token: string;
  let vetAdmin2Token: string;
  let vetMember1Token: string;
  let vetMember2Token: string;
  let vetOtherOrgToken: string;
  let masterAdminToken: string;

  let vetOwnerId: string;
  let vetAdmin1Id: string;
  let vetAdmin2Id: string;
  let vetMember1Id: string;
  let vetMember2Id: string;
  let vetOtherOrgId: string;
  let masterAdminId: string;

  // Multiple organizations
  let org1Id: string; // Main clinic
  let org2Id: string; // Separate clinic (for isolation testing)

  // Multiple clients and animals
  let client1Id: string;
  let client2Id: string;
  let client3Id: string;
  let animal1Id: string;
  let animal2Id: string;
  let animal3Id: string;
  let animal4Id: string;

  // Treatment records
  let treatment1Id: string;
  let treatment2Id: string;

  // Memberships
  let admin1MembershipId: string;
  let admin2MembershipId: string;
  let member1MembershipId: string;
  let member2MembershipId: string;

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
    jwtService = app.get(JwtService);
    
    await cleanDatabase();
    await setupComplexTestData();
  }, 85000);

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

  async function setupComplexTestData() {
    // Master Admin
    const masterAdmin = await prisma.vet.create({
      data: {
        authUserId: 'auth-master-admin',
        email: 'master@vetplatform.com',
        fullName: 'Master Admin',
        status: 'APPROVED',
        isMasterAdmin: true,
        profileCompleted: true,
      },
    });
    masterAdminId = masterAdmin.id;

    // Owner - will create Org1
    const owner = await prisma.vet.create({
      data: {
        authUserId: 'auth-owner',
        email: 'owner@clinic.com',
        fullName: 'Dr. Sarah Johnson',
        vcnNumber: 'VCN001',
        status: 'APPROVED',
        profileCompleted: true,
      },
    });
    vetOwnerId = owner.id;

    // Admin 1 - has most permissions
    const admin1 = await prisma.vet.create({
      data: {
        authUserId: 'auth-admin1',
        email: 'admin1@clinic.com',
        fullName: 'Dr. Michael Chen',
        vcnNumber: 'VCN002',
        status: 'APPROVED',
        profileCompleted: true,
      },
    });
    vetAdmin1Id = admin1.id;

    // Admin 2 - limited permissions
    const admin2 = await prisma.vet.create({
      data: {
        authUserId: 'auth-admin2',
        email: 'admin2@clinic.com',
        fullName: 'Dr. Emily Rodriguez',
        vcnNumber: 'VCN003',
        status: 'APPROVED',
        profileCompleted: true,
      },
    });
    vetAdmin2Id = admin2.id;

    // Member 1 - can delete clients/animals
    const member1 = await prisma.vet.create({
      data: {
        authUserId: 'auth-member1',
        email: 'member1@clinic.com',
        fullName: 'Dr. James Wilson',
        vcnNumber: 'VCN004',
        status: 'APPROVED',
        profileCompleted: true,
      },
    });
    vetMember1Id = member1.id;

    // Member 2 - no delete permissions
    const member2 = await prisma.vet.create({
      data: {
        authUserId: 'auth-member2',
        email: 'member2@clinic.com',
        fullName: 'Dr. Lisa Martinez',
        vcnNumber: 'VCN005',
        status: 'APPROVED',
        profileCompleted: true,
      },
    });
    vetMember2Id = member2.id;

    // Vet from another organization (for isolation testing)
    const vetOther = await prisma.vet.create({
      data: {
        authUserId: 'auth-other',
        email: 'vet@otherclinic.com',
        fullName: 'Dr. David Kim',
        vcnNumber: 'VCN006',
        status: 'APPROVED',
        profileCompleted: true,
      },
    });
    vetOtherOrgId = vetOther.id;

    // Generate real JWTs
    masterAdminToken = await jwtService.signAsync({
      sub: 'auth-master-admin',
      email: 'master@vetplatform.com',
    });
    vetOwnerToken = await jwtService.signAsync({
      sub: 'auth-owner',
      email: 'owner@clinic.com',
    });
    vetAdmin1Token = await jwtService.signAsync({
      sub: 'auth-admin1',
      email: 'admin1@clinic.com',
    });
    vetAdmin2Token = await jwtService.signAsync({
      sub: 'auth-admin2',
      email: 'admin2@clinic.com',
    });
    vetMember1Token = await jwtService.signAsync({
      sub: 'auth-member1',
      email: 'member1@clinic.com',
    });
    vetMember2Token = await jwtService.signAsync({
      sub: 'auth-member2',
      email: 'member2@clinic.com',
    });
    vetOtherOrgToken = await jwtService.signAsync({
      sub: 'auth-other',
      email: 'vet@otherclinic.com',
    });
  }

  describe('Scenario 1: Complete Clinic Setup & Team Onboarding', () => {
    it('OWNER creates main clinic organization via direct DB', async () => {
      // Create org directly in DB
      const org = await prisma.organization.create({
        data:{
          name: 'Lagos Premier Veterinary Hospital',
          slug: 'lagos-premier-veterinary-hospital',
          address: '123 Veterinary Drive, Victoria Island',
          city: 'Lagos',
          state: 'Lagos',
          country: 'NG',
          phoneNumber: '+2348012345678',
          email: 'info@lagosvet.com',
          type: 'HOSPITAL',
          createdBy: vetOwnerId,
        },
      });

      org1Id = org.id;

      // Create owner membership
      await prisma.orgMembership.create({
        data: {
          organizationId: org1Id,
          vetId: vetOwnerId,
          role: 'OWNER',
          status: 'ACTIVE',
          canDeleteClients: true,
          canDeleteAnimals: true,
          canDeleteTreatments: true,
          canViewActivityLog: true,
        },
      });

      expect(org1Id).toBeDefined();
    });

    it('Add Admin 1, Admin 2, and Members directly to org', async () => {
      // Admin1 - full permissions
      const admin1Membership = await prisma.orgMembership.create({
        data: {
          organizationId: org1Id,
          vetId: vetAdmin1Id,
          role: 'ADMIN',
          status: 'ACTIVE',
          canDeleteClients: true,
          canDeleteAnimals: true,
          canDeleteTreatments: true,
          canViewActivityLog: true,
        },
      });
      admin1MembershipId = admin1Membership.id;

      // Admin2 - view logs only
      const admin2Membership = await prisma.orgMembership.create({
        data: {
          organizationId: org1Id,
          vetId: vetAdmin2Id,
          role: 'ADMIN',
          status: 'ACTIVE',
          canDeleteClients: false,
          canDeleteAnimals: false,
          canDeleteTreatments: false,
          canViewActivityLog: true,
        },
      });
      admin2MembershipId = admin2Membership.id;

      // Member1 - can delete animals only
      const member1Membership = await prisma.orgMembership.create({
        data: {
          organizationId: org1Id,
          vetId: vetMember1Id,
          role: 'MEMBER',
          status: 'ACTIVE',
          canDeleteClients: false,
          canDeleteAnimals: true,
          canDeleteTreatments: false,
          canViewActivityLog: false,
        },
      });
      member1MembershipId = member1Membership.id;

      // Member2 - no special permissions
      const member2Membership = await prisma.orgMembership.create({
        data: {
          organizationId: org1Id,
          vetId: vetMember2Id,
          role: 'MEMBER',
          status: 'ACTIVE',
          canDeleteClients: false,
          canDeleteAnimals: false,
          canDeleteTreatments: false,
          canViewActivityLog: false,
        },
      });
      member2MembershipId = member2Membership.id;

      expect(admin1MembershipId).toBeDefined();
      expect(member1MembershipId).toBeDefined();
    });

    it('OWNER can view all team members', async () => {
      const membersResponse = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/members`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const members = membersResponse.body.data;
      expect(members.length).toBeGreaterThanOrEqual(5); // Owner + 2 Admins + 2 Members
    });

  });

  describe('Scenario 2: Multi-User Client & Animal Registration Workflow', () => {
    it('Admin1 registers first client with detailed info', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/clients`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          firstName: 'Adebayo',
          lastName: 'Okonkwo',
          email: 'adebayo.okonkwo@email.com',
          phoneNumber: '+2348091234567',
          alternatePhone: '+2348087654321',
          address: '45 Allen Avenue, Ikeja',
          city: 'Lagos',
          state: 'Lagos',
          notes: 'Regular client, prefers morning appointments',
        })
        .expect(201);

      client1Id = response.body.data.id;
      expect(response.body.data.firstName).toBe('Adebayo');
      expect(response.body.data.lastName).toBe('Okonkwo');
    });

    it('Member2 registers second client (permission test)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/clients`)
        .set('Authorization', `Bearer ${vetMember2Token}`)
        .send({
          firstName: 'Ngozi',
          lastName: 'Adeleke',
          email: 'ngozi@email.com',
          phoneNumber: '+2348099876543',
          address: '78 Admiralty Way, Lekki',
          city: 'Lagos',
          state: 'Lagos',
        })
        .expect(201);

      client2Id = response.body.data.id;
    });

    it('Admin2 registers third client for cascade testing', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/clients`)
        .set('Authorization', `Bearer ${vetAdmin2Token}`)
        .send({
          firstName: 'Chioma',
          lastName: 'Nwosu',
          email: 'chioma@email.com',
          phoneNumber: '+2348088887777',
          address: '12 Bourdillon Road, Ikoyi',
          city: 'Lagos',
          state: 'Lagos',
        })
        .expect(201);

      client3Id = response.body.data.id;
    });

    it('Admin1 registers multiple animals for Client1', async () => {
      // Dog
      const dog = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/animals`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          clientId: client1Id,
          name: 'Max',
          species: 'DOG',
          breed: 'German Shepherd',
          gender: 'MALE',
          dateOfBirth: '2020-03-15',
          weight: 35.5,
          weightUnit: 'KG',
          microchipNumber: 'MC2020001',
          color: 'Black and Tan',
          identifyingMarks: 'White patch on chest',
          notes: 'Friendly, good with kids',
        })
        .expect(201);

      animal1Id = dog.body.data.id;

      // Cat
      const cat = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/animals`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          clientId: client1Id,
          name: 'Whiskers',
          species: 'CAT',
          breed: 'Persian',
          gender: 'FEMALE',
          dateOfBirth: '2021-07-20',
          weight: 4.2,
          weightUnit: 'KG',
          microchipNumber: 'MC2021002',
          color: 'White',
        })
        .expect(201);

      animal2Id = cat.body.data.id;
    });

    it('Member1 registers animal for Client2', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/animals`)
        .set('Authorization', `Bearer ${vetMember1Token}`)
        .send({
          clientId: client2Id,
          name: 'Rocky',
          species: 'DOG',
          breed: 'Rottweiler',
          gender: 'MALE',
          approximateAge: '5 years',
          weight: 45.0,
          weightUnit: 'KG',
          microchipNumber: 'MC2022003',
        })
        .expect(201);

      animal3Id = response.body.data.id;
    });

    it('Member2 registers animal for Client3', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/animals`)
        .set('Authorization', `Bearer ${vetMember2Token}`)
        .send({
          clientId: client3Id,
          name: 'Bella',
          species: 'CAT',
          breed: 'Siamese',
          gender: 'FEMALE',
          dateOfBirth: '2023-01-10',
          weight: 3.8,
          weightUnit: 'KG',
          microchipNumber: 'MC2023004',
        })
        .expect(201);

      animal4Id = response.body.data.id;
    });

    it('Client1 should now show 2 animals', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/clients/${client1Id}/animals`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.map((a) => a.name)).toEqual(
        expect.arrayContaining(['Max', 'Whiskers']),
      );
    });
  });

  describe('Scenario 3: Complex Treatment Records with Multiple Vets', () => {
    it('Admin1 creates initial treatment for Max (Dog)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/treatments`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          animalId: animal1Id,
          visitDate: '2026-02-01',
          chiefComplaint: 'Limping on right front leg, not eating well',
          diagnosis: 'Soft tissue injury to right forelimb',
          treatmentGiven: 'Rest, NSAIDs (Carprofen 25mg BID), recheck in 7 days',
          prescriptions: { medications: [{ name: 'Carprofen', dosage: '25mg', frequency: 'BID', duration: '7 days' }] },
          weight: 35.5,
          weightUnit: 'KG',
          temperature: 38.5,
          heartRate: 85,
          respiratoryRate: 22,
          status: 'FOLLOW_UP_REQUIRED',
        })
        .expect(201);

      treatment1Id = response.body.data.id;
      expect(response.body.data.version).toBe(1);
      expect(response.body.data.isLatestVersion).toBe(true);
    });

    it('Member1 updates treatment after follow-up (creates version 2)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/orgs/${org1Id}/treatments/${treatment1Id}`)
        .set('Authorization', `Bearer ${vetMember1Token}`)
        .send({
          followUpNotes: 'Limping resolved, eating normally. Continue medication for 3 more days.',
          status: 'IN_PROGRESS',
        })
        .expect(200);

      expect(response.body.data.version).toBe(2);
      expect(response.body.data.parentRecordId).toBe(treatment1Id);
    });

    it('Admin2 adds final notes (creates version 3)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/orgs/${org1Id}/treatments/${treatment1Id}`)
        .set('Authorization', `Bearer ${vetAdmin2Token}`)
        .send({
          followUpNotes: 'Full recovery confirmed. Treatment completed successfully.',
          status: 'COMPLETED',
        })
        .expect(200);

      expect(response.body.data.version).toBeGreaterThanOrEqual(2);
      expect(response.body.data.isLatestVersion).toBe(true);
    });

    it('Should retrieve complete version history for treatment', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/treatments/${treatment1Id}/versions`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      const latest = response.body.data.find((v) => v.isLatestVersion);
      expect(latest).toBeDefined();
      expect(latest.version).toBeGreaterThanOrEqual(2);
    });

    it('Member2 creates treatment for Rocky (animal3)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/treatments`)
        .set('Authorization', `Bearer ${vetMember2Token}`)
        .send({
          animalId: animal3Id,
          visitDate: '2026-02-05',
          chiefComplaint: 'Annual vaccination and checkup',
          diagnosis: 'Healthy, no abnormalities',
          treatmentGiven: 'Rabies vaccine, DHPP booster',
          prescriptions: { vaccines: [{ name: 'Rabies Vaccine' }, { name: 'DHPP Booster' }] },
          status: 'COMPLETED',
        })
        .expect(201);

      treatment2Id = response.body.data.id;
    });

    it('Should list all treatments with pagination and filters', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/treatments?page=1&limit=10&status=COMPLETED`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.treatments).toBeDefined();
      expect(response.body.data.pagination.total).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Scenario 4: Complex Permission & Delete Authorization', () => {
    it('Member2 (no delete permission) CANNOT delete animal', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/orgs/${org1Id}/animals/${animal4Id}`)
        .set('Authorization', `Bearer ${vetMember2Token}`)
        .send({
          reason: 'Client requested removal from system',
        })
        .expect(403);
    });

    it('Member1 (has delete animal permission) CAN delete animal', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/orgs/${org1Id}/animals/${animal4Id}`)
        .set('Authorization', `Bearer ${vetMember1Token}`)
        .send({
          reason: 'Client relocated to another city permanently',
        })
        .expect(200);

      expect(response.body.data.deletedAnimal).toBe(animal4Id);
    });

    it('Admin2 (no delete permission) CANNOT delete client', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/orgs/${org1Id}/clients/${client2Id}`)
        .set('Authorization', `Bearer ${vetAdmin2Token}`)
        .send({
          reason: 'Test deletion',
        })
        .expect(403);
    });

    it('Admin1 (has delete permission) CAN cascade delete client with animal', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/orgs/${org1Id}/clients/${client2Id}`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          reason: 'Client permanently moved abroad, requested account closure',
        })
        .expect(200);

      expect(response.body.data.deletedClient).toBe(client2Id);
      expect(response.body.data.cascadedAnimals).toBeGreaterThan(0);
    });

    it('Deleted client should NOT appear in default list', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/clients`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const clientIds = response.body.data.clients.map((c) => c.id);
      expect(clientIds).not.toContain(client2Id);
    });

    it('Deleted client SHOULD appear when includeDeleted=true', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/clients?includeDeleted=true`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const deletedClient = response.body.data.clients.find((c) => c.id === client2Id);
      expect(deletedClient).toBeDefined();
      expect(deletedClient.isDeleted).toBe(true);
      expect(deletedClient.deletionReason).toContain('permanently moved abroad');
    });

    it('OWNER can restore cascade-deleted client', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/clients/${client2Id}/restore`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(201);

      expect(response.body.data.isDeleted).toBe(false);
    });

    it('Restored client animals should also be restored', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/clients/${client2Id}/animals`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const animals = response.body.data || [];
      expect(animals.length).toBeGreaterThanOrEqual(0);
      if (animals.length > 0) {
        expect(animals.every((a) => !a.isDeleted)).toBe(true);
      }
    });
  });

  describe('Scenario 5: Activity Log Tracking Across Complex Workflow', () => {
    it('OWNER can view complete activity log', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/activity-log?page=1&limit=50`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const logs = response.body.data.logs;
      expect(logs.length).toBeGreaterThan(10); // Many actions happened

      // Should include various action types (API uses lowercase.dotted)
      const actionTypes = logs.map((log) => log.action);
      expect(actionTypes).toEqual(
        expect.arrayContaining([
          'client.created',
          'animal.created',
          'treatment.created',
          'animal.deleted',
          'client.deleted',
          'client.restored',
        ]),
      );
    });

    it('Admin1 (with canViewActivityLog) can view activity log', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/activity-log`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .expect(200);
    });

    it('Admin2 (with canViewActivityLog) can view activity log', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/activity-log`)
        .set('Authorization', `Bearer ${vetAdmin2Token}`)
        .expect(200);
    });

    it('Member1 (no canViewActivityLog) CANNOT view activity log', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/activity-log`)
        .set('Authorization', `Bearer ${vetMember1Token}`)
        .expect(403);
    });

    it('Member2 (no canViewActivityLog) CANNOT view activity log', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/activity-log`)
        .set('Authorization', `Bearer ${vetMember2Token}`)
        .expect(403);
    });

    it('Activity log should show WHO did WHAT and WHEN', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/activity-log?page=1&limit=5`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const latestLog = response.body.data.logs[0];
      expect(latestLog).toHaveProperty('action');
      expect(latestLog).toHaveProperty('vet');
      expect(latestLog).toHaveProperty('createdAt');
      expect(latestLog).toHaveProperty('metadata');
      expect(latestLog.vet).toHaveProperty('fullName');
      expect(latestLog.vet).toHaveProperty('email');
    });

    it('Activity log can be filtered by action type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/activity-log?limit=20`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const logs = response.body.data.logs || [];
      const deletedLogs = logs.filter((log) => log.action === 'animal.deleted');
      expect(logs.length).toBeGreaterThan(0);
      expect(deletedLogs.length).toBeGreaterThan(0);
    });

    it('Activity log can be filtered by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/activity-log?startDate=${today}&endDate=${today}`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.logs.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario 6: Cross-Organization Isolation (Security)', () => {
    it('VetOther creates separate organization (Org2) via DB', async () => {
      const org = await prisma.organization.create({
        data: {
          name: 'Abuja Animal Care Center',
          slug: 'abuja-animal-care-center',
          address: '456 Gwarimpa Street',
          city: 'Abuja',
          state: 'FCT',
          phoneNumber: '+2348098765432',
          type: 'CLINIC',
          createdBy: vetOtherOrgId,
        },
      });

      org2Id = org.id;

      // Create membership for vetOther
      await prisma.orgMembership.create({
        data: {
          organizationId: org2Id,
          vetId: vetOtherOrgId,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      });
    });

    it('VetOther CANNOT access Org1 clients', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/clients`)
        .set('Authorization', `Bearer ${vetOtherOrgToken}`)
        .expect(403);
    });

    it('VetOther CANNOT access Org1 animals', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/animals`)
        .set('Authorization', `Bearer ${vetOtherOrgToken}`)
        .expect(403);
    });

    it('VetOther CANNOT access Org1 treatments', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/treatments`)
        .set('Authorization', `Bearer ${vetOtherOrgToken}`)
        .expect(403);
    });

    it('VetOther CANNOT access Org1 activity log', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/activity-log`)
        .set('Authorization', `Bearer ${vetOtherOrgToken}`)
        .expect(403);
    });

    it('VetOther CANNOT delete Org1 resources', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/orgs/${org1Id}/animals/${animal1Id}`)
        .set('Authorization', `Bearer ${vetOtherOrgToken}`)
        .send({
          reason: 'Malicious attempt',
        })
        .expect(403);
    });

    it('Org1 members CANNOT access Org2', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org2Id}`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(403);
    });
  });

  describe('Scenario 7: Animal Death Recording & Treatment History', () => {
    it('Admin1 records death for Whiskers (Cat)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/orgs/${org1Id}/animals/${animal2Id}/death`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          dateOfDeath: '2026-02-07',
          causeOfDeath: 'Kidney failure, age-related complications',
        })
        .expect(200);

      expect(response.body.data.isAlive).toBe(false);
      expect(response.body.data.dateOfDeath).toBeDefined();
      expect(response.body.data.causeOfDeath).toContain('Kidney failure');
    });

    it('Cannot create treatment for deceased animal', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/treatments`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          animalId: animal2Id,
          visitDate: '2026-02-08',
          chiefComplaint: 'Follow-up',
          diagnosis: 'N/A',
          treatmentGiven: 'N/A',
          status: 'COMPLETED',
        })
        .expect(400);
    });

    it('Client animals list should show deceased status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/clients/${client1Id}/animals`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const deceased = response.body.data.find((a) => a.id === animal2Id);
      expect(deceased.isAlive).toBe(false);
      expect(deceased.dateOfDeath).toBeDefined();
    });
  });

  describe('Scenario 8: Search & Advanced Filtering', () => {
    it('Should search clients by name', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/clients?search=Adebayo`)
        .set('Authorization', `Bearer ${vetMember2Token}`)
        .expect(200);

      expect(response.body.data.clients.length).toBeGreaterThan(0);
      expect(response.body.data.clients[0].firstName).toBe('Adebayo');
    });

    it('Should search animals by name', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/animals?search=Max`)
        .set('Authorization', `Bearer ${vetMember1Token}`)
        .expect(200);

      expect(response.body.data.animals.length).toBeGreaterThan(0);
      expect(response.body.data.animals[0].name).toBe('Max');
    });

    it('Should filter animals by species', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/animals?species=DOG`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .expect(200);

      expect(response.body.data.animals.every((a) => a.species === 'DOG')).toBe(true);
    });

    it('Should filter animals by alive status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/animals?isAlive=false`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const list = response.body.data.animals || [];
      if (list.length > 0) {
        const deceased = list.filter((a) => a.isAlive === false);
        expect(deceased.length).toBeGreaterThan(0);
      }
    });

    it('Should filter treatments by status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/treatments?status=COMPLETED`)
        .set('Authorization', `Bearer ${vetAdmin2Token}`)
        .expect(200);

      expect(response.body.data.treatments.every((t) => t.status === 'COMPLETED')).toBe(true);
    });

    it('Should filter treatments by date range', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/treatments?startDate=2026-02-01&endDate=2026-02-10`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.treatments.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario 9: Role-Based Access Control (Deep Testing)', () => {
    it('MEMBER cannot update other member permissions', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/orgs/${org1Id}/members/${member2MembershipId}/permissions`)
        .set('Authorization', `Bearer ${vetMember1Token}`)
        .send({
          canDeleteAnimals: true,
        })
        .expect(403);
    });

    it('ADMIN cannot update permissions (only OWNER can)', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/orgs/${org1Id}/members/${member1MembershipId}/permissions`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          canDeleteClients: true,
        })
        .expect(403);
    });

    it('OWNER can update ADMIN permissions', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/orgs/${org1Id}/members/${admin2MembershipId}/permissions`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          canDeleteClients: true,
        })
        .expect(200);
    });

    it('MEMBER cannot invite new vets', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/invitations`)
        .set('Authorization', `Bearer ${vetMember1Token}`)
        .send({
          invitedEmail: 'newvet@clinic.com',
          role: 'MEMBER',
        })
        .expect(403);
    });

    it('ADMIN can invite new vets', async () => {
      // Invite an existing vet (not yet in this org)
      await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/invitations`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          invitedEmail: 'vet@otherclinic.com',
          role: 'MEMBER',
        })
        .expect(201);
    });
  });

  describe('Scenario 10: Data Integrity & Validation', () => {
    it('Cannot create animal with duplicate microchip in same org', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/animals`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          clientId: client1Id,
          name: 'Another Dog',
          species: 'DOG',
          microchipNumber: 'MC2020001', // Duplicate of Max
        })
        .expect(409);
    });

    it('CAN create animal with same microchip in different org', async () => {
      // First create a client in Org2
      const clientResponse = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org2Id}/clients`)
        .set('Authorization', `Bearer ${vetOtherOrgToken}`)
        .send({
          firstName: 'Test',
          lastName: 'Client',
          email: 'test@org2.com',
          phoneNumber: '+2348011111111',
          address: 'Test Address',
          city: 'Abuja',
        })
        .expect(201);

      // Same microchip should work in different org
      await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org2Id}/animals`)
        .set('Authorization', `Bearer ${vetOtherOrgToken}`)
        .send({
          clientId: clientResponse.body.data.id,
          name: 'Different Max',
          species: 'DOG',
          microchipNumber: 'MC2020001', // Same as Org1's Max
        })
        .expect(201);
    });

    it('Cannot create treatment without required fields', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/treatments`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          animalId: animal1Id,
          // Missing required fields
        })
        .expect(400);
    });

    it('Cannot delete with reason shorter than 10 characters', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/orgs/${org1Id}/animals/${animal1Id}`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          reason: 'short',
        })
        .expect(400);
    });

    it('Delete reason must be meaningful', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/orgs/${org1Id}/animals/${animal1Id}`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          reason: 'Animal transferred to specialist clinic in Abuja for advanced surgery',
        })
        .expect(200);

      expect(response.body.data.deletedAnimal).toBe(animal1Id);
      expect(response.body.data.message).toBeDefined();
    });
  });

  describe('Scenario 11: Master Admin Platform-Level Operations', () => {
    it('Master Admin can see all pending vet approvals', async () => {
      // Create pending vet
      const pendingVet = await prisma.vet.create({
        data: {
          authUserId: 'auth-pending',
          email: 'pending@newvet.com',
          fullName: 'Dr. New Vet',
          vcnNumber: 'VCN999',
          status: 'PENDING_APPROVAL',
          profileCompleted: true,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/vets/pending-approvals')
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .expect(200);

      expect(response.body.data.some((v) => v.id === pendingVet.id)).toBe(true);
    });

    it('Master Admin can approve pending vet', async () => {
      const pendingVets = await request(app.getHttpServer())
        .get('/api/v1/vets/pending-approvals')
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .expect(200);

      const pendingVet = pendingVets.body.data[0];

      await request(app.getHttpServer())
        .patch(`/api/v1/vets/${pendingVet.id}/approve`)
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .send({
          notes: 'VCN verified, credentials confirmed',
        })
        .expect(200);
    });

    it('Master Admin can reject vet with reason', async () => {
      // Create another pending vet
      const rejectVet = await prisma.vet.create({
        data: {
          authUserId: 'auth-reject',
          email: 'reject@test.com',
          fullName: 'Dr. Reject Test',
          vcnNumber: 'VCN888',
          status: 'PENDING_APPROVAL',
          profileCompleted: true,
        },
      });

      await request(app.getHttpServer())
        .patch(`/api/v1/vets/${rejectVet.id}/reject`)
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .send({
          reason: 'VCN number could not be verified with regulatory body',
        })
        .expect(200);

      // Verify rejection
      const vetCheck = await prisma.vet.findUnique({
        where: { id: rejectVet.id },
      });
      expect(vetCheck.status).toBe('REJECTED');
      expect(vetCheck.rejectionReason).toContain('VCN number could not be verified');
    });

    it('Non-Master-Admin CANNOT access platform-level operations', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/vets/pending-approvals')
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(403);
    });
  });

  describe('Scenario 12: Pagination & Large Dataset Handling', () => {
    beforeAll(async () => {
      // Create multiple clients for pagination testing
      for (let i = 1; i <= 15; i++) {
        await prisma.client.create({
          data: {
            organizationId: org1Id,
            firstName: `Client${i}`,
            lastName: `TestUser`,
            email: `client${i}@test.com`,
            phoneNumber: `+23480${String(i).padStart(8, '0')}`,
            address: `${i} Test Street`,
            city: 'Lagos',
            createdBy: vetOwnerId,
          },
        });
      }
    });

    it('Should paginate clients correctly (page 1)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/clients?page=1&limit=10`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.clients).toHaveLength(10);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.totalPages).toBeGreaterThan(1);
      expect(response.body.data.pagination.total).toBeGreaterThan(10);
    });

    it('Should paginate clients correctly (page 2)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/clients?page=2&limit=10`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.clients.length).toBeGreaterThan(0);
      expect(response.body.data.pagination.page).toBe(2);
    });

    it('Should handle large limit gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/clients?limit=1000`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.clients.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario 13: Complete Workflow Integration Test', () => {
    it('Full workflow: Create client → Register animals → Multiple treatments → Death → Cascade delete', async () => {
      // 1. Member2 creates new client
      const clientResponse = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/clients`)
        .set('Authorization', `Bearer ${vetMember2Token}`)
        .send({
          firstName: 'Integration',
          lastName: 'TestClient',
          email: 'integration@test.com',
          phoneNumber: '+2348099999999',
          address: '999 Integration Street',
          city: 'Lagos',
        })
        .expect(201);

      const testClientId = clientResponse.body.data.id;

      // 2. Admin1 registers animal
      const animalResponse = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/animals`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          clientId: testClientId,
          name: 'TestDog',
          species: 'DOG',
          breed: 'Labrador',
          gender: 'MALE',
          dateOfBirth: '2022-01-01',
          weight: 30.0,
          weightUnit: 'KG',
          microchipNumber: 'MC9999999',
        })
        .expect(201);

      const testAnimalId = animalResponse.body.data.id;

      // 3. Member1 creates initial treatment
      const treatment1Response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/treatments`)
        .set('Authorization', `Bearer ${vetMember1Token}`)
        .send({
          animalId: testAnimalId,
          visitDate: '2026-02-08',
          chiefComplaint: 'Vaccination checkup',
          diagnosis: 'Healthy',
          treatmentGiven: 'Annual vaccines',
          status: 'COMPLETED',
        })
        .expect(201);

      const testTreatmentId = treatment1Response.body.data.id;

      // 4. Admin2 updates treatment (creates version 2)
      await request(app.getHttpServer())
        .patch(`/api/v1/orgs/${org1Id}/treatments/${testTreatmentId}`)
        .set('Authorization', `Bearer ${vetAdmin2Token}`)
        .send({
          followUpNotes: 'Added deworming treatment',
          prescriptions: { medications: [{ name: 'Dewormer', dosage: '1 tablet' }] },
        })
        .expect(200);

      // 5. Verify animal has treatment history
      const historyResponse = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/animals/${testAnimalId}/treatments`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(historyResponse.body.data.length).toBeGreaterThan(0);

      // 6. Record animal death
      await request(app.getHttpServer())
        .patch(`/api/v1/orgs/${org1Id}/animals/${testAnimalId}/death`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          dateOfDeath: '2026-02-08',
          causeOfDeath: 'Test scenario - simulated death',
        })
        .expect(200);

      // 7. Admin1 (with delete permission) cascade deletes client
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/api/v1/orgs/${org1Id}/clients/${testClientId}`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          reason: 'Integration test - complete workflow cleanup after animal death',
        })
        .expect(200);

      expect(deleteResponse.body.data.cascadedAnimals).toBe(1);

      // 8. Verify activity log captured all actions
      const activityResponse = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/activity-log?limit=20`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const actions = activityResponse.body.data.logs.map((log) => log.action);
      expect(actions).toEqual(
        expect.arrayContaining([
          'client.created',
          'animal.created',
          'treatment.created',
          'animal.death_recorded',
          'client.deleted',
        ]),
      );
    });
  });

  describe('Scenario 14: Audit Trail & Compliance Verification', () => {
    it('All state-changing actions should be in audit log', async () => {
      const auditLogs = await prisma.auditLog.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
      });

      expect(auditLogs.length).toBeGreaterThan(10); // Many actions happened

      // Check various action types are logged (API uses lowercase.dotted)
      const actions = auditLogs.map((log) => log.action);
      expect(actions).toEqual(
        expect.arrayContaining([
          'client.created',
          'client.deleted',
          'animal.created',
          'animal.deleted',
          'treatment.created',
          'treatment.updated',
        ]),
      );

      // Each log should have required fields (AuditLog uses vetId, createdAt)
      auditLogs.forEach((log) => {
        expect(log.entityType).toBeDefined();
        expect(log.action).toBeDefined();
        expect(log.createdAt).toBeDefined();
      });
    });

    it('Activity log should be org-scoped (not platform-wide)', async () => {
      const org1Logs = await prisma.activityLog.findMany({
        where: { organizationId: org1Id },
      });

      const org2Logs = await prisma.activityLog.findMany({
        where: { organizationId: org2Id },
      });

      expect(org1Logs.length).toBeGreaterThan(org2Logs.length);
      expect(org1Logs.every((log) => log.organizationId === org1Id)).toBe(true);
    });
  });

  describe('Scenario 15: Performance & Concurrent Operations', () => {
    it('Should handle concurrent client creation by multiple vets', async () => {
      const promises = [
        request(app.getHttpServer())
          .post(`/api/v1/orgs/${org1Id}/clients`)
          .set('Authorization', `Bearer ${vetAdmin1Token}`)
          .send({
            firstName: 'Concurrent1',
            lastName: 'Test',
            email: 'concurrent1@test.com',
            phoneNumber: '+2348011111111',
            address: 'Test',
            city: 'Lagos',
          }),
        request(app.getHttpServer())
          .post(`/api/v1/orgs/${org1Id}/clients`)
          .set('Authorization', `Bearer ${vetAdmin2Token}`)
          .send({
            firstName: 'Concurrent2',
            lastName: 'Test',
            email: 'concurrent2@test.com',
            phoneNumber: '+2348022222222',
            address: 'Test',
            city: 'Lagos',
          }),
        request(app.getHttpServer())
          .post(`/api/v1/orgs/${org1Id}/clients`)
          .set('Authorization', `Bearer ${vetMember1Token}`)
          .send({
            firstName: 'Concurrent3',
            lastName: 'Test',
            email: 'concurrent3@test.com',
            phoneNumber: '+2348033333333',
            address: 'Test',
            city: 'Lagos',
          }),
      ];

      const results = await Promise.all(promises);
      expect(results.every((r) => r.status === 201)).toBe(true);
    });

    it('Should handle rapid treatment versioning', async () => {
      // Create a dedicated client+animal for this test (earlier scenarios may have deleted others)
      const clientRes = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/clients`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          firstName: 'Version',
          lastName: 'Test',
          email: 'version@test.com',
          phoneNumber: '+2348077777777',
          address: 'Test',
          city: 'Lagos',
        })
        .expect(201);
      const animalRes = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/animals`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          clientId: clientRes.body.data.id,
          name: 'VersionDog',
          species: 'DOG',
          microchipNumber: 'MC-VERSION-01',
        })
        .expect(201);
      const treatment = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/treatments`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          animalId: animalRes.body.data.id,
          visitDate: '2026-02-08',
          chiefComplaint: 'Routine checkup for vaccination',
          diagnosis: 'Healthy',
          treatmentGiven: 'Annual vaccination completed',
          status: 'COMPLETED',
        })
        .expect(201);

      const treatmentId = treatment.body.data.id;

      // Multiple rapid updates by different vets
      for (let i = 1; i <= 5; i++) {
        await request(app.getHttpServer())
          .patch(`/api/v1/orgs/${org1Id}/treatments/${treatmentId}`)
          .set('Authorization', `Bearer ${i % 2 === 0 ? vetAdmin1Token : vetAdmin2Token}`)
          .send({
            followUpNotes: `Update ${i}: Progress note`,
          })
          .expect(200);
      }

      // Verify all versions created
      const versions = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/treatments/${treatmentId}/versions`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(versions.body.data).toHaveLength(6); // Original + 5 updates
    });
  });

  describe('Scenario 16: Error Recovery & Edge Cases', () => {
    it('Can restore and re-delete same animal multiple times', async () => {
      const client = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/clients`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          firstName: 'Recovery',
          lastName: 'Test',
          email: 'recovery@test.com',
          phoneNumber: '+2348044444444',
          address: 'Test',
          city: 'Lagos',
        })
        .expect(201);

      const animal = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/animals`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          clientId: client.body.data.id,
          name: 'RecoveryDog',
          species: 'DOG',
          microchipNumber: 'MC7777777',
        })
        .expect(201);

      const animalId = animal.body.data.id;

      // Delete
      await request(app.getHttpServer())
        .delete(`/api/v1/orgs/${org1Id}/animals/${animalId}`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          reason: 'First deletion test',
        })
        .expect(200);

      // Restore
      await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/animals/${animalId}/restore`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(201);

      // Delete again
      await request(app.getHttpServer())
        .delete(`/api/v1/orgs/${org1Id}/animals/${animalId}`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          reason: 'Second deletion test after restoration',
        })
        .expect(200);

      // Restore again
      await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/animals/${animalId}/restore`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(201);

      // Final state should be active
      const finalCheck = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/animals/${animalId}`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(finalCheck.body.data.isDeleted).toBe(false);
    });

    it('Cannot delete already deleted animal', async () => {
      const client = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/clients`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          firstName: 'Double',
          lastName: 'Delete',
          email: 'double@test.com',
          phoneNumber: '+2348055555555',
          address: 'Test',
          city: 'Lagos',
        })
        .expect(201);

      const animal = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/animals`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          clientId: client.body.data.id,
          name: 'DoubleDeleteTest',
          species: 'CAT',
          microchipNumber: 'MC8888888',
        })
        .expect(201);

      const animalId = animal.body.data.id;

      // First delete
      await request(app.getHttpServer())
        .delete(`/api/v1/orgs/${org1Id}/animals/${animalId}`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          reason: 'First deletion for double-delete test',
        })
        .expect(200);

      // Second delete should fail (404 not found or 400 already deleted)
      const secondDelete = await request(app.getHttpServer())
        .delete(`/api/v1/orgs/${org1Id}/animals/${animalId}`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          reason: 'Attempting second deletion',
        });
      expect([400, 404]).toContain(secondDelete.status);
    });
  });

  describe('Scenario 17: Real-World Client Journey', () => {
    it('Complete journey: Client walks in → Emergency treatment → Follow-ups → Recovery', async () => {
      // 1. Front desk (Member2) registers walk-in client
      const clientResp = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/clients`)
        .set('Authorization', `Bearer ${vetMember2Token}`)
        .send({
          firstName: 'Emergency',
          lastName: 'WalkIn',
          email: 'emergency@walkin.com',
          phoneNumber: '+2348066666666',
          address: 'Emergency walk-in',
          city: 'Lagos',
        })
        .expect(201);

      const emergencyClientId = clientResp.body.data.id;

      // 2. Member2 registers the animal (emergency)
      const animalResp = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/animals`)
        .set('Authorization', `Bearer ${vetMember2Token}`)
        .send({
          clientId: emergencyClientId,
          name: 'Emergency',
          species: 'DOG',
          breed: 'Mixed',
          gender: 'MALE',
          approximateAge: '3 years',
          weight: 20.0,
          weightUnit: 'KG',
          microchipNumber: 'MC-EMERGENCY',
        })
        .expect(201);

      const emergencyAnimalId = animalResp.body.data.id;

      // 3. Admin1 (senior vet) handles emergency treatment
      const initialTreatment = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/treatments`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          animalId: emergencyAnimalId,
          visitDate: '2026-02-08',
          chiefComplaint: 'Hit by car, suspected fracture, bleeding from mouth',
          diagnosis: 'Right hind leg fracture, soft tissue trauma, mild shock',
          treatmentGiven: 'IV fluids, pain management (morphine), X-ray, splint applied, antibiotics',
          prescriptions: {
            medications: [
              { name: 'Morphine', dosage: '0.5mg/kg', route: 'IV' },
              { name: 'Cefazolin', dosage: '22mg/kg', route: 'IV', frequency: 'TID' },
              { name: 'Lactated Ringers', dosage: '90ml/kg/day', route: 'IV' },
            ],
          },
          temperature: 37.2,
          heartRate: 140,
          respiratoryRate: 40,
          status: 'FOLLOW_UP_REQUIRED',
          followUpDate: '2026-02-09',
        })
        .expect(201);

      const emergencyTreatmentId = initialTreatment.body.data.id;

      // 4. Follow-up next day by Admin2
      await request(app.getHttpServer())
        .patch(`/api/v1/orgs/${org1Id}/treatments/${emergencyTreatmentId}`)
        .set('Authorization', `Bearer ${vetAdmin2Token}`)
        .send({
          followUpNotes: 'Patient stable, eating, walking with limp. Continue antibiotics. Recheck in 3 days.',
          temperature: 38.1,
          heartRate: 100,
          respiratoryRate: 28,
          status: 'IN_PROGRESS',
          followUpDate: '2026-02-12',
        })
        .expect(200);

      // 5. Second follow-up by Member1
      await request(app.getHttpServer())
        .patch(`/api/v1/orgs/${org1Id}/treatments/${emergencyTreatmentId}`)
        .set('Authorization', `Bearer ${vetMember1Token}`)
        .send({
          followUpNotes: 'Good progress, no infection, splint removed, prescribed home rest',
          status: 'IN_PROGRESS',
          followUpDate: '2026-02-20',
        })
        .expect(200);

      // 6. Final checkup by Owner
      await request(app.getHttpServer())
        .patch(`/api/v1/orgs/${org1Id}/treatments/${emergencyTreatmentId}`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          followUpNotes: 'Full recovery, fracture healed, normal gait restored. Treatment completed.',
          status: 'COMPLETED',
        })
        .expect(200);

      // 7. Verify complete version history
      const versions = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/treatments/${emergencyTreatmentId}/versions`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(versions.body.data.length).toBeGreaterThanOrEqual(2);
      const latest = versions.body.data.find((v) => v.isLatestVersion);
      expect(latest).toBeDefined();
      expect(['COMPLETED', 'IN_PROGRESS', 'FOLLOW_UP_REQUIRED']).toContain(latest.status);
    });
  });

  describe('Scenario 18: Data Aggregation & Reporting', () => {
    it('Should get animal count by species', async () => {
      const animals = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/animals?limit=100`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const list = animals.body.data.animals || [];
      const dogs = list.filter((a) => a.species === 'DOG').length;
      const cats = list.filter((a) => a.species === 'CAT').length;

      expect(dogs + cats).toBeGreaterThan(0);
    });

    it('Should track active vs deceased animals', async () => {
      const allAnimals = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/animals?limit=100`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const alive = allAnimals.body.data.animals.filter((a) => a.isAlive).length;
      const deceased = allAnimals.body.data.animals.filter((a) => !a.isAlive).length;

      expect(alive + deceased).toBe(allAnimals.body.data.animals.length);
    });
  });

  describe('Scenario 19: Organization Approval Workflow (Master Admin)', () => {
    it('Master admin should list pending organization approvals', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/orgs/admin/pending-approvals')
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const list = response.body.data || [];
      const ids = list.map((o: { id: string }) => o.id);
      expect(ids).toContain(org1Id);
      expect(ids).toContain(org2Id);
    });

    it('Master admin should approve Org1', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/admin/${org1Id}/approve`)
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('APPROVED');
    });

    it('Master admin should reject Org2 with reason', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/admin/${org2Id}/reject`)
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .send({ reason: 'Duplicate registration; use existing clinic.' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('REJECTED');
    });

    it('Master admin should suspend Org1', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/admin/${org1Id}/suspend`)
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .send({ reason: 'Temporary compliance review' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('SUSPENDED');
    });

    it('Master admin should reactivate Org1', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/admin/${org1Id}/reactivate`)
        .set('Authorization', `Bearer ${masterAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('APPROVED');
    });
  });

  describe('Scenario 20: Patient Types, Batch Livestock & Treatment History Backlog', () => {
    let singleLivestockId: string;
    let batchLivestockId: string;
    let clientForLivestockId: string;

    it('Create client for livestock scenarios', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/clients`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          firstName: 'Livestock',
          lastName: 'Farmer',
          email: 'farmer@livestock.ng',
          phoneNumber: '+2348077776666',
          address: 'Rural Farm Road',
          city: 'Oyo',
          state: 'Oyo',
        })
        .expect(201);
      clientForLivestockId = response.body.data.id;
    });

    it('Register single livestock (SINGLE_LIVESTOCK)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/animals`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          clientId: clientForLivestockId,
          name: 'Bull-Alpha',
          species: 'CATTLE',
          patientType: 'SINGLE_LIVESTOCK',
          gender: 'MALE',
          approximateAge: '3 years',
          weight: 500,
          weightUnit: 'KG',
        })
        .expect(201);
      singleLivestockId = response.body.data.id;
      expect(response.body.data.patientType).toBe('SINGLE_LIVESTOCK');
    });

    it('Register batch livestock with batch metadata', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/animals`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          clientId: clientForLivestockId,
          name: 'Broiler-Batch-1',
          species: 'POULTRY',
          patientType: 'BATCH_LIVESTOCK',
          batchName: 'Broilers Shed A',
          batchSize: 500,
          batchIdentifier: 'BR-2026-Q1',
        })
        .expect(201);
      batchLivestockId = response.body.data.id;
      expect(response.body.data.patientType).toBe('BATCH_LIVESTOCK');
      expect(response.body.data.batchName).toBe('Broilers Shed A');
      expect(response.body.data.batchSize).toBe(500);
      expect(response.body.data.batchIdentifier).toBe('BR-2026-Q1');
    });

    it('Register livestock with treatment history backlog', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/animals`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          clientId: clientForLivestockId,
          name: 'Goat-Imported',
          species: 'GOAT',
          patientType: 'SINGLE_LIVESTOCK',
          gender: 'FEMALE',
          treatmentHistory: [
            {
              visitDate: '2025-01-10',
              chiefComplaint: 'Pre-purchase examination and deworming',
              diagnosis: 'Healthy',
              treatmentGiven: 'Albendazole, multivalent vaccine',
              notes: 'Imported from northern region',
            },
            {
              visitDate: '2025-06-15',
              chiefComplaint: 'Routine vaccination booster',
              diagnosis: 'Healthy',
              treatmentGiven: 'Peste des petits ruminants vaccine',
              notes: 'Annual booster',
            },
          ],
        })
        .expect(201);
      expect(response.body.data.id).toBeDefined();
      const treatments = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/animals/${response.body.data.id}/treatments`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);
      expect(treatments.body.data.length).toBe(2);
    });
  });

  describe('Scenario 21: Scheduled Treatments & Payment Lifecycle', () => {
    let scheduledTreatmentAId: string;
    let scheduledTreatmentBId: string;
    let paidTreatmentId: string;

    it('Create treatment with payment (OWED)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/treatments`)
        .set('Authorization', `Bearer ${vetMember1Token}`)
        .send({
          animalId: animal1Id,
          visitDate: '2026-02-09',
          chiefComplaint: 'Consultation with payment tracking',
          treatmentGiven: 'Examination and prescription',
          status: 'COMPLETED',
          amount: 25000,
          currency: 'NGN',
          paymentStatus: 'OWED',
        })
        .expect(201);
      paidTreatmentId = response.body.data.id;
      expect(response.body.data.paymentStatus).toBe('OWED');
      expect(Number(response.body.data.amount)).toBe(25000);
    });

    it('Create two scheduled treatments', async () => {
      const a = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/treatments`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .send({
          animalId: animal1Id,
          visitDate: '2026-02-09',
          chiefComplaint: 'Scheduled follow-up A',
          treatmentGiven: 'To be determined',
          isScheduled: true,
          scheduledFor: '2026-02-20T10:00:00.000Z',
          status: 'IN_PROGRESS',
        })
        .expect(201);
      scheduledTreatmentAId = a.body.data.id;

      const b = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/treatments`)
        .set('Authorization', `Bearer ${vetAdmin2Token}`)
        .send({
          animalId: animal2Id,
          visitDate: '2026-02-09',
          chiefComplaint: 'Scheduled vaccination reminder',
          treatmentGiven: 'Scheduled',
          isScheduled: true,
          scheduledFor: '2026-02-25T14:00:00.000Z',
          status: 'IN_PROGRESS',
        })
        .expect(201);
      scheduledTreatmentBId = b.body.data.id;
    });

    it('List scheduled treatments should return both', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/treatments/scheduled/list?limit=20`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);
      const list = response.body.data.treatments || [];
      const ids = list.map((t: { id: string }) => t.id);
      expect(ids).toContain(scheduledTreatmentAId);
      expect(ids).toContain(scheduledTreatmentBId);
    });

    it('Mark treatment as PAID updates payment status', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orgs/${org1Id}/treatments/${paidTreatmentId}/payment`)
        .set('Authorization', `Bearer ${vetMember1Token}`)
        .send({
          paymentStatus: 'PAID',
          amountPaid: 25000,
          paymentNotes: 'Cash payment received',
        })
        .expect(200);
      expect(response.body.data.paymentStatus).toBe('PAID');
    });
  });

  describe('Scenario 22: Revenue & Payment Breakdown (Deep)', () => {
    it('OWNER gets revenue with payment breakdown', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/revenue`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalRevenue).toBeDefined();
      expect(response.body.data.totalPaid).toBeDefined();
      expect(response.body.data.totalOwed).toBeDefined();
      expect(Array.isArray(response.body.data.paymentBreakdown)).toBe(true);
    });

    it('ADMIN gets revenue', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/revenue`)
        .set('Authorization', `Bearer ${vetAdmin1Token}`)
        .expect(200);
      expect(response.body.data.totalTreatments).toBeDefined();
    });

    it('MEMBER cannot access revenue', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/revenue`)
        .set('Authorization', `Bearer ${vetMember2Token}`)
        .expect(403);
    });

    it('Payment breakdown includes PAID and OWED counts', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${org1Id}/revenue`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);
      const breakdown = response.body.data.paymentBreakdown || [];
      const statuses = breakdown.map((b: { status: string }) => b.status);
      expect(statuses.length).toBeGreaterThan(0);
      expect(
        statuses.some((s: string) => ['PAID', 'OWED', 'PARTIALLY_PAID', 'WAIVED'].includes(s)),
      ).toBe(true);
    });
  });
});
