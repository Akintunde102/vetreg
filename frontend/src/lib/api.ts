import type {
  VetProfile,
  Organization,
  Animal,
  Client,
  Treatment,
  DashboardStats,
  RevenueData,
  PaginatedResponse,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new ApiError(response.status, error.error?.code || 'UNKNOWN', error.error?.message || error.message);
    }

    return response.json();
  }

  // Auth / Profile
  async getProfile(): Promise<VetProfile> {
    const res = await this.request<{ vet: VetProfile }>('/vets/profile');
    return res.vet;
  }

  async getApprovalStatus() {
    return this.request<{ status: string }>('/vets/approval-status');
  }

  async completeProfile(data: Partial<VetProfile>) {
    return this.request<{ vet: VetProfile }>('/vets/profile/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    const res = await this.request<{ data: Organization[] }>('/orgs');
    return res.data;
  }

  async getOrganization(orgId: string): Promise<Organization> {
    return this.request<Organization>(`/orgs/${orgId}`);
  }

  async createOrganization(data: Partial<Organization>) {
    return this.request<Organization>('/orgs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Dashboard
  async getDashboardStats(orgId: string): Promise<DashboardStats> {
    return this.request<DashboardStats>(`/orgs/${orgId}/dashboard/stats`);
  }

  async getScheduledToday(orgId: string) {
    return this.request<{ treatments: Treatment[] }>(`/orgs/${orgId}/treatments/scheduled/today`);
  }

  async getFollowUpsToday(orgId: string) {
    return this.request<{ treatments: Treatment[]; count: number }>(`/orgs/${orgId}/treatments/follow-ups/today`);
  }

  // Animals
  async getAnimals(orgId: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<PaginatedResponse<Animal>>(`/orgs/${orgId}/animals${query}`);
  }

  async getAnimal(orgId: string, animalId: string) {
    return this.request<Animal>(`/orgs/${orgId}/animals/${animalId}`);
  }

  async getAnimalTreatments(orgId: string, animalId: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<PaginatedResponse<Treatment>>(`/orgs/${orgId}/animals/${animalId}/treatments${query}`);
  }

  // Clients
  async getClients(orgId: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<PaginatedResponse<Client>>(`/orgs/${orgId}/clients${query}`);
  }

  // Revenue
  async getRevenue(orgId: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<RevenueData>(`/orgs/${orgId}/revenue${query}`);
  }

  // Treatments
  async getTreatments(orgId: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<PaginatedResponse<Treatment>>(`/orgs/${orgId}/treatments${query}`);
  }

  async markPayment(orgId: string, treatmentId: string, data: { amountPaid: number; paidBy: string; paymentNotes?: string }) {
    return this.request(`/orgs/${orgId}/treatments/${treatmentId}/payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTreatment(orgId: string, treatmentId: string, data: Partial<Treatment>) {
    return this.request(`/orgs/${orgId}/treatments/${treatmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = new ApiClient();
export default api;
