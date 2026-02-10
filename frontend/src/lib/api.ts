import type {
  VetProfile,
  Organization,
  PendingOrganization,
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
      const apiError = new ApiError(response.status, error.error?.code || 'UNKNOWN', error.error?.message || error.message);
      if (response.status === 401) {
        const path = window.location.pathname;
        const isPublic = path === '/' || path === '/login' || path === '/signup' || path.startsWith('/auth/');
        if (!isPublic) {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
        }
      }
      throw apiError;
    }

    return response.json();
  }

  // Auth / Profile
  async getProfile(): Promise<VetProfile> {
    const res = await this.request<{ vet?: VetProfile; data?: VetProfile }>('/vets/profile');
    return res.vet ?? res.data!;
  }

  async getApprovalStatus() {
    return this.request<{ status: string }>('/vets/approval-status');
  }

  async completeProfile(data: Partial<VetProfile>) {
    const res = await this.request<{ vet?: VetProfile; data?: VetProfile }>('/vets/profile/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.vet ?? res.data ?? (res as unknown as VetProfile);
  }

  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    const res = await this.request<{ data: Organization[] }>('/orgs');
    return 'data' in res ? res.data : (res as unknown as Organization[]);
  }

  async createOrganization(data: { name: string; address: string; city: string; state: string; country?: string; phoneNumber: string; type: string; paymentTerms?: string; description?: string; email?: string; website?: string }) {
    const res = await this.request<{ data: Organization }>('/orgs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return 'data' in res ? res.data : (res as unknown as Organization);
  }

  async getOrganization(orgId: string): Promise<Organization> {
    const res = await this.request<{ data: Organization }>(`/orgs/${orgId}`);
    return res.data;
  }

  // Dashboard
  async getDashboardStats(orgId: string): Promise<DashboardStats> {
    return this.request<DashboardStats>(`/orgs/${orgId}/dashboard/stats`);
  }

  async getScheduledToday(orgId: string) {
    return this.request<{ treatments: Treatment[] }>(`/orgs/${orgId}/treatments/scheduled/today`);
  }

  async getScheduledList(
    orgId: string,
    params?: Record<string, string>,
  ): Promise<{ treatments: Treatment[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await this.request<
      | { treatments: Treatment[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }
      | { success: boolean; data: { treatments: Treatment[]; pagination?: { page: number; limit: number; total: number; totalPages: number } } }
    >(`/orgs/${orgId}/treatments/scheduled/list${query}`);
    return 'data' in res ? res.data : res;
  }

  async getFollowUpsToday(orgId: string) {
    return this.request<{ treatments: Treatment[]; count: number }>(`/orgs/${orgId}/treatments/follow-ups/today`);
  }

  // Animals
  async getAnimals(orgId: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await this.request<{ data: PaginatedResponse<Animal> }>(`/orgs/${orgId}/animals${query}`);
    return res.data;
  }

  async createAnimal(orgId: string, data: Record<string, unknown>) {
    const res = await this.request<{ data: Animal }>('/orgs/' + orgId + '/animals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return 'data' in res ? res.data : (res as unknown as Animal);
  }

  async getAnimal(orgId: string, animalId: string) {
    const res = await this.request<{ data: Animal }>(`/orgs/${orgId}/animals/${animalId}`);
    return 'data' in res ? res.data : (res as unknown as Animal);
  }

  async getAnimalTreatments(orgId: string, animalId: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await this.request<{ data: PaginatedResponse<Treatment> }>(`/orgs/${orgId}/animals/${animalId}/treatments${query}`);
    return 'data' in res ? res.data : (res as unknown as PaginatedResponse<Treatment>);
  }

  // Clients
  async getClients(orgId: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await this.request<{ data: PaginatedResponse<Client> } | { data: { clients: Client[]; pagination: { page: number; limit: number; total: number; totalPages: number } } }>(`/orgs/${orgId}/clients${query}`);
    const raw = 'data' in res ? res.data : res;
    if (raw && typeof raw === 'object' && 'clients' in raw && 'pagination' in raw) {
      const { clients, pagination } = raw as { clients: Client[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
      return { data: clients, meta: { page: pagination.page, limit: pagination.limit, totalCount: pagination.total, totalPages: pagination.totalPages } };
    }
    return raw as PaginatedResponse<Client>;
  }

  async getClient(orgId: string, clientId: string): Promise<Client> {
    const res = await this.request<{ data: Client } | Client>(`/orgs/${orgId}/clients/${clientId}`);
    return 'data' in res ? res.data : res;
  }

  async getClientAnimals(orgId: string, clientId: string) {
    const res = await this.request<{ data: Animal[] } | Animal[]>(`/orgs/${orgId}/clients/${clientId}/animals`);
    return Array.isArray(res) ? res : res.data;
  }

  async createClient(orgId: string, data: { firstName: string; lastName: string; phoneNumber: string; email?: string; address?: string; city?: string; state?: string }) {
    const res = await this.request<{ data: Client }>('/orgs/' + orgId + '/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return 'data' in res ? res.data : (res as unknown as Client);
  }

  // Revenue
  async getRevenue(orgId: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await this.request<{ data: RevenueData } | RevenueData>(`/orgs/${orgId}/revenue${query}`);
    return 'data' in res ? res.data : res;
  }

  // Treatments
  async getTreatments(orgId: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await this.request<{ data: PaginatedResponse<Treatment> }>(`/orgs/${orgId}/treatments${query}`);
    return res.data;
  }

  async getTreatment(orgId: string, treatmentId: string) {
    const res = await this.request<{ data: Treatment }>(`/orgs/${orgId}/treatments/${treatmentId}`);
    return res.data;
  }

  async createTreatment(orgId: string, data: Record<string, unknown>) {
    const res = await this.request<{ data: Treatment }>('/orgs/' + orgId + '/treatments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return 'data' in res ? res.data : (res as unknown as Treatment);
  }

  async markPayment(
    orgId: string,
    treatmentId: string,
    data: { paymentStatus: 'PAID' | 'OWED' | 'PARTIAL'; amountPaid: number; paymentNotes?: string },
  ) {
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

  // Site Admin (Master Admin only)
  async getPendingVetApprovals(): Promise<VetProfile[]> {
    const res = await this.request<VetProfile[] | { data: VetProfile[] }>('/vets/pending-approvals');
    return Array.isArray(res) ? res : res.data;
  }

  async approveVet(vetId: string): Promise<VetProfile> {
    const res = await this.request<VetProfile | { data: VetProfile }>(`/vets/${vetId}/approve`, { method: 'PATCH' });
    return 'data' in res ? res.data : res;
  }

  async rejectVet(vetId: string, reason: string): Promise<VetProfile> {
    const res = await this.request<VetProfile | { data: VetProfile }>(`/vets/${vetId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
    return 'data' in res ? res.data : res;
  }

  async suspendVet(vetId: string, reason: string): Promise<VetProfile> {
    const res = await this.request<VetProfile | { data: VetProfile }>(`/vets/${vetId}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
    return 'data' in res ? res.data : res;
  }

  async reactivateVet(vetId: string): Promise<VetProfile> {
    const res = await this.request<VetProfile | { data: VetProfile }>(`/vets/${vetId}/reactivate`, { method: 'PATCH' });
    return 'data' in res ? res.data : res;
  }

  async getPendingOrgApprovals(): Promise<PendingOrganization[]> {
    const res = await this.request<PendingOrganization[] | { data: PendingOrganization[] }>('/orgs/admin/pending-approvals');
    return Array.isArray(res) ? res : res.data ?? [];
  }

  async approveOrganization(orgId: string): Promise<Organization> {
    const res = await this.request<{ data: Organization }>(`/orgs/admin/${orgId}/approve`, { method: 'POST' });
    return res.data;
  }

  async rejectOrganization(orgId: string, reason: string): Promise<Organization> {
    const res = await this.request<{ data: Organization }>(`/orgs/admin/${orgId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return res.data;
  }

  async suspendOrganization(orgId: string, reason: string): Promise<Organization> {
    const res = await this.request<{ data: Organization }>(`/orgs/admin/${orgId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return res.data;
  }

  async reactivateOrganization(orgId: string): Promise<Organization> {
    const res = await this.request<{ data: Organization }>(`/orgs/admin/${orgId}/reactivate`, { method: 'POST' });
    return res.data;
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
