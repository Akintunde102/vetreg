import { MembershipsService } from './memberships.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import type { Vet } from '@prisma/client';
export declare class MembershipsController {
    private readonly membershipsService;
    constructor(membershipsService: MembershipsService);
    createInvitation(orgId: string, user: Vet, dto: CreateInvitationDto): Promise<{
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
    getInvitations(orgId: string): Promise<({
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
    cancelInvitation(orgId: string, invitationId: string, user: Vet): Promise<{
        message: string;
    }>;
    acceptInvitation(token: string, user: Vet): Promise<{
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
    declineInvitation(token: string, user: Vet): Promise<{
        message: string;
    }>;
    removeMember(orgId: string, membershipId: string, user: Vet): Promise<{
        message: string;
    }>;
    updateMemberRole(orgId: string, membershipId: string, user: Vet, dto: UpdateMemberRoleDto): Promise<{
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
    updatePermissions(orgId: string, membershipId: string, user: Vet, dto: UpdatePermissionsDto): Promise<{
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
    leaveMembership(orgId: string, user: Vet): Promise<{
        message: string;
    }>;
}
