import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { AuditLogService } from '../common/services/audit-log.service';
import { ActivityLogService } from '../common/services/activity-log.service';
import {
  MembershipRole,
  MembershipStatus,
  InvitationStatus,
  VetStatus,
} from '@prisma/client';

@Injectable()
export class MembershipsService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
    private activityLogService: ActivityLogService,
  ) {}

  async createInvitation(
    organizationId: string,
    inviterId: string,
    dto: CreateInvitationDto,
  ) {
    // Check if vet exists and is approved
    const invitedVet = await this.prisma.vet.findUnique({
      where: { email: dto.invitedEmail },
    });

    if (!invitedVet) {
      throw new NotFoundException({
        code: 'VET_NOT_FOUND',
        message: 'No vet found with this email address',
      });
    }

    if (invitedVet.status !== VetStatus.APPROVED) {
      throw new BadRequestException({
        code: 'VET_NOT_APPROVED',
        message: 'Can only invite approved vets',
        details: { status: invitedVet.status },
      });
    }

    // Check if already a member
    const existingMembership = await this.prisma.orgMembership.findUnique({
      where: {
        vetId_organizationId: {
          vetId: invitedVet.id,
          organizationId,
        },
      },
    });

    if (existingMembership?.status === MembershipStatus.ACTIVE) {
      throw new ConflictException({
        code: 'ALREADY_MEMBER',
        message: 'This vet is already a member of the organization',
      });
    }

    // Check for pending invitation
    const pendingInvitation = await this.prisma.invitation.findFirst({
      where: {
        organizationId,
        invitedEmail: dto.invitedEmail,
        status: InvitationStatus.PENDING,
      },
    });

    if (pendingInvitation) {
      throw new ConflictException({
        code: 'INVITATION_PENDING',
        message: 'An invitation is already pending for this email',
      });
    }

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.invitation.create({
      data: {
        organizationId,
        invitedEmail: dto.invitedEmail,
        role: dto.role || MembershipRole.MEMBER,
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

    // TODO: Send email/SMS notification

    return invitation;
  }

  async getInvitations(organizationId: string) {
    return this.prisma.invitation.findMany({
      where: {
        organizationId,
        status: InvitationStatus.PENDING,
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

  async acceptInvitation(token: string, vetId: string) {
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
      throw new NotFoundException({
        code: 'INVITATION_NOT_FOUND',
        message: 'Invitation not found',
      });
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException({
        code: 'INVITATION_NOT_PENDING',
        message: 'This invitation has already been responded to',
        details: { status: invitation.status },
      });
    }

    if (new Date() > invitation.expiresAt) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });

      throw new BadRequestException({
        code: 'INVITATION_EXPIRED',
        message: 'This invitation has expired',
      });
    }

    // Verify the accepting vet's email matches
    const vet = await this.prisma.vet.findUnique({
      where: { id: vetId },
    });

    if (vet?.email !== invitation.invitedEmail) {
      throw new ForbiddenException({
        code: 'EMAIL_MISMATCH',
        message: 'This invitation is for a different email address',
      });
    }

    // Create or update membership
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
        status: MembershipStatus.ACTIVE,
      },
      update: {
        role: invitation.role,
        status: MembershipStatus.ACTIVE,
        removedAt: null,
        removedBy: null,
      },
    });

    // Update invitation status
    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.ACCEPTED,
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

    // TODO: Send notification

    return { membership, organization: invitation.organization };
  }

  async declineInvitation(token: string, vetId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException({
        code: 'INVITATION_NOT_FOUND',
        message: 'Invitation not found',
      });
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException({
        code: 'INVITATION_NOT_PENDING',
        message: 'This invitation has already been responded to',
      });
    }

    // Verify the declining vet's email matches
    const vet = await this.prisma.vet.findUnique({
      where: { id: vetId },
    });

    if (vet?.email !== invitation.invitedEmail) {
      throw new ForbiddenException({
        code: 'EMAIL_MISMATCH',
        message: 'This invitation is for a different email address',
      });
    }

    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.DECLINED,
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

  async cancelInvitation(
    organizationId: string,
    invitationId: string,
    vetId: string,
  ) {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        id: invitationId,
        organizationId,
      },
    });

    if (!invitation) {
      throw new NotFoundException({
        code: 'INVITATION_NOT_FOUND',
        message: 'Invitation not found',
      });
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException({
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

  async removeMember(
    organizationId: string,
    membershipId: string,
    removerId: string,
  ) {
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
      throw new NotFoundException({
        code: 'MEMBERSHIP_NOT_FOUND',
        message: 'Membership not found',
      });
    }

    if (membership.role === MembershipRole.OWNER) {
      throw new ForbiddenException({
        code: 'CANNOT_REMOVE_OWNER',
        message: 'Cannot remove the organization owner',
      });
    }

    if (membership.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestException({
        code: 'MEMBERSHIP_NOT_ACTIVE',
        message: 'Membership is not active',
      });
    }

    await this.prisma.orgMembership.update({
      where: { id: membershipId },
      data: {
        status: MembershipStatus.REMOVED,
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

  async updateMemberRole(
    organizationId: string,
    membershipId: string,
    updaterId: string,
    dto: UpdateMemberRoleDto,
  ) {
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
      throw new NotFoundException({
        code: 'MEMBERSHIP_NOT_FOUND',
        message: 'Membership not found',
      });
    }

    if (membership.role === MembershipRole.OWNER) {
      throw new ForbiddenException({
        code: 'CANNOT_CHANGE_OWNER_ROLE',
        message: 'Cannot change the role of the organization owner',
      });
    }

    if (dto.role === MembershipRole.OWNER) {
      throw new ForbiddenException({
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

  async updatePermissions(
    organizationId: string,
    membershipId: string,
    updaterId: string,
    dto: UpdatePermissionsDto,
  ) {
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
      throw new NotFoundException({
        code: 'MEMBERSHIP_NOT_FOUND',
        message: 'Membership not found',
      });
    }

    if (membership.role === MembershipRole.OWNER) {
      throw new ForbiddenException({
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

  async leaveMembership(organizationId: string, vetId: string) {
    const membership = await this.prisma.orgMembership.findUnique({
      where: {
        vetId_organizationId: {
          vetId,
          organizationId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException({
        code: 'MEMBERSHIP_NOT_FOUND',
        message: 'You are not a member of this organization',
      });
    }

    if (membership.role === MembershipRole.OWNER) {
      throw new ForbiddenException({
        code: 'OWNER_CANNOT_LEAVE',
        message: 'Organization owner cannot leave. Transfer ownership first.',
      });
    }

    await this.prisma.orgMembership.update({
      where: { id: membership.id },
      data: {
        status: MembershipStatus.LEFT,
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
}
