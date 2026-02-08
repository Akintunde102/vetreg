import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { AuditLogService } from '../common/services/audit-log.service';
import { ActivityLogService } from '../common/services/activity-log.service';
export declare class MembershipsService {
    private prisma;
    private auditLogService;
    private activityLogService;
    constructor(prisma: PrismaService, auditLogService: AuditLogService, activityLogService: ActivityLogService);
    createInvitation(organizationId: string, inviterId: string, dto: CreateInvitationDto): Promise<{
        organization: {
            name: string;
            id: string;
        };
        inviter: {
            id: string;
            email: string;
            fullName: string | null;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        createdAt: Date;
        organizationId: string;
        role: import("@prisma/client").$Enums.MembershipRole;
        invitedEmail: string;
        token: string;
        invitedBy: string;
        expiresAt: Date;
        respondedAt: Date | null;
    }>;
    getInvitations(organizationId: string): Promise<({
        inviter: {
            id: string;
            email: string;
            fullName: string | null;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        createdAt: Date;
        organizationId: string;
        role: import("@prisma/client").$Enums.MembershipRole;
        invitedEmail: string;
        token: string;
        invitedBy: string;
        expiresAt: Date;
        respondedAt: Date | null;
    })[]>;
    acceptInvitation(token: string, vetId: string): Promise<{
        membership: {
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
        };
        organization: {
            name: string;
            id: string;
        };
    }>;
    declineInvitation(token: string, vetId: string): Promise<{
        message: string;
    }>;
    cancelInvitation(organizationId: string, invitationId: string, vetId: string): Promise<{
        message: string;
    }>;
    removeMember(organizationId: string, membershipId: string, removerId: string): Promise<{
        message: string;
    }>;
    updateMemberRole(organizationId: string, membershipId: string, updaterId: string, dto: UpdateMemberRoleDto): Promise<{
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
    }>;
    updatePermissions(organizationId: string, membershipId: string, updaterId: string, dto: UpdatePermissionsDto): Promise<{
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
    }>;
    leaveMembership(organizationId: string, vetId: string): Promise<{
        message: string;
    }>;
}
