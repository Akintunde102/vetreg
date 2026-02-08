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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../common/services/audit-log.service");
const activity_log_service_1 = require("../common/services/activity-log.service");
let ClientsService = class ClientsService {
    prisma;
    auditLogService;
    activityLogService;
    constructor(prisma, auditLogService, activityLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.activityLogService = activityLogService;
    }
    async create(organizationId, vetId, dto) {
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
    async findAll(organizationId, page = 1, limit = 50, search, includeDeleted = false) {
        const skip = (page - 1) * limit;
        const where = {
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
    async findOne(organizationId, clientId) {
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
            throw new common_1.NotFoundException({
                code: 'CLIENT_NOT_FOUND',
                message: 'Client not found',
            });
        }
        return client;
    }
    async update(organizationId, clientId, vetId, dto) {
        const client = await this.findOne(organizationId, clientId);
        if (client.isDeleted) {
            throw new common_1.BadRequestException({
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
    async softDelete(organizationId, clientId, vetId, dto) {
        const client = await this.findOne(organizationId, clientId);
        if (client.isDeleted) {
            throw new common_1.BadRequestException({
                code: 'ALREADY_DELETED',
                message: 'Client is already deleted',
            });
        }
        const animalsToDelete = await this.prisma.animal.findMany({
            where: {
                clientId,
                isDeleted: false,
            },
            select: { id: true },
        });
        const animalIds = animalsToDelete.map((a) => a.id);
        await this.prisma.$transaction(async (tx) => {
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
    async restore(organizationId, clientId, vetId) {
        const client = await this.findOne(organizationId, clientId);
        if (!client.isDeleted) {
            throw new common_1.BadRequestException({
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
    async getClientAnimals(organizationId, clientId) {
        await this.findOne(organizationId, clientId);
        return this.prisma.animal.findMany({
            where: {
                clientId,
                isDeleted: false,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        activity_log_service_1.ActivityLogService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map