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
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  country?: string;
  logoUrl?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  paymentTerms?: string;
  createdAt: string;
  updatedAt: string;
  _counts?: {
    clients: number;
    animals: number;
  };
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
