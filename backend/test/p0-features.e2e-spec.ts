import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('P0 Backend Features E2E Tests', () => {
  jest.setTimeout(60000);

  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Test users
  let vetOwnerToken: string;
  let vetAdminToken: string;
  let vetMemberToken: string;
  let vetOwnerId: string;
  let vetAdminId: string;
  let vetMemberId: string;

  // Test data
  let orgId: string;
  let clientId: string;
  let petAnimalId: string;
  let livestockAnimalId: string;
  let farmBatchAnimalId: string;
  let treatmentId: string;
  let scheduledTodayId: string;
  let followUpTodayId: string;

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
    await prisma.treatmentRecord.updateMany({ data: { parentRecordId: null } });
    await prisma.treatmentRecord.deleteMany();
    await prisma.animal.deleteMany();
    await prisma.client.deleteMany();
    await prisma.invitation.deleteMany();
    await prisma.orgMembership.deleteMany();
    await prisma.activityLog.deleteMany(); // again before orgs (FK: activity_logs.organization_id)
    await prisma.organization.deleteMany();
    await prisma.vet.deleteMany();
  }

  async function setupTestData() {
    // Create vets
    const owner = await prisma.vet.create({
      data: {
        authUserId: 'auth-owner-p0',
        email: 'owner@p0test.com',
        fullName: 'Dr. Owner P0',
        vcnNumber: 'VCN-P0-001',
        status: 'APPROVED',
        profileCompleted: true,
      },
    });
    vetOwnerId = owner.id;

    const admin = await prisma.vet.create({
      data: {
        authUserId: 'auth-admin-p0',
        email: 'admin@p0test.com',
        fullName: 'Dr. Admin P0',
        vcnNumber: 'VCN-P0-002',
        status: 'APPROVED',
        profileCompleted: true,
      },
    });
    vetAdminId = admin.id;

    const member = await prisma.vet.create({
      data: {
        authUserId: 'auth-member-p0',
        email: 'member@p0test.com',
        fullName: 'Dr. Member P0',
        vcnNumber: 'VCN-P0-003',
        status: 'APPROVED',
        profileCompleted: true,
      },
    });
    vetMemberId = member.id;

    // Generate tokens
    vetOwnerToken = await jwtService.signAsync({
      sub: 'auth-owner-p0',
      email: 'owner@p0test.com',
    });
    vetAdminToken = await jwtService.signAsync({
      sub: 'auth-admin-p0',
      email: 'admin@p0test.com',
    });
    vetMemberToken = await jwtService.signAsync({
      sub: 'auth-member-p0',
      email: 'member@p0test.com',
    });

    // Create organization with paymentTerms
    const org = await prisma.organization.create({
      data: {
        name: 'P0 Test Clinic',
        slug: 'p0-test-clinic-001',
        address: '123 P0 Test Street',
        city: 'Lagos',
        state: 'Lagos',
        country: 'NG',
        phoneNumber: '+2348012345678',
        email: 'p0@test.com',
        type: 'CLINIC',
        paymentTerms: 'Monthly invoicing with 30-day terms',
        status: 'APPROVED',
        createdBy: vetOwnerId,
      },
    });
    orgId = org.id;

    // Create memberships
    await prisma.orgMembership.create({
      data: {
        organizationId: orgId,
        vetId: vetOwnerId,
        role: 'OWNER',
        status: 'ACTIVE',
        canDeleteClients: true,
        canDeleteAnimals: true,
        canDeleteTreatments: true,
        canViewActivityLog: true,
      },
    });

    await prisma.orgMembership.create({
      data: {
        organizationId: orgId,
        vetId: vetAdminId,
        role: 'ADMIN',
        status: 'ACTIVE',
        canDeleteClients: true,
        canDeleteAnimals: true,
        canDeleteTreatments: true,
        canViewActivityLog: true,
      },
    });

    await prisma.orgMembership.create({
      data: {
        organizationId: orgId,
        vetId: vetMemberId,
        role: 'MEMBER',
        status: 'ACTIVE',
        canDeleteClients: false,
        canDeleteAnimals: false,
        canDeleteTreatments: false,
        canViewActivityLog: false,
      },
    });

    // Create test client
    const client = await prisma.client.create({
      data: {
        organizationId: orgId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '+2348011112222',
        address: '456 Client Street',
        city: 'Lagos',
        createdBy: vetOwnerId,
      },
    });
    clientId = client.id;

    // Create animals of different patient types
    const petAnimal = await prisma.animal.create({
      data: {
        organizationId: orgId,
        clientId,
        name: 'Max',
        species: 'DOG',
        breed: 'Golden Retriever',
        gender: 'MALE',
        patientType: 'SINGLE_PET',
        dateOfBirth: new Date('2020-01-01'),
        weight: 30.5,
        weightUnit: 'KG',
        createdBy: vetOwnerId,
      },
    });
    petAnimalId = petAnimal.id;

    const livestockAnimal = await prisma.animal.create({
      data: {
        organizationId: orgId,
        clientId,
        name: 'Bull-001',
        species: 'CATTLE',
        gender: 'MALE',
        patientType: 'SINGLE_LIVESTOCK',
        approximateAge: '3 years',
        weight: 450,
        weightUnit: 'KG',
        createdBy: vetOwnerId,
      },
    });
    livestockAnimalId = livestockAnimal.id;

    const farmBatchAnimal = await prisma.animal.create({
      data: {
        organizationId: orgId,
        clientId,
        name: 'Poultry-Batch-A',
        species: 'POULTRY',
        patientType: 'BATCH_LIVESTOCK',
        batchName: 'Broiler Chickens - Shed 1',
        batchSize: 500,
        batchIdentifier: 'BATCH-2026-001',
        createdBy: vetOwnerId,
      },
    });
    farmBatchAnimalId = farmBatchAnimal.id;

    // Create treatments with different payment statuses
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Treatment with amount (PAID)
    await prisma.treatmentRecord.create({
      data: {
        organizationId: orgId,
        animalId: petAnimalId,
        vetId: vetOwnerId,
        version: 1,
        isLatestVersion: true,
        visitDate: yesterday,
        chiefComplaint: 'Routine checkup',
        diagnosis: 'Healthy',
        treatmentGiven: 'Vaccination',
        status: 'COMPLETED',
        amount: 15000,
        currency: 'NGN',
        paymentStatus: 'PAID',
        amountPaid: 15000,
        paidAt: yesterday,
      },
    });

    // Treatment with amount (OWED)
    const owedTreatment = await prisma.treatmentRecord.create({
      data: {
        organizationId: orgId,
        animalId: livestockAnimalId,
        vetId: vetAdminId,
        version: 1,
        isLatestVersion: true,
        visitDate: today,
        chiefComplaint: 'Deworming',
        diagnosis: 'Parasite control',
        treatmentGiven: 'Ivermectin',
        status: 'COMPLETED',
        amount: 25000,
        currency: 'NGN',
        paymentStatus: 'OWED',
      },
    });
    treatmentId = owedTreatment.id;

    // Treatment for farm batch (OWED)
    await prisma.treatmentRecord.create({
      data: {
        organizationId: orgId,
        animalId: farmBatchAnimalId,
        vetId: vetAdminId,
        version: 1,
        isLatestVersion: true,
        visitDate: today,
        chiefComplaint: 'Mass vaccination',
        diagnosis: 'Preventive care',
        treatmentGiven: 'Newcastle disease vaccine',
        status: 'COMPLETED',
        amount: 150000,
        currency: 'NGN',
        paymentStatus: 'OWED',
      },
    });

    // Old treatment from last month
    await prisma.treatmentRecord.create({
      data: {
        organizationId: orgId,
        animalId: petAnimalId,
        vetId: vetOwnerId,
        version: 1,
        isLatestVersion: true,
        visitDate: lastMonth,
        chiefComplaint: 'Checkup',
        diagnosis: 'Healthy',
        treatmentGiven: 'General examination',
        status: 'COMPLETED',
        amount: 5000,
        currency: 'NGN',
        paymentStatus: 'PAID',
        amountPaid: 5000,
        paidAt: lastMonth,
      },
    });

    // Scheduled treatment for today
    const todayScheduled = new Date(today);
    todayScheduled.setHours(14, 0, 0, 0);

    const scheduledToday = await prisma.treatmentRecord.create({
      data: {
        organizationId: orgId,
        animalId: petAnimalId,
        vetId: vetOwnerId,
        version: 1,
        isLatestVersion: true,
        visitDate: today,
        chiefComplaint: 'Scheduled follow-up',
        diagnosis: 'To be determined',
        treatmentGiven: 'Scheduled examination',
        status: 'IN_PROGRESS',
        isScheduled: true,
        scheduledFor: todayScheduled,
      },
    });
    scheduledTodayId = scheduledToday.id;

    // Treatment with follow-up due today
    const todayFollowUp = new Date();
    todayFollowUp.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

    const followUpToday = await prisma.treatmentRecord.create({
      data: {
        organizationId: orgId,
        animalId: livestockAnimalId,
        vetId: vetAdminId,
        version: 1,
        isLatestVersion: true,
        visitDate: yesterday,
        chiefComplaint: 'Post-operative care',
        diagnosis: 'Surgery recovery',
        treatmentGiven: 'Wound care',
        status: 'FOLLOW_UP_REQUIRED',
        followUpDate: todayFollowUp,
        followUpNotes: 'Check wound healing',
      },
    });
    followUpTodayId = followUpToday.id;
  }

  describe('P0-1: Organization paymentTerms Field', () => {
    it('Should get organization with paymentTerms field', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.paymentTerms).toBe('Monthly invoicing with 30-day terms');
    });

    it('Should list organizations with paymentTerms', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/orgs')
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      const org = response.body.data.find((o) => o.id === orgId);
      expect(org.paymentTerms).toBe('Monthly invoicing with 30-day terms');
    });

    it('Should update organization paymentTerms', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/orgs/${orgId}`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          paymentTerms: 'Instant billing on service completion',
        })
        .expect(200);

      expect(response.body.data.paymentTerms).toBe('Instant billing on service completion');
    });

    it('Should create organization with paymentTerms', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/orgs')
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .send({
          name: 'New Test Clinic',
          address: '789 New Street',
          city: 'Abuja',
          state: 'FCT',
          phoneNumber: '+2348099999999',
          type: 'CLINIC',
          paymentTerms: 'Net 45 payment terms',
        })
        .expect(201);

      expect(response.body.data.paymentTerms).toBe('Net 45 payment terms');
    });
  });

  describe('P0-2: Date Range Filtering on Revenue', () => {
    it('Should get revenue without date range (all time)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/revenue`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.totalRevenue).toBeDefined();
      expect(response.body.data.totalPaid).toBeDefined();
      expect(response.body.data.totalOwed).toBeDefined();
      expect(Number(response.body.data.totalRevenue)).toBeGreaterThan(0);
    });

    it('Should filter revenue by date range (today only)', async () => {
      const today = new Date().toISOString().split('T')[0];

      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/revenue`)
        .query({ fromDate: today, toDate: today })
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
      // Should have treatments from today
      const todayRevenue = Number(response.body.data.totalRevenue);
      expect(todayRevenue).toBeGreaterThanOrEqual(0);
    });

    it('Should filter revenue by date range (last month)', async () => {
      const today = new Date();
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      lastMonth.setDate(1);
      const lastMonthEnd = new Date(lastMonth);
      lastMonthEnd.setMonth(lastMonthEnd.getMonth() + 1);
      lastMonthEnd.setDate(0);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/revenue`)
        .query({
          fromDate: lastMonth.toISOString().split('T')[0],
          toDate: lastMonthEnd.toISOString().split('T')[0],
        })
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('Should return zero revenue for future date range', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/revenue`)
        .query({
          fromDate: tomorrow.toISOString().split('T')[0],
          toDate: nextWeek.toISOString().split('T')[0],
        })
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(Number(response.body.data.totalRevenue)).toBe(0);
    });

    it('ADMIN should access revenue with date filtering', async () => {
      const today = new Date().toISOString().split('T')[0];

      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/revenue`)
        .query({ fromDate: today, toDate: today })
        .set('Authorization', `Bearer ${vetAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('MEMBER should NOT access revenue', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/revenue`)
        .set('Authorization', `Bearer ${vetMemberToken}`)
        .expect(403);
    });
  });

  describe('P0-3: Payment Category Filter on Treatments', () => {
    it('Should filter treatments by PET category', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments`)
        .query({ paymentCategory: 'PET' })
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.treatments.length).toBeGreaterThan(0);
      expect(
        response.body.data.treatments.every((t) => t.animal.patientType === 'SINGLE_PET'),
      ).toBe(true);
    });

    it('Should filter treatments by LIVESTOCK category', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments`)
        .query({ paymentCategory: 'LIVESTOCK' })
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.treatments.length).toBeGreaterThan(0);
      expect(
        response.body.data.treatments.every((t) => t.animal.patientType === 'SINGLE_LIVESTOCK'),
      ).toBe(true);
    });

    it('Should filter treatments by FARM category', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments`)
        .query({ paymentCategory: 'FARM' })
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.treatments.length).toBeGreaterThan(0);
      expect(
        response.body.data.treatments.every((t) => t.animal.patientType === 'BATCH_LIVESTOCK'),
      ).toBe(true);
      // Verify batch metadata is included
      const firstTreatment = response.body.data.treatments[0];
      expect(firstTreatment.animal.batchIdentifier).toBeDefined();
      expect(firstTreatment.animal.batchSize).toBeDefined();
    });

    it('Should show ALL when paymentCategory is ALL', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments`)
        .query({ paymentCategory: 'ALL' })
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.treatments.length).toBeGreaterThan(0);
      // Should include different patient types
      const patientTypes = response.body.data.treatments.map((t) => t.animal.patientType);
      expect(patientTypes.length).toBeGreaterThan(0);
    });

    it('Should combine paymentCategory and paymentStatus filters', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments`)
        .query({
          paymentCategory: 'PET',
          paymentStatus: 'PAID',
        })
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.treatments.length).toBeGreaterThan(0);
      expect(
        response.body.data.treatments.every(
          (t) => t.animal.patientType === 'SINGLE_PET' && t.paymentStatus === 'PAID',
        ),
      ).toBe(true);
    });

    it('Should filter LIVESTOCK with OWED status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments`)
        .query({
          paymentCategory: 'LIVESTOCK',
          paymentStatus: 'OWED',
        })
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.data.treatments.length).toBeGreaterThan(0);
      expect(
        response.body.data.treatments.every(
          (t) => t.animal.patientType === 'SINGLE_LIVESTOCK' && t.paymentStatus === 'OWED',
        ),
      ).toBe(true);
    });
  });

  describe('P0-4: Dashboard Statistics Endpoint', () => {
    it('Should get dashboard stats successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/dashboard/stats`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      // Clients
      expect(response.body.clients).toBeDefined();
      expect(response.body.clients.total).toBeGreaterThan(0);
      expect(response.body.clients.active).toBeDefined();
      expect(response.body.clients.inactive).toBeDefined();

      // Animals
      expect(response.body.animals).toBeDefined();
      expect(response.body.animals.total).toBeGreaterThan(0);
      expect(response.body.animals.byPatientType).toBeDefined();
      expect(response.body.animals.byPatientType.SINGLE_PET).toBeGreaterThan(0);
      expect(response.body.animals.byPatientType.SINGLE_LIVESTOCK).toBeGreaterThan(0);
      expect(response.body.animals.byPatientType.BATCH_LIVESTOCK).toBeGreaterThan(0);
      expect(response.body.animals.bySpecies).toBeDefined();

      // Treatments
      expect(response.body.treatments).toBeDefined();
      expect(response.body.treatments.total).toBeGreaterThan(0);
      expect(response.body.treatments.thisMonth).toBeDefined();
      expect(response.body.treatments.scheduled).toBeDefined();
      expect(response.body.treatments.followUpsDue).toBeDefined();

      // Revenue
      expect(response.body.revenue).toBeDefined();
      expect(response.body.revenue.total).toBeGreaterThan(0);
      expect(response.body.revenue.totalPaid).toBeDefined();
      expect(response.body.revenue.totalOwed).toBeDefined();
      expect(response.body.revenue.totalWaived).toBeDefined();
      expect(response.body.revenue.unpaidInvoices).toBeDefined();
    });

    it('Should show correct animal counts by patient type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/dashboard/stats`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const byType = response.body.animals.byPatientType;
      expect(byType.SINGLE_PET).toBe(1);
      expect(byType.SINGLE_LIVESTOCK).toBe(1);
      expect(byType.BATCH_LIVESTOCK).toBe(1);
      expect(response.body.animals.total).toBe(3);
    });

    it('Should show correct revenue breakdown', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/dashboard/stats`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const revenue = response.body.revenue;
      // Should have both paid and owed amounts
      expect(revenue.totalPaid).toBeGreaterThan(0);
      expect(revenue.totalOwed).toBeGreaterThan(0);
      expect(revenue.total).toBe(revenue.totalPaid + revenue.totalOwed + revenue.totalWaived);
      expect(revenue.unpaidInvoices).toBeGreaterThan(0);
    });

    it('ADMIN should access dashboard stats', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/dashboard/stats`)
        .set('Authorization', `Bearer ${vetAdminToken}`)
        .expect(200);

      expect(response.body.clients).toBeDefined();
      expect(response.body.animals).toBeDefined();
    });

    it('MEMBER should access dashboard stats', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/dashboard/stats`)
        .set('Authorization', `Bearer ${vetMemberToken}`)
        .expect(200);

      expect(response.body.clients).toBeDefined();
    });

    it('Should return consistent data structure', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/dashboard/stats`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      // Verify structure matches DashboardStatsResponseDto
      expect(response.body).toMatchObject({
        clients: {
          total: expect.any(Number),
          active: expect.any(Number),
          inactive: expect.any(Number),
        },
        animals: {
          total: expect.any(Number),
          byPatientType: {
            SINGLE_PET: expect.any(Number),
            SINGLE_LIVESTOCK: expect.any(Number),
            BATCH_LIVESTOCK: expect.any(Number),
          },
          bySpecies: expect.any(Object),
          vaccinationDue: expect.any(Number),
        },
        treatments: {
          total: expect.any(Number),
          thisMonth: expect.any(Number),
          scheduled: expect.any(Number),
          followUpsDue: expect.any(Number),
        },
        revenue: {
          total: expect.any(Number),
          totalPaid: expect.any(Number),
          totalOwed: expect.any(Number),
          totalWaived: expect.any(Number),
          unpaidInvoices: expect.any(Number),
        },
      });
    });
  });

  describe('P0-5: Scheduled Treatments for Today', () => {
    it('Should get treatments scheduled for today', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments/scheduled/today`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.treatments).toBeDefined();
      expect(response.body.count).toBeDefined();
      expect(response.body.count).toBeGreaterThan(0);
      expect(response.body.treatments.length).toBe(response.body.count);

      // Verify the scheduled treatment is included
      const scheduledTreatment = response.body.treatments.find((t) => t.id === scheduledTodayId);
      expect(scheduledTreatment).toBeDefined();
      expect(scheduledTreatment.isScheduled).toBe(true);
      expect(scheduledTreatment.scheduledFor).toBeDefined();
    });

    it('Should include animal and client details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments/scheduled/today`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.treatments.length).toBeGreaterThan(0);
      const treatment = response.body.treatments[0];

      expect(treatment.animal).toBeDefined();
      expect(treatment.animal.id).toBeDefined();
      expect(treatment.animal.name).toBeDefined();
      expect(treatment.animal.species).toBeDefined();
      expect(treatment.animal.client).toBeDefined();
      expect(treatment.animal.client.firstName).toBeDefined();
      expect(treatment.animal.client.lastName).toBeDefined();
      expect(treatment.animal.client.phoneNumber).toBeDefined();
    });

    it('Should only return scheduled treatments for today', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments/scheduled/today`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      response.body.treatments.forEach((treatment) => {
        const scheduledDate = new Date(treatment.scheduledFor);
        expect(scheduledDate >= today && scheduledDate < tomorrow).toBe(true);
        expect(treatment.isScheduled).toBe(true);
      });
    });

    it('Should order treatments by scheduled time', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments/scheduled/today`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      if (response.body.treatments.length > 1) {
        const times = response.body.treatments.map((t) => new Date(t.scheduledFor).getTime());
        const sortedTimes = [...times].sort((a, b) => a - b);
        expect(times).toEqual(sortedTimes);
      }
    });

    it('ADMIN can access scheduled today', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments/scheduled/today`)
        .set('Authorization', `Bearer ${vetAdminToken}`)
        .expect(200);
    });

    it('MEMBER can access scheduled today', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments/scheduled/today`)
        .set('Authorization', `Bearer ${vetMemberToken}`)
        .expect(200);
    });
  });

  describe('P0-6: Follow-ups Due Today', () => {
    it('Should get follow-ups due today', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments/follow-ups/today`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.treatments).toBeDefined();
      expect(response.body.count).toBeDefined();
      expect(response.body.count).toBeGreaterThan(0);
      expect(response.body.treatments.length).toBe(response.body.count);

      // Verify the follow-up treatment is included
      const followUpTreatment = response.body.treatments.find((t) => t.id === followUpTodayId);
      expect(followUpTreatment).toBeDefined();
      expect(followUpTreatment.followUpDate).toBeDefined();
    });

    it('Should include animal and client details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments/follow-ups/today`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(response.body.treatments.length).toBeGreaterThan(0);
      const treatment = response.body.treatments[0];

      expect(treatment.animal).toBeDefined();
      expect(treatment.animal.name).toBeDefined();
      expect(treatment.animal.client).toBeDefined();
      expect(treatment.animal.client.firstName).toBeDefined();
      expect(treatment.animal.client.phoneNumber).toBeDefined();
    });

    it('Should only return follow-ups for today', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments/follow-ups/today`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const today = new Date();
      const todayDateString = today.toISOString().split('T')[0];

      response.body.treatments.forEach((treatment) => {
        const followUpDate = new Date(treatment.followUpDate);
        const followUpDateString = followUpDate.toISOString().split('T')[0];
        expect(followUpDateString).toBe(todayDateString);
      });
    });

    it('Should order follow-ups by date', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments/follow-ups/today`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      if (response.body.treatments.length > 1) {
        const dates = response.body.treatments.map((t) => new Date(t.followUpDate).getTime());
        const sortedDates = [...dates].sort((a, b) => a - b);
        expect(dates).toEqual(sortedDates);
      }
    });

    it('ADMIN can access follow-ups today', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments/follow-ups/today`)
        .set('Authorization', `Bearer ${vetAdminToken}`)
        .expect(200);
    });

    it('MEMBER can access follow-ups today', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments/follow-ups/today`)
        .set('Authorization', `Bearer ${vetMemberToken}`)
        .expect(200);
    });
  });

  describe('P0-7: Integration - Dashboard with All P0 Features', () => {
    it('Dashboard stats should reflect payment categories correctly', async () => {
      const statsResponse = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/dashboard/stats`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      // Get treatments by category to verify counts
      const petResponse = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments`)
        .query({ paymentCategory: 'PET' })
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const livestockResponse = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments`)
        .query({ paymentCategory: 'LIVESTOCK' })
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const farmResponse = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments`)
        .query({ paymentCategory: 'FARM' })
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      // Verify animal counts match
      expect(statsResponse.body.animals.byPatientType.SINGLE_PET).toBe(1);
      expect(statsResponse.body.animals.byPatientType.SINGLE_LIVESTOCK).toBe(1);
      expect(statsResponse.body.animals.byPatientType.BATCH_LIVESTOCK).toBe(1);

      // Verify treatments exist for each category
      expect(petResponse.body.data.treatments.length).toBeGreaterThan(0);
      expect(livestockResponse.body.data.treatments.length).toBeGreaterThan(0);
      expect(farmResponse.body.data.treatments.length).toBeGreaterThan(0);
    });

    it('Dashboard stats follow-ups should match follow-ups/today endpoint', async () => {
      const statsResponse = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/dashboard/stats`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      const followUpsResponse = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${orgId}/treatments/follow-ups/today`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(statsResponse.body.treatments.followUpsDue).toBe(followUpsResponse.body.count);
    });

    it('Should handle empty results gracefully', async () => {
      // Create new empty org for testing
      const emptyOrg = await prisma.organization.create({
        data: {
          name: 'Empty Test Org',
          slug: 'empty-test-org-001',
          address: '999 Empty Street',
          city: 'Lagos',
          state: 'Lagos',
          phoneNumber: '+2348099999999',
          type: 'CLINIC',
          status: 'APPROVED',
          createdBy: vetOwnerId,
        },
      });

      await prisma.orgMembership.create({
        data: {
          organizationId: emptyOrg.id,
          vetId: vetOwnerId,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      });

      // Test dashboard stats with no data
      const statsResponse = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${emptyOrg.id}/dashboard/stats`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(statsResponse.body.clients.total).toBe(0);
      expect(statsResponse.body.animals.total).toBe(0);
      expect(statsResponse.body.treatments.total).toBe(0);
      expect(statsResponse.body.revenue.total).toBe(0);

      // Test scheduled today with no data
      const scheduledResponse = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${emptyOrg.id}/treatments/scheduled/today`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(scheduledResponse.body.count).toBe(0);
      expect(scheduledResponse.body.treatments.length).toBe(0);

      // Test follow-ups today with no data
      const followUpsResponse = await request(app.getHttpServer())
        .get(`/api/v1/orgs/${emptyOrg.id}/treatments/follow-ups/today`)
        .set('Authorization', `Bearer ${vetOwnerToken}`)
        .expect(200);

      expect(followUpsResponse.body.count).toBe(0);
      expect(followUpsResponse.body.treatments.length).toBe(0);
    });
  });
});
