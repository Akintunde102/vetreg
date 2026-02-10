import type {
  VetProfile,
  Organization,
  PendingOrganization,
  Invitation,
  Animal,
  Client,
  Treatment,
  DashboardStats,
  RevenueData,
  PaginatedResponse,
  ActivityLogEntry,
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

  async getActivityLog(orgId: string, params?: { page?: number; limit?: number }) {
    const query = params && (params.page != null || params.limit != null)
      ? '?' + new URLSearchParams({
          ...(params.page != null && { page: String(params.page) }),
          ...(params.limit != null && { limit: String(params.limit) }),
        }).toString()
      : '';
    return this.request<{ logs: ActivityLogEntry[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
      `/orgs/${orgId}/activity-log${query}`
    );
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

  async getInvitations(orgId: string): Promise<Invitation[]> {
    const res = await this.request<{ data?: Invitation[] } | Invitation[]>(`/orgs/${orgId}/invitations`);
    if (Array.isArray(res)) return res;
    return res.data ?? [];
  }

  async createInvitation(orgId: string, data: { invitedEmail: string; role?: 'OWNER' | 'ADMIN' | 'MEMBER' }): Promise<Invitation> {
    const res = await this.request<{ data: Invitation }>(`/orgs/${orgId}/invitations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  }

  async cancelInvitation(orgId: string, invitationId: string): Promise<void> {
    await this.request(`/orgs/${orgId}/invitations/${invitationId}`, { method: 'DELETE' });
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
  async getAnimals(orgId: string, params?: Record<string, string | undefined>) {
    const cleanParams =
      params &&
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v != null && v !== '')
      ) as Record<string, string>;
    const query = cleanParams && Object.keys(cleanParams).length > 0
      ? '?' + new URLSearchParams(cleanParams).toString()
      : '';
    const res = await this.request<{ data: { animals?: Animal[]; pagination?: { page: number; limit: number; total: number; totalPages: number } } } | { data: PaginatedResponse<Animal> }>(`/orgs/${orgId}/animals${query}`);
    const raw = res && typeof res === 'object' && 'data' in res ? (res as { data: unknown }).data : res;
    if (raw && typeof raw === 'object' && 'animals' in raw && Array.isArray((raw as { animals: unknown }).animals)) {
      const { animals, pagination } = raw as { animals: Animal[]; pagination?: { page: number; limit: number; total: number; totalPages: number } };
      return {
        data: animals,
        meta: pagination
          ? { page: pagination.page, limit: pagination.limit, totalCount: pagination.total, totalPages: pagination.totalPages }
          : { page: 1, limit: 50, totalCount: animals.length, totalPages: 1 },
      };
    }
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown }).data))
      return raw as PaginatedResponse<Animal>;
    return { data: [], meta: { page: 1, limit: 50, totalCount: 0, totalPages: 1 } };
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
  async getClients(orgId: string, params?: Record<string, string | undefined>) {
    const cleanParams =
      params &&
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v != null && v !== '')
      ) as Record<string, string>;
    const query = cleanParams && Object.keys(cleanParams).length > 0
      ? '?' + new URLSearchParams(cleanParams).toString()
      : '';
    const res = await this.request<{ data: PaginatedResponse<Client> } | { data: { clients: Client[]; pagination: { page: number; limit: number; total: number; totalPages: number } } } | { success: boolean; data: { clients: Client[]; pagination: { page: number; limit: number; total: number; totalPages: number } } }>(`/orgs/${orgId}/clients${query}`);
    const raw = res && typeof res === 'object' && 'data' in res ? (res as { data: unknown }).data : res;
    if (raw && typeof raw === 'object' && 'clients' in raw && Array.isArray((raw as { clients: unknown }).clients)) {
      const { clients, pagination } = raw as { clients: Client[]; pagination?: { page: number; limit: number; total: number; totalPages: number } };
      return {
        data: clients,
        meta: pagination
          ? { page: pagination.page, limit: pagination.limit, totalCount: pagination.total, totalPages: pagination.totalPages }
          : { page: 1, limit: 50, totalCount: clients.length, totalPages: 1 },
      };
    }
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown }).data))
      return raw as PaginatedResponse<Client>;
    return { data: [], meta: { page: 1, limit: 50, totalCount: 0, totalPages: 0 } };
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

  async deleteClient(orgId: string, clientId: string, body: { reason: string }): Promise<void> {
    await this.request(`/orgs/${orgId}/clients/${clientId}`, {
      method: 'DELETE',
      body: JSON.stringify(body),
    });
  }

  // Revenue
  async getRevenue(orgId: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await this.request<{ data: RevenueData } | RevenueData>(`/orgs/${orgId}/revenue${query}`);
    return 'data' in res ? res.data : res;
  }

  // Treatments
  async getTreatments(orgId: string, params?: Record<string, string | undefined>) {
    const cleanParams =
      params &&
      (Object.fromEntries(
        Object.entries(params).filter(([, v]) => v != null && v !== '')
      ) as Record<string, string>);
    const query =
      cleanParams && Object.keys(cleanParams).length > 0
        ? '?' + new URLSearchParams(cleanParams).toString()
        : '';
    const res = await this.request<
      | { data: PaginatedResponse<Treatment> }
      | { data: { treatments: Treatment[]; pagination?: { page: number; limit: number; total: number; totalPages: number } } }
      | { treatments: Treatment[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }
    >(`/orgs/${orgId}/treatments${query}`);
    const body = res && typeof res === 'object' && 'data' in res ? (res as { data: unknown }).data : res;
    if (body && typeof body === 'object' && 'treatments' in body && Array.isArray((body as { treatments: Treatment[] }).treatments)) {
      const r = body as { treatments: Treatment[]; pagination?: { page: number; limit: number; total: number; totalPages: number } };
      return {
        data: r.treatments,
        meta: r.pagination
          ? { page: r.pagination.page, limit: r.pagination.limit, totalCount: r.pagination.total, totalPages: r.pagination.totalPages }
          : { page: 1, limit: 50, totalCount: r.treatments.length, totalPages: 1 },
      };
    }
    if (body && typeof body === 'object' && 'data' in body && Array.isArray((body as { data: Treatment[] }).data)) {
      return body as PaginatedResponse<Treatment>;
    }
    return (res as { data: PaginatedResponse<Treatment> })?.data ?? { data: [], meta: { page: 1, limit: 50, totalCount: 0, totalPages: 1 } };
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

  async updateTreatment(orgId: string, treatmentId: string, data: Partial<Treatment> & Record<string, unknown>) {
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
