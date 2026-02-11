// API Types for Veterinary Practice Management Platform

export interface VetProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  profilePhotoUrl?: string;
  vcnNumber?: string;
  specialization?: string;
  yearsOfExperience?: number;
  qualifications?: string[];
  universityAttended?: string;
  graduationYear?: number;
  practiceAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  practiceType?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  profileCompleted: boolean;
  isMasterAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  paymentTerms?: string;
  welcomeMessage?: string;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  _counts?: {
    clients: number;
    animals: number;
    members?: number;
  };
  /** Present when listing organizations the user belongs to */
  membership?: {
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    joinedAt: string;
    permissions?: {
      canDeleteClients?: boolean;
      canDeleteAnimals?: boolean;
      canDeleteTreatments?: boolean;
      canViewActivityLog?: boolean;
    };
  };
}

/** Organization with creator and member count (admin pending-approvals list) */
export interface PendingOrganization extends Organization {
  creator?: { id: string; fullName: string; email: string; phoneNumber?: string };
  _count?: { memberships: number };
}

export type MembershipRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface OrgMember {
  id: string;
  vet: { id: string; fullName: string; email: string; phoneNumber?: string; profilePhotoUrl?: string; specialization?: string };
  role: MembershipRole;
  joinedAt: string;
  permissions: {
    canDeleteClients: boolean;
    canDeleteAnimals: boolean;
    canDeleteTreatments: boolean;
    canViewActivityLog: boolean;
  };
}

export interface Invitation {
  id: string;
  organizationId: string;
  invitedEmail: string;
  role: MembershipRole;
  status: string;
  expiresAt: string;
  createdAt: string;
  inviter?: { id: string; fullName: string; email: string };
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  city?: string;
  address?: string;
  createdAt: string;
  _count?: { animals: number };
}

export interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  gender?: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
  approximateAge?: string;
  photoUrl?: string;
  patientType: 'SINGLE_PET' | 'SINGLE_LIVESTOCK' | 'BATCH_LIVESTOCK';
  batchSize?: number;
  batchIdentifier?: string;
  clientId: string;
  client: Client;
  createdAt: string;
  updatedAt: string;
}

export interface Treatment {
  id: string;
  animalId: string;
  animal: Animal;
  organizationId: string;
  organization: Organization;
  diagnosis?: string;
  treatmentGiven?: string;
  medications?: string;
  amount?: number;
  paymentStatus: 'PAID' | 'OWED' | 'PARTIAL';
  paymentCategory?: 'PET' | 'LIVESTOCK' | 'FARM';
  status: 'COMPLETED' | 'SCHEDULED' | 'FOLLOW_UP_REQUIRED';
  visitDate: string;
  scheduledFor?: string;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  clients: { total: number; active: number };
  animals: {
    total: number;
    vaccinationDue?: number;
    byPatientType: {
      SINGLE_PET: number;
      SINGLE_LIVESTOCK: number;
      BATCH_LIVESTOCK: number;
    };
  };
  revenue: {
    total: number;
    unpaidInvoices: number;
  };
  treatments: {
    scheduled: number;
    followUpsDue: number;
    completed: number;
  };
}

export interface RevenueData {
  totalRevenue: number;
  paymentBreakdown: {
    PAID: { count: number; total: number };
    OWED: { count: number; total: number };
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface ActivityLogEntry {
  id: string;
  organizationId: string;
  vetId: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: unknown;
  createdAt: string;
  vet?: {
    id: string;
    fullName: string;
    email?: string;
    profilePhotoUrl?: string;
  };
}
