// Mock data for development before backend is connected
import type { VetProfile, Organization, Animal, Client, Treatment, DashboardStats, RevenueData } from '@/types/api';

export const mockProfile: VetProfile = {
  id: '1',
  userId: 'u1',
  email: 'dr.johnson@vetreg.com',
  fullName: 'Dr. Adebayo Johnson',
  phoneNumber: '+2348012345678',
  status: 'APPROVED',
  profileCompleted: true,
  specialization: 'Small Animal Medicine',
  vcnNumber: 'VCN-2024-0042',
  yearsOfExperience: 12,
  city: 'Lagos',
  state: 'Lagos',
  country: 'NG',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2026-02-09T00:00:00Z',
};

export const mockOrganizations: Organization[] = [
  {
    id: 'org1',
    name: 'Greenleaf Veterinary Clinic',
    address: '24 Admiralty Way, Lekki Phase 1',
    city: 'Lagos',
    status: 'APPROVED',
    paymentTerms: 'Monthly invoicing',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2026-02-08T10:00:00Z',
    _counts: { clients: 45, animals: 62 },
  },
  {
    id: 'org2',
    name: 'PetCare Animal Hospital',
    address: '10 Allen Avenue, Ikeja',
    city: 'Lagos',
    status: 'APPROVED',
    paymentTerms: 'Per visit',
    createdAt: '2024-06-15T00:00:00Z',
    updatedAt: '2026-02-07T14:00:00Z',
    _counts: { clients: 32, animals: 48 },
  },
  {
    id: 'org3',
    name: 'Sunshine Vet Centre',
    address: '5 Ring Road, Ibadan',
    city: 'Ibadan',
    status: 'PENDING_APPROVAL',
    createdAt: '2026-02-05T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z',
    _counts: { clients: 0, animals: 0 },
  },
];

export const mockDashboardStats: DashboardStats = {
  clients: { total: 77, active: 45 },
  animals: {
    total: 122,
    byPatientType: {
      SINGLE_PET: 74,
      SINGLE_LIVESTOCK: 36,
      BATCH_LIVESTOCK: 12,
    },
  },
  revenue: { total: 3500000, unpaidInvoices: 8 },
  treatments: { scheduled: 5, followUpsDue: 3, completed: 156 },
};

export const mockScheduledToday: Treatment[] = [
  {
    id: 't1',
    animalId: 'a1',
    animal: { id: 'a1', name: 'Bella', species: 'Dog', breed: 'Labrador', clientId: 'c1', client: { id: 'c1', firstName: 'Chidi', lastName: 'Okafor', phoneNumber: '+2348011111111', createdAt: '' }, patientType: 'SINGLE_PET', createdAt: '', updatedAt: '' },
    organizationId: 'org1',
    organization: mockOrganizations[0],
    diagnosis: 'Vaccination - Rabies',
    status: 'SCHEDULED',
    scheduledFor: '2026-02-09T09:00:00Z',
    visitDate: '2026-02-09T09:00:00Z',
    paymentStatus: 'OWED',
    amount: 15000,
    createdAt: '',
  },
  {
    id: 't2',
    animalId: 'a2',
    animal: { id: 'a2', name: 'Max', species: 'Dog', breed: 'German Shepherd', clientId: 'c2', client: { id: 'c2', firstName: 'Ngozi', lastName: 'Eze', phoneNumber: '+2348022222222', createdAt: '' }, patientType: 'SINGLE_PET', createdAt: '', updatedAt: '' },
    organizationId: 'org1',
    organization: mockOrganizations[0],
    diagnosis: 'Dental Cleaning',
    status: 'SCHEDULED',
    scheduledFor: '2026-02-09T11:30:00Z',
    visitDate: '2026-02-09T11:30:00Z',
    paymentStatus: 'OWED',
    amount: 25000,
    createdAt: '',
  },
  {
    id: 't3',
    animalId: 'a3',
    animal: { id: 'a3', name: 'Whiskers', species: 'Cat', breed: 'Persian', clientId: 'c3', client: { id: 'c3', firstName: 'Emeka', lastName: 'Nwosu', phoneNumber: '+2348033333333', createdAt: '' }, patientType: 'SINGLE_PET', createdAt: '', updatedAt: '' },
    organizationId: 'org1',
    organization: mockOrganizations[0],
    diagnosis: 'General Checkup',
    status: 'SCHEDULED',
    scheduledFor: '2026-02-09T14:00:00Z',
    visitDate: '2026-02-09T14:00:00Z',
    paymentStatus: 'OWED',
    amount: 10000,
    createdAt: '',
  },
];

