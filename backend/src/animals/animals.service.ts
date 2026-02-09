import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { RecordDeathDto } from './dto/record-death.dto';
import { DeleteAnimalDto } from './dto/delete-animal.dto';
import { AuditLogService } from '../common/services/audit-log.service';
import { ActivityLogService } from '../common/services/activity-log.service';

@Injectable()
export class AnimalsService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
    private activityLogService: ActivityLogService,
  ) {}

  async create(organizationId: string, vetId: string, dto: CreateAnimalDto) {
    // Verify client exists and belongs to organization
    const client = await this.prisma.client.findFirst({
      where: {
        id: dto.clientId,
        organizationId,
        isDeleted: false,
      },
    });

    if (!client) {
      throw new NotFoundException({
        code: 'CLIENT_NOT_FOUND',
        message: 'Client not found or deleted',
      });
    }

    // Validate batch livestock fields
    if (dto.patientType === 'BATCH_LIVESTOCK') {
      if (!dto.batchName || !dto.batchSize) {
        throw new BadRequestException({
          code: 'BATCH_FIELDS_REQUIRED',
          message:
            'Batch name and batch size are required for batch livestock',
        });
      }
    }

    // Check microchip uniqueness within organization
    if (dto.microchipNumber) {
      const existingMicrochip = await this.prisma.animal.findFirst({
        where: {
          organizationId,
          microchipNumber: dto.microchipNumber,
          isDeleted: false,
        },
      });

      if (existingMicrochip) {
        throw new ConflictException({
          code: 'MICROCHIP_EXISTS',
          message:
            'This microchip number is already registered in your organization',
        });
      }
    }

    // Create animal and optionally add treatment history in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const animal = await tx.animal.create({
        data: {
          organizationId,
          clientId: dto.clientId,
          createdBy: vetId,
          name: dto.name,
          species: dto.species,
          breed: dto.breed,
          color: dto.color,
          gender: dto.gender,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          approximateAge: dto.approximateAge,
          weight: dto.weight,
          weightUnit: dto.weightUnit,
          microchipNumber: dto.microchipNumber,
          identifyingMarks: dto.identifyingMarks,
          photoUrl: dto.photoUrl,
          notes: dto.notes,
          patientType: dto.patientType || 'SINGLE_PET',
          batchName: dto.batchName,
          batchSize: dto.batchSize,
          batchIdentifier: dto.batchIdentifier,
        },
      });

      // Import treatment history if provided
      if (dto.treatmentHistory && dto.treatmentHistory.length > 0) {
        const treatmentRecords = dto.treatmentHistory.map((history) => ({
          organizationId,
          animalId: animal.id,
          vetId,
          version: 1,
          isLatestVersion: true,
          visitDate: new Date(history.visitDate),
          chiefComplaint: history.chiefComplaint,
          diagnosis: history.diagnosis,
          treatmentGiven: history.treatmentGiven,
          notes: history.notes,
          status: 'COMPLETED' as const,
        }));

        await tx.treatmentRecord.createMany({
          data: treatmentRecords,
        });
      }

      return animal;
    });

    await this.auditLogService.log({
      vetId,
      action: 'animal.created',
      entityType: 'animal',
      entityId: result.id,
      metadata: {
        organizationId,
        clientId: dto.clientId,
        animalName: result.name,
        species: result.species,
        patientType: result.patientType,
        batchSize: result.batchSize,
        treatmentHistoryCount: dto.treatmentHistory?.length || 0,
      },
    });

    await this.activityLogService.log({
      organizationId,
      vetId,
      action: 'animal.created',
      entityType: 'animal',
      entityId: result.id,
      description:
        result.patientType === 'BATCH_LIVESTOCK'
          ? `Registered batch livestock: ${result.batchName} (${result.batchSize} ${result.species.toLowerCase()}) for ${client.firstName} ${client.lastName}`
          : `Registered ${result.species.toLowerCase()}: ${result.name} for ${client.firstName} ${client.lastName}`,
    });

    return result;
  }

  async findAll(
    organizationId: string,
    page: number = 1,
    limit: number = 50,
    search?: string,
    species?: string,
    clientId?: string,
    includeDeleted: boolean = false,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
      isDeleted: includeDeleted ? undefined : false,
    };

    if (clientId) {
      where.clientId = clientId;
    }

    if (species) {
      where.species = species;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { breed: { contains: search, mode: 'insensitive' } },
        { microchipNumber: { contains: search } },
      ];
    }

    const [animals, total] = await Promise.all([
      this.prisma.animal.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
          _count: {
            select: { treatments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.animal.count({ where }),
    ]);

    return {
      animals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(organizationId: string, animalId: string) {
    const animal = await this.prisma.animal.findFirst({
      where: {
        id: animalId,
        organizationId,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        deleter: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: { treatments: true },
        },
      },
    });

    if (!animal) {
      throw new NotFoundException({
        code: 'ANIMAL_NOT_FOUND',
        message: 'Animal not found',
      });
    }

    return animal;
  }

  async update(
    organizationId: string,
    animalId: string,
    vetId: string,
    dto: UpdateAnimalDto,
  ) {
    const animal = await this.findOne(organizationId, animalId);

    if (animal.isDeleted) {
      throw new BadRequestException({
        code: 'ANIMAL_DELETED',
        message: 'Cannot update a deleted animal. Restore it first.',
      });
    }

    // Check microchip uniqueness if being updated
    if (dto.microchipNumber && dto.microchipNumber !== animal.microchipNumber) {
      const existingMicrochip = await this.prisma.animal.findFirst({
        where: {
          organizationId,
          microchipNumber: dto.microchipNumber,
          isDeleted: false,
          id: { not: animalId },
        },
      });

      if (existingMicrochip) {
        throw new ConflictException({
          code: 'MICROCHIP_EXISTS',
          message: 'This microchip number is already registered',
        });
      }
    }

    const updatedAnimal = await this.prisma.animal.update({
      where: { id: animalId },
      data: {
        name: dto.name,
        species: dto.species,
        breed: dto.breed,
        color: dto.color,
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        approximateAge: dto.approximateAge,
        weight: dto.weight,
        weightUnit: dto.weightUnit,
        microchipNumber: dto.microchipNumber,
        identifyingMarks: dto.identifyingMarks,
        photoUrl: dto.photoUrl,
        notes: dto.notes,
        isActive: dto.isActive,
      },
    });

    await this.auditLogService.log({
      vetId,
      action: 'animal.updated',
      entityType: 'animal',
      entityId: animalId,
      metadata: { organizationId, changes: dto },
    });

    await this.activityLogService.log({
      organizationId,
      vetId,
      action: 'animal.updated',
      entityType: 'animal',
      entityId: animalId,
      description: `Updated ${updatedAnimal.species.toLowerCase()}: ${updatedAnimal.name}`,
    });

    return updatedAnimal;
  }

  async softDelete(
    organizationId: string,
    animalId: string,
    vetId: string,
    dto: DeleteAnimalDto,
  ) {
    const animal = await this.findOne(organizationId, animalId);

    if (animal.isDeleted) {
      throw new BadRequestException({
        code: 'ALREADY_DELETED',
        message: 'Animal is already deleted',
      });
    }

    // Check if parent client is deleted
    const client = await this.prisma.client.findUnique({
      where: { id: animal.clientId },
      select: { isDeleted: true },
    });

    if (client?.isDeleted) {
      throw new BadRequestException({
        code: 'PARENT_DELETED',
        message: 'Cannot delete animal: parent client is deleted',
      });
    }

    // Cascade soft delete to treatments
    await this.prisma.$transaction(async (tx) => {
      await tx.treatmentRecord.updateMany({
        where: {
          animalId,
          isDeleted: false,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: vetId,
          deletionReason: `Cascade delete from animal: ${dto.reason}`,
        },
      });

      await tx.animal.update({
        where: { id: animalId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: vetId,
          deletionReason: dto.reason,
        },
      });
    });

    const treatmentCount = await this.prisma.treatmentRecord.count({
      where: { animalId, isDeleted: true, deletedBy: vetId },
    });

    await this.auditLogService.log({
      vetId,
      action: 'animal.deleted',
      entityType: 'animal',
      entityId: animalId,
      metadata: {
        organizationId,
        reason: dto.reason,
        cascadedTreatments: treatmentCount,
      },
    });

    await this.activityLogService.log({
      organizationId,
      vetId,
      action: 'animal.deleted',
      entityType: 'animal',
      entityId: animalId,
      description: `Deleted ${animal.species.toLowerCase()}: ${animal.name} (Reason: ${dto.reason})`,
    });

    return {
      message: 'Animal and related treatments successfully deleted',
      deletedAnimal: animalId,
      cascadedTreatments: treatmentCount,
    };
  }

  async restore(organizationId: string, animalId: string, vetId: string) {
    const animal = await this.findOne(organizationId, animalId);

    if (!animal.isDeleted) {
      throw new BadRequestException({
        code: 'NOT_DELETED',
        message: 'Animal is not deleted',
      });
    }

    // Check if parent client is deleted
    const client = await this.prisma.client.findUnique({
      where: { id: animal.clientId },
      select: { isDeleted: true },
    });

    if (client?.isDeleted) {
      throw new BadRequestException({
        code: 'PARENT_DELETED',
        message: 'Cannot restore animal: parent client is still deleted',
      });
    }

    const restoredAnimal = await this.prisma.animal.update({
      where: { id: animalId },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        deletionReason: null,
      },
    });

    await this.auditLogService.log({
      vetId,
      action: 'animal.restored',
      entityType: 'animal',
      entityId: animalId,
      metadata: { organizationId },
    });

    await this.activityLogService.log({
      organizationId,
      vetId,
      action: 'animal.restored',
      entityType: 'animal',
      entityId: animalId,
      description: `Restored ${restoredAnimal.species.toLowerCase()}: ${restoredAnimal.name}`,
    });

    return restoredAnimal;
  }

  async recordDeath(
    organizationId: string,
    animalId: string,
    vetId: string,
    dto: RecordDeathDto,
  ) {
    const animal = await this.findOne(organizationId, animalId);

    if (animal.isDeleted) {
      throw new BadRequestException({
        code: 'ANIMAL_DELETED',
        message: 'Cannot record death for deleted animal',
      });
    }

    if (!animal.isAlive) {
      throw new BadRequestException({
        code: 'ALREADY_DECEASED',
        message: 'Animal is already marked as deceased',
      });
    }

    const updatedAnimal = await this.prisma.animal.update({
      where: { id: animalId },
      data: {
        isAlive: false,
        dateOfDeath: new Date(dto.dateOfDeath),
        causeOfDeath: dto.causeOfDeath,
      },
    });

    await this.auditLogService.log({
      vetId,
      action: 'animal.death_recorded',
      entityType: 'animal',
      entityId: animalId,
      metadata: {
        organizationId,
        dateOfDeath: dto.dateOfDeath,
        causeOfDeath: dto.causeOfDeath,
      },
    });

    await this.activityLogService.log({
      organizationId,
      vetId,
      action: 'animal.death_recorded',
      entityType: 'animal',
      entityId: animalId,
      description: `Recorded death of ${animal.species.toLowerCase()}: ${animal.name}`,
    });

    return updatedAnimal;
  }

  async getTreatmentHistory(organizationId: string, animalId: string) {
    // Verify animal exists
    await this.findOne(organizationId, animalId);

    return this.prisma.treatmentRecord.findMany({
      where: {
        animalId,
        isDeleted: false,
        isLatestVersion: true,
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
      orderBy: { visitDate: 'desc' },
    });
  }
}
