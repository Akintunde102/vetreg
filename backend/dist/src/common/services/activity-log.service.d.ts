import { PrismaService } from '../../prisma/prisma.service';
export interface ActivityLogData {
    organizationId: string;
    vetId: string;
    action: string;
    entityType: string;
    entityId?: string;
    description: string;
    metadata?: any;
}
export declare class ActivityLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(data: ActivityLogData): Promise<void>;
    getOrganizationLogs(organizationId: string, page?: number, limit?: number): Promise<{
        logs: ({
            vet: {
                id: string;
                email: string;
                fullName: string | null;
                profilePhotoUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            action: string;
            entityType: string;
            entityId: string | null;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            vetId: string;
            organizationId: string;
            description: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