export const mockAnimals: Animal[] = [
  {
    id: 'a1', name: 'Bella', species: 'Dog', breed: 'Labrador Retriever', gender: 'FEMALE',
    dateOfBirth: '2022-05-15', photoUrl: '', patientType: 'SINGLE_PET',
    clientId: 'c1', client: { id: 'c1', firstName: 'Chidi', lastName: 'Okafor', phoneNumber: '+2348011111111', createdAt: '' },
    createdAt: '2024-06-01T00:00:00Z', updatedAt: '2026-02-08T00:00:00Z',
  },
  {
    id: 'a2', name: 'Max', species: 'Dog', breed: 'German Shepherd', gender: 'MALE',
    dateOfBirth: '2021-08-20', photoUrl: '', patientType: 'SINGLE_PET',
    clientId: 'c2', client: { id: 'c2', firstName: 'Ngozi', lastName: 'Eze', phoneNumber: '+2348022222222', createdAt: '' },
    createdAt: '2024-07-15T00:00:00Z', updatedAt: '2026-02-07T00:00:00Z',
  },
  {
    id: 'a3', name: 'Whiskers', species: 'Cat', breed: 'Persian', gender: 'FEMALE',
    dateOfBirth: '2023-01-10', photoUrl: '', patientType: 'SINGLE_PET',
    clientId: 'c3', client: { id: 'c3', firstName: 'Emeka', lastName: 'Nwosu', phoneNumber: '+2348033333333', createdAt: '' },
    createdAt: '2024-08-20T00:00:00Z', updatedAt: '2026-02-06T00:00:00Z',
  },
  {
    id: 'a4', name: 'Luna', species: 'Cat', breed: 'Siamese', gender: 'FEMALE',
    dateOfBirth: '2023-06-01', photoUrl: '', patientType: 'SINGLE_PET',
    clientId: 'c1', client: { id: 'c1', firstName: 'Chidi', lastName: 'Okafor', phoneNumber: '+2348011111111', createdAt: '' },
    createdAt: '2024-09-10T00:00:00Z', updatedAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'a5', name: 'Rocky', species: 'Dog', breed: 'Rottweiler', gender: 'MALE',
    dateOfBirth: '2020-11-03', photoUrl: '', patientType: 'SINGLE_PET',
    clientId: 'c4', client: { id: 'c4', firstName: 'Aisha', lastName: 'Bello', phoneNumber: '+2348044444444', createdAt: '' },
    createdAt: '2024-10-01T00:00:00Z', updatedAt: '2026-02-04T00:00:00Z',
  },
  {
    id: 'a6', name: 'Batch-LG-001', species: 'Cattle', patientType: 'BATCH_LIVESTOCK',
    batchSize: 25, batchIdentifier: 'LG-001',
    clientId: 'c5', client: { id: 'c5', firstName: 'Ibrahim', lastName: 'Musa', phoneNumber: '+2348055555555', createdAt: '' },
    createdAt: '2024-11-15T00:00:00Z', updatedAt: '2026-02-03T00:00:00Z',
  },
];

export const mockTreatments: Treatment[] = [
  {
    id: 'tr1', animalId: 'a1',
    animal: mockAnimals[0], organizationId: 'org1', organization: mockOrganizations[0],
    diagnosis: 'Vaccination - DHPP', treatmentGiven: 'DHPP Vaccine administered',
    amount: 15000, paymentStatus: 'PAID', paymentCategory: 'PET',
    status: 'COMPLETED', visitDate: '2026-02-07T10:00:00Z', createdAt: '',
  },
  {
    id: 'tr2', animalId: 'a2',
    animal: mockAnimals[1], organizationId: 'org1', organization: mockOrganizations[0],
    diagnosis: 'Skin Allergy Treatment', treatmentGiven: 'Antihistamine + topical cream',
    amount: 22000, paymentStatus: 'OWED', paymentCategory: 'PET',
    status: 'FOLLOW_UP_REQUIRED', visitDate: '2026-02-06T14:00:00Z',
    followUpDate: '2026-02-13T14:00:00Z', createdAt: '',
  },
  {
    id: 'tr3', animalId: 'a6',
    animal: mockAnimals[5], organizationId: 'org2', organization: mockOrganizations[1],
    diagnosis: 'Deworming - Batch', treatmentGiven: 'Ivermectin injection',
    amount: 125000, paymentStatus: 'OWED', paymentCategory: 'LIVESTOCK',
    status: 'COMPLETED', visitDate: '2026-02-05T09:00:00Z', createdAt: '',
  },
  {
    id: 'tr4', animalId: 'a3',
    animal: mockAnimals[2], organizationId: 'org1', organization: mockOrganizations[0],
    diagnosis: 'Spaying', treatmentGiven: 'Ovariohysterectomy',
    amount: 45000, paymentStatus: 'PAID', paymentCategory: 'PET',
    status: 'COMPLETED', visitDate: '2026-02-03T11:00:00Z', createdAt: '',
  },
  {
    id: 'tr5', animalId: 'a5',
    animal: mockAnimals[4], organizationId: 'org2', organization: mockOrganizations[1],
    diagnosis: 'Annual Vaccination', treatmentGiven: 'Rabies + DHPP',
    amount: 18000, paymentStatus: 'PAID', paymentCategory: 'PET',
    status: 'COMPLETED', visitDate: '2026-02-01T10:30:00Z', createdAt: '',
  },
];

