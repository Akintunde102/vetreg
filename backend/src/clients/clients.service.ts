import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { DeleteClientDto } from './dto/delete-client.dto';
import { AuditLogService } from '../common/services/audit-log.service';
import { ActivityLogService } from '../common/services/activity-log.service';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
    private activityLogService: ActivityLogService,
  ) {}

  async create(
    organizationId: string,
    vetId: string,
    dto: CreateClientDto,
  ) {
    const client = await this.prisma.client.create({
      data: {
        organizationId,
        createdBy: vetId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        alternatePhone: dto.alternatePhone,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        notes: dto.notes,
      },
    });

    await this.auditLogService.log({
      vetId,
      action: 'client.created',
      entityType: 'client',
      entityId: client.id,
      metadata: {
        organizationId,
        clientName: `${client.firstName} ${client.lastName}`,
      },
    });

    await this.activityLogService.log({
      organizationId,
      vetId,
      action: 'client.created',
      entityType: 'client',
      entityId: client.id,
      description: `Created client: ${client.firstName} ${client.lastName}`,
    });

    return client;
  }

  async findAll(
    organizationId: string,
    page: number = 1,
    limit: number = 50,
    search?: string,
    includeDeleted: boolean = false,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
      isDeleted: includeDeleted ? undefined : false,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
      ];
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        include: {
          _count: {
            select: { animals: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(organizationId: string, clientId: string) {
    const client = await this.prisma.client.findFirst({
      where: {
        id: clientId,
        organizationId,
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        animals: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            isAlive: true,
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

    if (!client) {
      throw new NotFoundException({
        code: 'CLIENT_NOT_FOUND',
        message: 'Client not found',
      });
    }

    return client;
  }

  async update(
    organizationId: string,
    clientId: string,
    vetId: string,
    dto: UpdateClientDto,
  ) {
    const client = await this.findOne(organizationId, clientId);

    if (client.isDeleted) {
      throw new BadRequestException({
        code: 'CLIENT_DELETED',
        message: 'Cannot update a deleted client. Restore it first.',
      });
    }

    const updatedClient = await this.prisma.client.update({
      where: { id: clientId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        alternatePhone: dto.alternatePhone,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        notes: dto.notes,
        isActive: dto.isActive,
      },
    });

    await this.auditLogService.log({
      vetId,
      action: 'client.updated',
      entityType: 'client',
      entityId: clientId,
      metadata: { organizationId, changes: dto },
    });

    await this.activityLogService.log({
      organizationId,
      vetId,
      action: 'client.updated',
      entityType: 'client',
      entityId: clientId,
      description: `Updated client: ${updatedClient.firstName} ${updatedClient.lastName}`,
    });

    return updatedClient;
  }

  async softDelete(
    organizationId: string,
    clientId: string,
    vetId: string,
    dto: DeleteClientDto,
  ) {
    const client = await this.findOne(organizationId, clientId);

    if (client.isDeleted) {
      throw new BadRequestException({
        code: 'ALREADY_DELETED',
        message: 'Client is already deleted',
      });
    }

    // Cascade soft delete to animals and their treatments
    const animalsToDelete = await this.prisma.animal.findMany({
      where: {
        clientId,
        isDeleted: false,
      },
      select: { id: true },
    });

    const animalIds = animalsToDelete.map((a) => a.id);

    // Start transaction for atomic cascade delete
    await this.prisma.$transaction(async (tx) => {
      // Soft delete treatments
      await tx.treatmentRecord.updateMany({
        where: {
          animalId: { in: animalIds },
          isDeleted: false,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: vetId,
          deletionReason: `Cascade delete from client: ${dto.reason}`,
        },
      });

      // Soft delete animals
      await tx.animal.updateMany({
        where: {
          clientId,
          isDeleted: false,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: vetId,
          deletionReason: `Cascade delete from client: ${dto.reason}`,
        },
      });

      // Soft delete client
      await tx.client.update({
        where: { id: clientId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: vetId,
          deletionReason: dto.reason,
        },
      });
    });

    await this.auditLogService.log({
      vetId,
      action: 'client.deleted',
      entityType: 'client',
      entityId: clientId,
      metadata: {
        organizationId,
        reason: dto.reason,
        cascadedAnimals: animalIds.length,
      },
    });

    await this.activityLogService.log({
      organizationId,
      vetId,
      action: 'client.deleted',
      entityType: 'client',
      entityId: clientId,
      description: `Deleted client: ${client.firstName} ${client.lastName} (Reason: ${dto.reason})`,
    });

    return {
      message: 'Client and related data successfully deleted',
      deletedClient: clientId,
      cascadedAnimals: animalIds.length,
    };
  }

  async restore(organizationId: string, clientId: string, vetId: string) {
    const client = await this.findOne(organizationId, clientId);

    if (!client.isDeleted) {
      throw new BadRequestException({
        code: 'NOT_DELETED',
        message: 'Client is not deleted',
      });
    }

    const restoredClient = await this.prisma.client.update({
      where: { id: clientId },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        deletionReason: null,
      },
    });

    await this.auditLogService.log({
      vetId,
      action: 'client.restored',
      entityType: 'client',
      entityId: clientId,
      metadata: { organizationId },
    });

    await this.activityLogService.log({
      organizationId,
      vetId,
      action: 'client.restored',
      entityType: 'client',
      entityId: clientId,
      description: `Restored client: ${restoredClient.firstName} ${restoredClient.lastName}`,
    });

    return restoredClient;
  }

  async getClientAnimals(organizationId: string, clientId: string) {
    // Verify client exists
    await this.findOne(organizationId, clientId);

    return this.prisma.animal.findMany({
      where: {
        clientId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
