import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuditLogService } from '../common/services/audit-log.service';
import { ActivityLogService } from '../common/services/activity-log.service';
export declare class OrganizationsService {
    private prisma;
    private auditLogService;
    private activityLogService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, activityLogService: ActivityLogService);
    private generateSlug;
    create(vetId: string, dto: CreateOrganizationDto): Promise<{
        name: string;
        id: string;
        email: string | null;
        phoneNumber: string;
        city: string;
        state: string;
        country: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        address: string;
        website: string | null;
        type: import("@prisma/client").$Enums.OrgType;
        isActive: boolean;
        slug: string;
        logoUrl: string | null;
        createdBy: string;
    }>;
    findAll(vetId: string): Promise<{
        membership: {
            role: import("@prisma/client").$Enums.MembershipRole;
            joinedAt: Date;
            permissions: {
                canDeleteClients: boolean;
                canDeleteAnimals: boolean;
                canDeleteTreatments: boolean;
                canViewActivityLog: boolean;
            };
        };
        name: string;
        id: string;
        email: string | null;
        phoneNumber: string;
        city: string;
        state: string;
        country: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        address: string;
        website: string | null;
        type: import("@prisma/client").$Enums.OrgType;
        isActive: boolean;
        slug: string;
        logoUrl: string | null;
        createdBy: string;
    }[]>;
    findOne(orgId: string, vetId: string): Promise<{
        memberships: ({
            vet: {
                id: string;
                email: string;
                fullName: string | null;
                profilePhotoUrl: string | null;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.MembershipStatus;
            vetId: string;
            organizationId: string;
            role: import("@prisma/client").$Enums.MembershipRole;
            joinedAt: Date;
            removedAt: Date | null;
            removedBy: string | null;
            canDeleteClients: boolean;
            canDeleteAnimals: boolean;
            canDeleteTreatments: boolean;
            canViewActivityLog: boolean;
        })[];
    } & {
        name: string;
        id: string;
        email: string | null;
        phoneNumber: string;
        city: string;
        state: string;
        country: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        address: string;
        website: string | null;
        type: import("@prisma/client").$Enums.OrgType;
        isActive: boolean;
        slug: string;
        logoUrl: string | null;
        createdBy: string;
    }>;
    update(orgId: string, vetId: string, dto: UpdateOrganizationDto): Promise<{
        name: string;
        id: string;
        email: string | null;
        phoneNumber: string;
        city: string;
        state: string;
        country: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        address: string;
        website: string | null;
        type: import("@prisma/client").$Enums.OrgType;
        isActive: boolean;
        slug: string;
        logoUrl: string | null;
        createdBy: string;
    }>;
    getMembers(orgId: string): Promise<{
        id: string;
        vet: {
            id: string;
            email: string;
            fullName: string | null;
            phoneNumber: string | null;
            profilePhotoUrl: string | null;
            specialization: string | null;
        };
        role: import("@prisma/client").$Enums.MembershipRole;
        joinedAt: Date;
        permissions: {
            canDeleteClients: boolean;
            canDeleteAnimals: boolean;
            canDeleteTreatments: boolean;
            canViewActivityLog: boolean;
        };
    }[]>;
    getActivityLogs(orgId: string, page?: number, limit?: number): Promise<{
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
