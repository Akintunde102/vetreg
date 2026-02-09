import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuditLogService } from '../common/services/audit-log.service';
import { ActivityLogService } from '../common/services/activity-log.service';
import { MembershipRole, MembershipStatus, OrgStatus } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
    private activityLogService: ActivityLogService,
  ) {}

  private generateSlug(name: string): string {
    const baseSlug = slugify(name, { lower: true, strict: true });
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${randomSuffix}`;
  }

  async create(vetId: string, dto: CreateOrganizationDto) {
    const slug = this.generateSlug(dto.name);

    // Double-check slug uniqueness (very unlikely to collide with random suffix)
    const existingSlug = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictException({
        code: 'SLUG_CONFLICT',
        message: 'Organization slug conflict. Please try again.',
      });
    }

    const organization = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country || 'NG',
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        website: dto.website,
        type: dto.type,
        createdBy: vetId,
      },
    });

    // Create OWNER membership for creator
    await this.prisma.orgMembership.create({
      data: {
        vetId,
        organizationId: organization.id,
        role: MembershipRole.OWNER,
        status: MembershipStatus.ACTIVE,
        // OWNER has all permissions by default
        canDeleteClients: true,
        canDeleteAnimals: true,
        canDeleteTreatments: true,
        canViewActivityLog: true,
      },
    });

    await this.auditLogService.log({
      vetId,
      action: 'organization.created',
      entityType: 'organization',
      entityId: organization.id,
      metadata: { organizationName: organization.name },
    });

    await this.activityLogService.log({
      organizationId: organization.id,
      vetId,
      action: 'organization.created',
      entityType: 'organization',
      entityId: organization.id,
      description: `Organization "${organization.name}" was created`,
    });

    return organization;
  }

  async findAll(vetId: string) {
    const memberships = await this.prisma.orgMembership.findMany({
      where: {
        vetId,
        status: MembershipStatus.ACTIVE,
      },
      include: {
        organization: true,
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return memberships.map((m) => ({
      ...m.organization,
      membership: {
        role: m.role,
        joinedAt: m.joinedAt,
        permissions: {
          canDeleteClients: m.canDeleteClients,
          canDeleteAnimals: m.canDeleteAnimals,
          canDeleteTreatments: m.canDeleteTreatments,
          canViewActivityLog: m.canViewActivityLog,
        },
      },
    }));
  }

  async findOne(orgId: string, vetId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        memberships: {
          where: { status: MembershipStatus.ACTIVE },
          include: {
            vet: {
              select: {
                id: true,
                fullName: true,
                email: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    // Verify membership
    const isMember = organization.memberships.some((m) => m.vetId === vetId);
    if (!isMember) {
      throw new ForbiddenException({
        code: 'NOT_ORG_MEMBER',
        message: 'You are not a member of this organization',
      });
    }

    return organization;
  }

  async update(orgId: string, vetId: string, dto: UpdateOrganizationDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    const updatedOrg = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        name: dto.name,
        description: dto.description,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        website: dto.website,
        type: dto.type,
        isActive: dto.isActive,
      },
    });

    await this.auditLogService.log({
      vetId,
      action: 'organization.updated',
      entityType: 'organization',
      entityId: orgId,
      metadata: { changes: dto },
    });

    await this.activityLogService.log({
      organizationId: orgId,
      vetId,
      action: 'organization.updated',
      entityType: 'organization',
      entityId: orgId,
      description: `Organization details were updated`,
    });

    return updatedOrg;
  }

  async getMembers(orgId: string) {
    const memberships = await this.prisma.orgMembership.findMany({
      where: {
        organizationId: orgId,
        status: MembershipStatus.ACTIVE,
      },
      include: {
        vet: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profilePhotoUrl: true,
            specialization: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return memberships.map((m) => ({
      id: m.id,
      vet: m.vet,
      role: m.role,
      joinedAt: m.joinedAt,
      permissions: {
        canDeleteClients: m.canDeleteClients,
        canDeleteAnimals: m.canDeleteAnimals,
        canDeleteTreatments: m.canDeleteTreatments,
        canViewActivityLog: m.canViewActivityLog,
      },
    }));
  }

  async getActivityLogs(orgId: string, page: number = 1, limit: number = 50) {
    return this.activityLogService.getOrganizationLogs(orgId, page, limit);
  }

  // Organization approval methods
  async getPendingApprovals() {
    return this.prisma.organization.findMany({
      where: {
        status: OrgStatus.PENDING_APPROVAL,
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
        _count: {
          select: {
            memberships: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveOrganization(adminId: string, orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    if (org.status !== OrgStatus.PENDING_APPROVAL) {
      throw new BadRequestException({
        code: 'ORG_NOT_PENDING',
        message: 'Organization is not pending approval',
        details: { currentStatus: org.status },
      });
    }

    const updatedOrg = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        status: OrgStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });

    await this.auditLogService.log({
      vetId: adminId,
      action: 'organization.approved',
      entityType: 'organization',
      entityId: orgId,
      metadata: { organizationName: org.name },
    });

    await this.activityLogService.log({
      organizationId: orgId,
      vetId: adminId,
      action: 'organization.approved',
      entityType: 'organization',
      entityId: orgId,
      description: `Organization was approved by admin`,
    });

    return updatedOrg;
  }

  async rejectOrganization(adminId: string, orgId: string, reason: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    if (org.status !== OrgStatus.PENDING_APPROVAL) {
      throw new BadRequestException({
        code: 'ORG_NOT_PENDING',
        message: 'Organization is not pending approval',
        details: { currentStatus: org.status },
      });
    }

    const updatedOrg = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        status: OrgStatus.REJECTED,
        rejectedAt: new Date(),
        rejectedBy: adminId,
        rejectionReason: reason,
      },
    });

    await this.auditLogService.log({
      vetId: adminId,
      action: 'organization.rejected',
      entityType: 'organization',
      entityId: orgId,
      metadata: { organizationName: org.name, reason },
    });

    await this.activityLogService.log({
      organizationId: orgId,
      vetId: adminId,
      action: 'organization.rejected',
      entityType: 'organization',
      entityId: orgId,
      description: `Organization was rejected by admin (Reason: ${reason})`,
    });

    return updatedOrg;
  }

  async suspendOrganization(adminId: string, orgId: string, reason: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    if (org.status === OrgStatus.SUSPENDED) {
      throw new BadRequestException({
        code: 'ORG_ALREADY_SUSPENDED',
        message: 'Organization is already suspended',
      });
    }

    const updatedOrg = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        status: OrgStatus.SUSPENDED,
        suspendedAt: new Date(),
        suspendedBy: adminId,
        suspensionReason: reason,
      },
    });

    await this.auditLogService.log({
      vetId: adminId,
      action: 'organization.suspended',
      entityType: 'organization',
      entityId: orgId,
      metadata: { organizationName: org.name, reason },
    });

    await this.activityLogService.log({
      organizationId: orgId,
      vetId: adminId,
      action: 'organization.suspended',
      entityType: 'organization',
      entityId: orgId,
      description: `Organization was suspended by admin (Reason: ${reason})`,
    });

    return updatedOrg;
  }

  async reactivateOrganization(adminId: string, orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    if (org.status !== OrgStatus.SUSPENDED) {
      throw new BadRequestException({
        code: 'ORG_NOT_SUSPENDED',
        message: 'Organization is not suspended',
        details: { currentStatus: org.status },
      });
    }

    const updatedOrg = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        status: OrgStatus.APPROVED,
        reactivatedAt: new Date(),
        reactivatedBy: adminId,
        suspendedAt: null,
        suspensionReason: null,
      },
    });

    await this.auditLogService.log({
      vetId: adminId,
      action: 'organization.reactivated',
      entityType: 'organization',
      entityId: orgId,
      metadata: { organizationName: org.name },
    });

    await this.activityLogService.log({
      organizationId: orgId,
      vetId: adminId,
      action: 'organization.reactivated',
      entityType: 'organization',
      entityId: orgId,
      description: `Organization was reactivated by admin`,
    });

    return updatedOrg;
  }

  async getRevenue(orgId: string) {
    const revenue = await this.prisma.treatmentRecord.aggregate({
      where: {
        organizationId: orgId,
        isDeleted: false,
        amount: { not: null },
      },
      _sum: {
        amount: true,
        amountPaid: true,
      },
      _count: {
        id: true,
      },
    });

    const paymentBreakdown = await this.prisma.treatmentRecord.groupBy({
      by: ['paymentStatus'],
      where: {
        organizationId: orgId,
        isDeleted: false,
        paymentStatus: { not: null },
      },
      _sum: {
        amount: true,
        amountPaid: true,
      },
      _count: {
        id: true,
      },
    });

    const totalRevenue = revenue._sum.amount || 0;
    const totalPaid = revenue._sum.amountPaid || 0;
    const totalOwed = Number(totalRevenue) - Number(totalPaid);

    return {
      totalRevenue: totalRevenue.toString(),
      totalPaid: totalPaid.toString(),
      totalOwed: totalOwed.toString(),
      totalTreatments: revenue._count.id,
      paymentBreakdown: paymentBreakdown.map((item) => ({
        status: item.paymentStatus,
        count: item._count.id,
        totalAmount: item._sum.amount?.toString() || '0',
        amountPaid: item._sum.amountPaid?.toString() || '0',
      })),
    };
  }
}
