import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { DeleteTreatmentDto } from './dto/delete-treatment.dto';
import { MarkPaymentDto } from './dto/mark-payment.dto';
import { AuditLogService } from '../common/services/audit-log.service';
import { ActivityLogService } from '../common/services/activity-log.service';

@Injectable()
export class TreatmentsService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
    private activityLogService: ActivityLogService,
  ) {}

  async create(
    organizationId: string,
    vetId: string,
    dto: CreateTreatmentDto,
  ) {
    // Verify animal exists and belongs to organization
    const animal = await this.prisma.animal.findFirst({
      where: {
        id: dto.animalId,
        organizationId,
        isDeleted: false,
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!animal) {
      throw new NotFoundException({
        code: 'ANIMAL_NOT_FOUND',
        message: 'Animal not found or deleted',
      });
    }

    const treatment = await this.prisma.treatmentRecord.create({
      data: {
        organizationId,
        animalId: dto.animalId,
        vetId,
        version: 1,
        isLatestVersion: true,
        visitDate: new Date(dto.visitDate),
        chiefComplaint: dto.chiefComplaint,
        history: dto.history,
        clinicalFindings: dto.clinicalFindings,
        diagnosis: dto.diagnosis,
        differentialDiagnosis: dto.differentialDiagnosis,
        treatmentGiven: dto.treatmentGiven,
        prescriptions: dto.prescriptions,
        procedures: dto.procedures,
        labResults: dto.labResults,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : null,
        followUpNotes: dto.followUpNotes,
        weight: dto.weight,
        weightUnit: dto.weightUnit,
        temperature: dto.temperature,
        temperatureUnit: dto.temperatureUnit,
        heartRate: dto.heartRate,
        respiratoryRate: dto.respiratoryRate,
        bodyConditionScore: dto.bodyConditionScore,
        attachments: dto.attachments,
        notes: dto.notes,
        status: dto.status || 'COMPLETED',
        isScheduled: dto.isScheduled || false,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
        amount: dto.amount,
        currency: dto.currency || 'NGN',
        paymentStatus: dto.paymentStatus,
        paymentNotes: dto.paymentNotes,
      },
    });

    await this.auditLogService.log({
      vetId,
      action: 'treatment.created',
      entityType: 'treatment',
      entityId: treatment.id,
      metadata: {
        organizationId,
        animalId: dto.animalId,
        diagnosis: dto.diagnosis,
      },
    });

    await this.activityLogService.log({
      organizationId,
      vetId,
      action: 'treatment.created',
      entityType: 'treatment',
      entityId: treatment.id,
      description: `Created treatment record for ${animal.name} (${animal.client.firstName} ${animal.client.lastName})`,
    });

    return treatment;
  }

  async findAll(
    organizationId: string,
    page: number = 1,
    limit: number = 50,
    animalId?: string,
    vetId?: string,
    status?: string,
    paymentCategory?: string,
    paymentStatus?: string,
    includeDeleted: boolean = false,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
      isDeleted: includeDeleted ? undefined : false,
      isLatestVersion: true,
    };

    if (animalId) {
      where.animalId = animalId;
    }

    if (vetId) {
      where.vetId = vetId;
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    // Filter by patient type based on payment category
    if (paymentCategory && paymentCategory !== 'ALL') {
      const patientTypeMap: Record<string, string> = {
        'PET': 'SINGLE_PET',
        'LIVESTOCK': 'SINGLE_LIVESTOCK',
        'FARM': 'BATCH_LIVESTOCK',
      };
      
      const patientType = patientTypeMap[paymentCategory];
      if (patientType) {
        where.animal = {
          patientType,
        };
      }
    }

    const [treatments, total] = await Promise.all([
      this.prisma.treatmentRecord.findMany({
        where,
        include: {
          animal: {
            select: {
              id: true,
              name: true,
              species: true,
              patientType: true,
              batchIdentifier: true,
              batchSize: true,
              client: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          vet: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { visitDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.treatmentRecord.count({ where }),
    ]);

    return {
      treatments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(organizationId: string, treatmentId: string) {
    const treatment = await this.prisma.treatmentRecord.findFirst({
      where: {
        id: treatmentId,
        organizationId,
      },
      include: {
        animal: {
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
              },
            },
          },
        },
        vet: {
          select: {
            id: true,
            fullName: true,
            email: true,
            specialization: true,
          },
        },
        deleter: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!treatment) {
      throw new NotFoundException({
        code: 'TREATMENT_NOT_FOUND',
        message: 'Treatment record not found',
      });
    }

    return treatment;
  }

  async update(
    organizationId: string,
    treatmentId: string,
    vetId: string,
    dto: UpdateTreatmentDto,
  ) {
    const existingTreatment = await this.findOne(organizationId, treatmentId);

    if (existingTreatment.isDeleted) {
      throw new BadRequestException({
        code: 'TREATMENT_DELETED',
        message: 'Cannot update a deleted treatment. Restore it first.',
      });
    }

    // Create new version (immutability principle)
    const newVersion = await this.prisma.$transaction(async (tx) => {
      // Mark current version as not latest
      await tx.treatmentRecord.update({
        where: { id: treatmentId },
        data: { isLatestVersion: false },
      });

      // Create new version
      const newVersionNumber = existingTreatment.version + 1;

      return tx.treatmentRecord.create({
        data: {
          organizationId,
          animalId: existingTreatment.animalId,
          vetId,
          version: newVersionNumber,
          parentRecordId: treatmentId,
          isLatestVersion: true,
          visitDate: dto.visitDate
            ? new Date(dto.visitDate)
            : existingTreatment.visitDate,
          chiefComplaint: dto.chiefComplaint ?? existingTreatment.chiefComplaint,
          history: dto.history ?? existingTreatment.history,
          clinicalFindings:
            dto.clinicalFindings ?? existingTreatment.clinicalFindings,
          diagnosis: dto.diagnosis ?? existingTreatment.diagnosis,
          differentialDiagnosis:
            dto.differentialDiagnosis ?? existingTreatment.differentialDiagnosis,
          treatmentGiven: dto.treatmentGiven ?? existingTreatment.treatmentGiven,
          prescriptions: dto.prescriptions ?? existingTreatment.prescriptions,
          procedures: dto.procedures ?? existingTreatment.procedures,
          labResults: dto.labResults ?? existingTreatment.labResults,
          followUpDate: dto.followUpDate
            ? new Date(dto.followUpDate)
            : existingTreatment.followUpDate,
          followUpNotes: dto.followUpNotes ?? existingTreatment.followUpNotes,
          weight: dto.weight ?? existingTreatment.weight,
          weightUnit: dto.weightUnit ?? existingTreatment.weightUnit,
          temperature: dto.temperature ?? existingTreatment.temperature,
          temperatureUnit:
            dto.temperatureUnit ?? existingTreatment.temperatureUnit,
          heartRate: dto.heartRate ?? existingTreatment.heartRate,
          respiratoryRate:
            dto.respiratoryRate ?? existingTreatment.respiratoryRate,
          bodyConditionScore:
            dto.bodyConditionScore ?? existingTreatment.bodyConditionScore,
          attachments: dto.attachments ?? existingTreatment.attachments,
          notes: dto.notes ?? existingTreatment.notes,
          status: dto.status ?? existingTreatment.status,
        },
      });
    });

    await this.auditLogService.log({
      vetId,
      action: 'treatment.updated',
      entityType: 'treatment',
      entityId: newVersion.id,
      metadata: {
        organizationId,
        previousVersion: treatmentId,
        newVersion: newVersion.id,
        versionNumber: newVersion.version,
        changes: dto,
      },
    });

    await this.activityLogService.log({
      organizationId,
      vetId,
      action: 'treatment.updated',
      entityType: 'treatment',
      entityId: newVersion.id,
      description: `Updated treatment record (version ${newVersion.version})`,
    });

    return newVersion;
  }

  async softDelete(
    organizationId: string,
    treatmentId: string,
    vetId: string,
    dto: DeleteTreatmentDto,
  ) {
    const treatment = await this.findOne(organizationId, treatmentId);

    if (treatment.isDeleted) {
      throw new BadRequestException({
        code: 'ALREADY_DELETED',
        message: 'Treatment is already deleted',
      });
    }

    // Check if parent animal is deleted
    const animal = await this.prisma.animal.findUnique({
      where: { id: treatment.animalId },
      select: { isDeleted: true },
    });

    if (animal?.isDeleted) {
      throw new BadRequestException({
        code: 'PARENT_DELETED',
        message: 'Cannot delete treatment: parent animal is deleted',
      });
    }

    const deletedTreatment = await this.prisma.treatmentRecord.update({
      where: { id: treatmentId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: vetId,
        deletionReason: dto.reason,
      },
    });

    await this.auditLogService.log({
      vetId,
      action: 'treatment.deleted',
      entityType: 'treatment',
      entityId: treatmentId,
      metadata: {
        organizationId,
        reason: dto.reason,
      },
    });

    await this.activityLogService.log({
      organizationId,
      vetId,
      action: 'treatment.deleted',
      entityType: 'treatment',
      entityId: treatmentId,
      description: `Deleted treatment record (Reason: ${dto.reason})`,
    });

    return deletedTreatment;
  }

  async restore(organizationId: string, treatmentId: string, vetId: string) {
    const treatment = await this.findOne(organizationId, treatmentId);

    if (!treatment.isDeleted) {
      throw new BadRequestException({
        code: 'NOT_DELETED',
        message: 'Treatment is not deleted',
      });
    }

    // Check if parent animal is deleted
    const animal = await this.prisma.animal.findUnique({
      where: { id: treatment.animalId },
      select: { isDeleted: true },
    });

    if (animal?.isDeleted) {
      throw new BadRequestException({
        code: 'PARENT_DELETED',
        message: 'Cannot restore treatment: parent animal is still deleted',
      });
    }

    const restoredTreatment = await this.prisma.treatmentRecord.update({
      where: { id: treatmentId },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        deletionReason: null,
      },
    });

    await this.auditLogService.log({
      vetId,
      action: 'treatment.restored',
      entityType: 'treatment',
      entityId: treatmentId,
      metadata: { organizationId },
    });

    await this.activityLogService.log({
      organizationId,
      vetId,
      action: 'treatment.restored',
      entityType: 'treatment',
      entityId: treatmentId,
      description: `Restored treatment record`,
    });

    return restoredTreatment;
  }

  async getVersions(organizationId: string, treatmentId: string) {
    // First get the treatment to find the root
    const treatment = await this.findOne(organizationId, treatmentId);

    // Find the root record (version 1)
    const rootId = treatment.parentRecordId
      ? await this.findRootRecord(treatment.parentRecordId)
      : treatmentId;

    // Get all versions
    const versions = await this.prisma.treatmentRecord.findMany({
      where: {
        OR: [
          { id: rootId },
          { parentRecordId: rootId },
          // Also find children of children (recursive versions)
          {
            parentRecordId: {
              in: await this.getAllChildIds(rootId),
            },
          },
        ],
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
      orderBy: { version: 'asc' },
    });

    return versions;
  }

  private async findRootRecord(recordId: string): Promise<string> {
    const record = await this.prisma.treatmentRecord.findUnique({
      where: { id: recordId },
      select: { parentRecordId: true },
    });

    if (!record?.parentRecordId) {
      return recordId;
    }

    return this.findRootRecord(record.parentRecordId);
  }

  private async getAllChildIds(rootId: string): Promise<string[]> {
    const children = await this.prisma.treatmentRecord.findMany({
      where: { parentRecordId: rootId },
      select: { id: true },
    });

    return children.map((c) => c.id);
  }

  async markPayment(
    organizationId: string,
    treatmentId: string,
    vetId: string,
    dto: MarkPaymentDto,
  ) {
    const treatment = await this.findOne(organizationId, treatmentId);

    if (treatment.isDeleted) {
      throw new BadRequestException({
        code: 'TREATMENT_DELETED',
        message: 'Cannot update payment for deleted treatment',
      });
    }

    const updatedTreatment = await this.prisma.treatmentRecord.update({
      where: { id: treatmentId },
      data: {
        paymentStatus: dto.paymentStatus,
        amountPaid: dto.amountPaid,
        paymentNotes: dto.paymentNotes,
        paidAt: dto.paymentStatus === 'PAID' ? new Date() : null,
        paidBy: dto.paymentStatus === 'PAID' ? vetId : null,
      },
    });

    await this.auditLogService.log({
      vetId,
      action: 'treatment.payment_updated',
      entityType: 'treatment',
      entityId: treatmentId,
      metadata: {
        organizationId,
        paymentStatus: dto.paymentStatus,
        amountPaid: dto.amountPaid,
      },
    });

    await this.activityLogService.log({
      organizationId,
      vetId,
      action: 'treatment.payment_updated',
      entityType: 'treatment',
      entityId: treatmentId,
      description: `Payment status updated to ${dto.paymentStatus}`,
    });

    return updatedTreatment;
  }

  async getScheduledTreatments(
    organizationId: string,
    page: number = 1,
    limit: number = 50,
    fromDate?: string,
    toDate?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
      isDeleted: false,
      isScheduled: true,
      isLatestVersion: true,
    };

    if (fromDate || toDate) {
      where.scheduledFor = {};
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        where.scheduledFor.gte = from;
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        where.scheduledFor.lte = to;
      }
    }

    const [treatments, total] = await Promise.all([
      this.prisma.treatmentRecord.findMany({
        where,
        include: {
          animal: {
            select: {
              id: true,
              name: true,
              species: true,
              client: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                },
              },
            },
          },
          vet: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { scheduledFor: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.treatmentRecord.count({ where }),
    ]);

    return {
      treatments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getScheduledToday(organizationId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const treatments = await this.prisma.treatmentRecord.findMany({
      where: {
        organizationId,
        isDeleted: false,
        isScheduled: true,
        scheduledFor: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        animal: {
          select: {
            id: true,
            name: true,
            species: true,
            photoUrl: true,
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledFor: 'asc' },
    });

    return {
      treatments,
      count: treatments.length,
    };
  }

  async getFollowUpsToday(organizationId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const treatments = await this.prisma.treatmentRecord.findMany({
      where: {
        organizationId,
        isDeleted: false,
        followUpDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        animal: {
          select: {
            id: true,
            name: true,
            species: true,
            photoUrl: true,
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
      orderBy: { followUpDate: 'asc' },
    });

    return {
      treatments,
      count: treatments.length,
    };
  }
}