export const mockRevenue: RevenueData = {
  totalRevenue: 3500000,
  paymentBreakdown: {
    PAID: { count: 42, total: 2850000 },
    OWED: { count: 8, total: 650000 },
  },
};

export const mockClients: Client[] = [
  { id: 'c1', firstName: 'Emma', lastName: 'Walker', email: 'emma@email.com', phoneNumber: '9876543210', createdAt: '2024-01-10T00:00:00Z' },
  { id: 'c2', firstName: 'James', lastName: 'Parker', email: 'james@email.com', phoneNumber: '5678901234', createdAt: '2024-02-15T00:00:00Z' },
  { id: 'c3', firstName: 'David', lastName: 'Thompson', email: 'david@enmail.com', phoneNumber: '2345678901', createdAt: '2024-03-20T00:00:00Z' },
  { id: 'c4', firstName: 'Sarah', lastName: 'Adams', email: 'sarah@email.com', phoneNumber: '3456789012', createdAt: '2024-04-10T00:00:00Z' },
  { id: 'c5', firstName: 'Ibrahim', lastName: 'Musa', email: 'ibrahim@email.com', phoneNumber: '08012345678', createdAt: '2024-05-05T00:00:00Z' },
];

export const mockClientDetails = [
  { clientId: 'c1', petCount: 2, livestockCount: 0, balance: 0, lastVisit: 'Vaccination last week' },
  { clientId: 'c2', petCount: 1, livestockCount: 7, balance: 36000, lastVisit: 'Follow-up 3 days ago' },
  { clientId: 'c3', petCount: 2, livestockCount: 0, balance: 0, lastVisit: 'Annual check-up 2 weeks ago' },
  { clientId: 'c4', petCount: 1, livestockCount: 0, balance: 15000, lastVisit: 'Overdue balance for follow-up' },
  { clientId: 'c5', petCount: 0, livestockCount: 100, balance: 15000, lastVisit: 'Mastitis check last week' },
];

export const mockAppointments: Treatment[] = [
  {
    id: 'appt1', animalId: 'a1',
    animal: mockAnimals[0], organizationId: 'org1', organization: mockOrganizations[0],
    diagnosis: 'Annual check-up', status: 'SCHEDULED',
    scheduledFor: '2026-02-09T14:00:00Z', visitDate: '2026-02-09T14:00:00Z',
    paymentStatus: 'OWED', amount: 20000, createdAt: '',
  },
  {
    id: 'appt2', animalId: 'a6',
    animal: mockAnimals[5], organizationId: 'org1', organization: mockOrganizations[0],
    diagnosis: 'Farm Visit - Mastitis Check', status: 'SCHEDULED',
    scheduledFor: '2026-02-09T15:15:00Z', visitDate: '2026-02-09T15:15:00Z',
    paymentStatus: 'OWED', amount: 45000, createdAt: '',
  },
  {
    id: 'appt3', animalId: 'a2',
    animal: mockAnimals[1], organizationId: 'org1', organization: mockOrganizations[0],
    diagnosis: 'Follow-Up', status: 'FOLLOW_UP_REQUIRED',
    scheduledFor: '2026-02-09T16:00:00Z', visitDate: '2026-02-09T16:00:00Z',
    paymentStatus: 'OWED', amount: 40000, createdAt: '',
  },
  {
    id: 'appt4', animalId: 'a3',
    animal: mockAnimals[2], organizationId: 'org2', organization: mockOrganizations[1],
    diagnosis: 'Vaccination', status: 'SCHEDULED',
    scheduledFor: '2026-02-09T10:00:00Z', visitDate: '2026-02-09T10:00:00Z',
    paymentStatus: 'OWED', amount: 15000, createdAt: '',
  },
];
