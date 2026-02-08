"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../common/services/audit-log.service");
const activity_log_service_1 = require("../common/services/activity-log.service");
const client_1 = require("@prisma/client");
let MembershipsService = class MembershipsService {
    prisma;
    auditLogService;
    activityLogService;
    constructor(prisma, auditLogService, activityLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.activityLogService = activityLogService;
    }
    async createInvitation(organizationId, inviterId, dto) {
        const invitedVet = await this.prisma.vet.findUnique({
            where: { email: dto.invitedEmail },
        });
        if (!invitedVet) {
            throw new common_1.NotFoundException({
                code: 'VET_NOT_FOUND',
                message: 'No vet found with this email address',
            });
        }
        if (invitedVet.status !== client_1.VetStatus.APPROVED) {
            throw new common_1.BadRequestException({
                code: 'VET_NOT_APPROVED',
                message: 'Can only invite approved vets',
                details: { status: invitedVet.status },
            });
        }
        const existingMembership = await this.prisma.orgMembership.findUnique({
            where: {
                vetId_organizationId: {
                    vetId: invitedVet.id,
                    organizationId,
                },
            },
        });
        if (existingMembership?.status === client_1.MembershipStatus.ACTIVE) {
            throw new common_1.ConflictException({
                code: 'ALREADY_MEMBER',
                message: 'This vet is already a member of the organization',
            });
        }
        const pendingInvitation = await this.prisma.invitation.findFirst({
            where: {
                organizationId,
                invitedEmail: dto.invitedEmail,
                status: client_1.InvitationStatus.PENDING,
            },
        });
        if (pendingInvitation) {
            throw new common_1.ConflictException({
                code: 'INVITATION_PENDING',
                message: 'An invitation is already pending for this email',
            });
        }
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const invitation = await this.prisma.invitation.create({
            data: {
                organizationId,
                invitedEmail: dto.invitedEmail,
                role: dto.role || client_1.MembershipRole.MEMBER,
                invitedBy: inviterId,
                expiresAt,
            },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                inviter: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        await this.auditLogService.log({
            vetId: inviterId,
            action: 'invitation.created',
            entityType: 'invitation',
            entityId: invitation.id,
            metadata: {
                organizationId,
                invitedEmail: dto.invitedEmail,
                role: invitation.role,
            },
        });
        await this.activityLogService.log({
            organizationId,
            vetId: inviterId,
            action: 'invitation.sent',
            entityType: 'invitation',
            entityId: invitation.id,
            description: `Invited ${dto.invitedEmail} as ${invitation.role}`,
        });
        return invitation;
    }
    async getInvitations(organizationId) {
        return this.prisma.invitation.findMany({
            where: {
                organizationId,
                status: client_1.InvitationStatus.PENDING,
            },
            include: {
                inviter: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async acceptInvitation(token, vetId) {
        const invitation = await this.prisma.invitation.findUnique({
            where: { token },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!invitation) {
            throw new common_1.NotFoundException({
                code: 'INVITATION_NOT_FOUND',
                message: 'Invitation not found',
            });
        }
        if (invitation.status !== client_1.InvitationStatus.PENDING) {
            throw new common_1.BadRequestException({
                code: 'INVITATION_NOT_PENDING',
                message: 'This invitation has already been responded to',
                details: { status: invitation.status },
            });
        }
        if (new Date() > invitation.expiresAt) {
            await this.prisma.invitation.update({
                where: { id: invitation.id },
                data: { status: client_1.InvitationStatus.EXPIRED },
            });
            throw new common_1.BadRequestException({
                code: 'INVITATION_EXPIRED',
                message: 'This invitation has expired',
            });
        }
        const vet = await this.prisma.vet.findUnique({
            where: { id: vetId },
        });
        if (vet?.email !== invitation.invitedEmail) {
            throw new common_1.ForbiddenException({
                code: 'EMAIL_MISMATCH',
                message: 'This invitation is for a different email address',
            });
        }
        const membership = await this.prisma.orgMembership.upsert({
            where: {
                vetId_organizationId: {
                    vetId,
                    organizationId: invitation.organizationId,
                },
            },
            create: {
                vetId,
                organizationId: invitation.organizationId,
                role: invitation.role,
                status: client_1.MembershipStatus.ACTIVE,
            },
            update: {
                role: invitation.role,
                status: client_1.MembershipStatus.ACTIVE,
                removedAt: null,
                removedBy: null,
            },
        });
        await this.prisma.invitation.update({
            where: { id: invitation.id },
            data: {
                status: client_1.InvitationStatus.ACCEPTED,
                respondedAt: new Date(),
            },
        });
        await this.auditLogService.log({
            vetId,
            action: 'invitation.accepted',
            entityType: 'invitation',
            entityId: invitation.id,
            metadata: {
                organizationId: invitation.organizationId,
                membershipId: membership.id,
            },
        });
        await this.activityLogService.log({
            organizationId: invitation.organizationId,
            vetId,
            action: 'member.joined',
            entityType: 'membership',
            entityId: membership.id,
            description: `${vet.fullName || vet.email} joined as ${membership.role}`,
        });
        return { membership, organization: invitation.organization };
    }
    async declineInvitation(token, vetId) {
        const invitation = await this.prisma.invitation.findUnique({
            where: { token },
        });
        if (!invitation) {
            throw new common_1.NotFoundException({
                code: 'INVITATION_NOT_FOUND',
                message: 'Invitation not found',
            });
        }
        if (invitation.status !== client_1.InvitationStatus.PENDING) {
            throw new common_1.BadRequestException({
                code: 'INVITATION_NOT_PENDING',
                message: 'This invitation has already been responded to',
            });
        }
        const vet = await this.prisma.vet.findUnique({
            where: { id: vetId },
        });
        if (vet?.email !== invitation.invitedEmail) {
            throw new common_1.ForbiddenException({
                code: 'EMAIL_MISMATCH',
                message: 'This invitation is for a different email address',
            });
        }
        await this.prisma.invitation.update({
            where: { id: invitation.id },
            data: {
                status: client_1.InvitationStatus.DECLINED,
                respondedAt: new Date(),
            },
        });
        await this.auditLogService.log({
            vetId,
            action: 'invitation.declined',
            entityType: 'invitation',
            entityId: invitation.id,
            metadata: { organizationId: invitation.organizationId },
        });
        return { message: 'Invitation declined' };
    }
    async cancelInvitation(organizationId, invitationId, vetId) {
        const invitation = await this.prisma.invitation.findFirst({
            where: {
                id: invitationId,
                organizationId,
            },
        });
        if (!invitation) {
            throw new common_1.NotFoundException({
                code: 'INVITATION_NOT_FOUND',
                message: 'Invitation not found',
            });
        }
        if (invitation.status !== client_1.InvitationStatus.PENDING) {
            throw new common_1.BadRequestException({
                code: 'INVITATION_NOT_PENDING',
                message: 'Can only cancel pending invitations',
            });
        }
        await this.prisma.invitation.delete({
            where: { id: invitationId },
        });
        await this.auditLogService.log({
            vetId,
            action: 'invitation.cancelled',
            entityType: 'invitation',
            entityId: invitationId,
            metadata: {
                organizationId,
                invitedEmail: invitation.invitedEmail,
            },
        });
        await this.activityLogService.log({
            organizationId,
            vetId,
            action: 'invitation.cancelled',
            entityType: 'invitation',
            entityId: invitationId,
            description: `Cancelled invitation to ${invitation.invitedEmail}`,
        });
        return { message: 'Invitation cancelled' };
    }
    async removeMember(organizationId, membershipId, removerId) {
        const membership = await this.prisma.orgMembership.findFirst({
            where: {
                id: membershipId,
                organizationId,
            },
            include: {
                vet: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        if (!membership) {
            throw new common_1.NotFoundException({
                code: 'MEMBERSHIP_NOT_FOUND',
                message: 'Membership not found',
            });
        }
        if (membership.role === client_1.MembershipRole.OWNER) {
            throw new common_1.ForbiddenException({
                code: 'CANNOT_REMOVE_OWNER',
                message: 'Cannot remove the organization owner',
            });
        }
        if (membership.status !== client_1.MembershipStatus.ACTIVE) {
            throw new common_1.BadRequestException({
                code: 'MEMBERSHIP_NOT_ACTIVE',
                message: 'Membership is not active',
            });
        }
        await this.prisma.orgMembership.update({
            where: { id: membershipId },
            data: {
                status: client_1.MembershipStatus.REMOVED,
                removedAt: new Date(),
                removedBy: removerId,
            },
        });
        await this.auditLogService.log({
            vetId: removerId,
            action: 'member.removed',
            entityType: 'membership',
            entityId: membershipId,
            metadata: {
                organizationId,
                removedVetId: membership.vetId,
            },
        });
        await this.activityLogService.log({
            organizationId,
            vetId: removerId,
            action: 'member.removed',
            entityType: 'membership',
            entityId: membershipId,
            description: `Removed ${membership.vet.fullName || membership.vet.email} from organization`,
        });
        return { message: 'Member removed successfully' };
    }
    async updateMemberRole(organizationId, membershipId, updaterId, dto) {
        const membership = await this.prisma.orgMembership.findFirst({
            where: {
                id: membershipId,
                organizationId,
            },
            include: {
                vet: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        if (!membership) {
            throw new common_1.NotFoundException({
                code: 'MEMBERSHIP_NOT_FOUND',
                message: 'Membership not found',
            });
        }
        if (membership.role === client_1.MembershipRole.OWNER) {
            throw new common_1.ForbiddenException({
                code: 'CANNOT_CHANGE_OWNER_ROLE',
                message: 'Cannot change the role of the organization owner',
            });
        }
        if (dto.role === client_1.MembershipRole.OWNER) {
            throw new common_1.ForbiddenException({
                code: 'CANNOT_ASSIGN_OWNER',
                message: 'Cannot assign OWNER role to members',
            });
        }
        const updatedMembership = await this.prisma.orgMembership.update({
            where: { id: membershipId },
            data: { role: dto.role },
        });
        await this.auditLogService.log({
            vetId: updaterId,
            action: 'member.role_changed',
            entityType: 'membership',
            entityId: membershipId,
            metadata: {
                organizationId,
                oldRole: membership.role,
                newRole: dto.role,
            },
        });
        await this.activityLogService.log({
            organizationId,
            vetId: updaterId,
            action: 'member.role_changed',
            entityType: 'membership',
            entityId: membershipId,
            description: `Changed ${membership.vet.fullName || membership.vet.email}'s role from ${membership.role} to ${dto.role}`,
        });
        return updatedMembership;
    }
    async updatePermissions(organizationId, membershipId, updaterId, dto) {
        const membership = await this.prisma.orgMembership.findFirst({
            where: {
                id: membershipId,
                organizationId,
            },
            include: {
                vet: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
        if (!membership) {
            throw new common_1.NotFoundException({
                code: 'MEMBERSHIP_NOT_FOUND',
                message: 'Membership not found',
            });
        }
        if (membership.role === client_1.MembershipRole.OWNER) {
            throw new common_1.ForbiddenException({
                code: 'CANNOT_CHANGE_OWNER_PERMISSIONS',
                message: 'Owner always has all permissions',
            });
        }
        const updatedMembership = await this.prisma.orgMembership.update({
            where: { id: membershipId },
            data: {
                canDeleteClients: dto.canDeleteClients,
                canDeleteAnimals: dto.canDeleteAnimals,
                canDeleteTreatments: dto.canDeleteTreatments,
                canViewActivityLog: dto.canViewActivityLog,
            },
        });
        await this.auditLogService.log({
            vetId: updaterId,
            action: 'member.permissions_updated',
            entityType: 'membership',
            entityId: membershipId,
            metadata: {
                organizationId,
                permissions: dto,
            },
        });
        await this.activityLogService.log({
            organizationId,
            vetId: updaterId,
            action: 'member.permissions_updated',
            entityType: 'membership',
            entityId: membershipId,
            description: `Updated permissions for ${membership.vet.fullName || membership.vet.email}`,
        });
        return updatedMembership;
    }
    async leaveMembership(organizationId, vetId) {
        const membership = await this.prisma.orgMembership.findUnique({
            where: {
                vetId_organizationId: {
                    vetId,
                    organizationId,
                },
            },
        });
        if (!membership) {
            throw new common_1.NotFoundException({
                code: 'MEMBERSHIP_NOT_FOUND',
                message: 'You are not a member of this organization',
            });
        }
        if (membership.role === client_1.MembershipRole.OWNER) {
            throw new common_1.ForbiddenException({
                code: 'OWNER_CANNOT_LEAVE',
                message: 'Organization owner cannot leave. Transfer ownership first.',
            });
        }
        await this.prisma.orgMembership.update({
            where: { id: membership.id },
            data: {
                status: client_1.MembershipStatus.LEFT,
            },
        });
        await this.auditLogService.log({
            vetId,
            action: 'member.left',
            entityType: 'membership',
            entityId: membership.id,
            metadata: { organizationId },
        });
        await this.activityLogService.log({
            organizationId,
            vetId,
            action: 'member.left',
            entityType: 'membership',
            entityId: membership.id,
            description: `Left the organization`,
        });
        return { message: 'Successfully left the organization' };
    }
};
exports.MembershipsService = MembershipsService;
exports.MembershipsService = MembershipsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        activity_log_service_1.ActivityLogService])
], MembershipsService);
//# sourceMappingURL=memberships.service.js.map