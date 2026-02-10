import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { AuditLogService } from '../common/services/audit-log.service';
import { VetStatus } from '@prisma/client';

@Injectable()
export class VetsService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
    private configService: ConfigService,
  ) {}

  async completeProfile(vetId: string, dto: CompleteProfileDto) {
    const vet = await this.prisma.vet.findUnique({
      where: { id: vetId },
    });

    if (!vet) {
      throw new NotFoundException({
        code: 'VET_NOT_FOUND',
        message: 'Vet not found',
      });
    }

    if (vet.profileCompleted) {
      throw new BadRequestException({
        code: 'PROFILE_ALREADY_COMPLETED',
        message: 'Profile has already been completed',
      });
    }

    // Check for duplicate VCN
    const existingVcn = await this.prisma.vet.findUnique({
      where: { vcnNumber: dto.vcnNumber },
    });

    if (existingVcn && existingVcn.id !== vetId) {
      throw new ConflictException({
        code: 'VCN_ALREADY_EXISTS',
        message: 'This Veterinary Council Number is already registered',
      });
    }

    const updatedVet = await this.prisma.vet.update({
      where: { id: vetId },
      data: {
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        gender: dto.gender,
        vcnNumber: dto.vcnNumber,
        specialization: dto.specialization,
        yearsOfExperience: dto.yearsOfExperience,
        qualifications: dto.qualifications || [],
        universityAttended: dto.universityAttended,
        graduationYear: dto.graduationYear,
        practiceAddress: dto.practiceAddress,
        city: dto.city,
        state: dto.state,
        country: dto.country || 'NG',
        practiceType: dto.practiceType,
        profileCompleted: true,
        profileSubmittedAt: new Date(),
      },
    });

    // Log the profile completion
    await this.auditLogService.log({
      vetId,
      action: 'vet.profile_completed',
      entityType: 'vet',
      entityId: vetId,
      metadata: { vcnNumber: dto.vcnNumber },
    });

    return updatedVet;
  }

  async getProfile(vetId: string) {
    const vet = await this.prisma.vet.findUnique({
      where: { id: vetId },
    });

    if (!vet) {
      throw new NotFoundException({
        code: 'VET_NOT_FOUND',
        message: 'Vet not found',
      });
    }

    const masterAdminEmails: string[] =
      this.configService.get<string[]>('masterAdminEmails') ?? [];
    const emailInList =
      vet.email &&
      masterAdminEmails.includes(vet.email.trim().toLowerCase());

    return {
      ...vet,
      isMasterAdmin: vet.isMasterAdmin || emailInList,
    };
  }

  async getApprovalStatus(vetId: string) {
    const vet = await this.prisma.vet.findUnique({
      where: { id: vetId },
      select: {
        id: true,
        status: true,
        profileCompleted: true,
        profileSubmittedAt: true,
        approvedAt: true,
        rejectedAt: true,
        rejectionReason: true,
        suspendedAt: true,
        suspensionReason: true,
      },
    });

    if (!vet) {
      throw new NotFoundException({
        code: 'VET_NOT_FOUND',
        message: 'Vet not found',
      });
    }

    return vet;
  }

  async getPendingApprovals() {
    return this.prisma.vet.findMany({
      where: {
        status: VetStatus.PENDING_APPROVAL,
        profileCompleted: true,
      },
      orderBy: { profileSubmittedAt: 'asc' },
    });
  }

  async approveVet(adminId: string, vetId: string) {
    const vet = await this.prisma.vet.findUnique({
      where: { id: vetId },
    });

    if (!vet) {
      throw new NotFoundException({
        code: 'VET_NOT_FOUND',
        message: 'Vet not found',
      });
    }

    if (vet.status !== VetStatus.PENDING_APPROVAL) {
      throw new BadRequestException({
        code: 'VET_NOT_PENDING',
        message: 'Vet is not pending approval',
        details: { currentStatus: vet.status },
      });
    }

    const updatedVet = await this.prisma.vet.update({
      where: { id: vetId },
      data: {
        status: VetStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });

    await this.auditLogService.log({
      vetId: adminId,
      action: 'vet.approved',
      entityType: 'vet',
      entityId: vetId,
      metadata: { approvedVetEmail: vet.email },
    });

    // TODO: Send approval notification

    return updatedVet;
  }

  async rejectVet(adminId: string, vetId: string, reason: string) {
    const vet = await this.prisma.vet.findUnique({
      where: { id: vetId },
    });

    if (!vet) {
      throw new NotFoundException({
        code: 'VET_NOT_FOUND',
        message: 'Vet not found',
      });
    }

    if (vet.status !== VetStatus.PENDING_APPROVAL) {
      throw new BadRequestException({
        code: 'VET_NOT_PENDING',
        message: 'Vet is not pending approval',
        details: { currentStatus: vet.status },
      });
    }

    const updatedVet = await this.prisma.vet.update({
      where: { id: vetId },
      data: {
        status: VetStatus.REJECTED,
        rejectedAt: new Date(),
        rejectedBy: adminId,
        rejectionReason: reason,
      },
    });

    await this.auditLogService.log({
      vetId: adminId,
      action: 'vet.rejected',
      entityType: 'vet',
      entityId: vetId,
      metadata: { rejectedVetEmail: vet.email, reason },
    });

    // TODO: Send rejection notification

    return updatedVet;
  }

  async suspendVet(adminId: string, vetId: string, reason: string) {
    const vet = await this.prisma.vet.findUnique({
      where: { id: vetId },
    });

    if (!vet) {
      throw new NotFoundException({
        code: 'VET_NOT_FOUND',
        message: 'Vet not found',
      });
    }

    if (vet.status === VetStatus.SUSPENDED) {
      throw new BadRequestException({
        code: 'VET_ALREADY_SUSPENDED',
        message: 'Vet is already suspended',
      });
    }

    const updatedVet = await this.prisma.vet.update({
      where: { id: vetId },
      data: {
        status: VetStatus.SUSPENDED,
        suspendedAt: new Date(),
        suspendedBy: adminId,
        suspensionReason: reason,
      },
    });

    await this.auditLogService.log({
      vetId: adminId,
      action: 'vet.suspended',
      entityType: 'vet',
      entityId: vetId,
      metadata: { suspendedVetEmail: vet.email, reason },
    });

    // TODO: Send suspension notification

    return updatedVet;
  }

  async reactivateVet(adminId: string, vetId: string) {
    const vet = await this.prisma.vet.findUnique({
      where: { id: vetId },
    });

    if (!vet) {
      throw new NotFoundException({
        code: 'VET_NOT_FOUND',
        message: 'Vet not found',
      });
    }

    if (vet.status !== VetStatus.SUSPENDED) {
      throw new BadRequestException({
        code: 'VET_NOT_SUSPENDED',
        message: 'Vet is not suspended',
        details: { currentStatus: vet.status },
      });
    }

    const updatedVet = await this.prisma.vet.update({
      where: { id: vetId },
      data: {
        status: VetStatus.APPROVED,
        reactivatedAt: new Date(),
        reactivatedBy: adminId,
        suspendedAt: null,
        suspensionReason: null,
      },
    });

    await this.auditLogService.log({
      vetId: adminId,
      action: 'vet.reactivated',
      entityType: 'vet',
      entityId: vetId,
      metadata: { reactivatedVetEmail: vet.email },
    });

    // TODO: Send reactivation notification

    return updatedVet;
  }
}
