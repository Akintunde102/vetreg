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
exports.AnimalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../common/services/audit-log.service");
const activity_log_service_1 = require("../common/services/activity-log.service");
let AnimalsService = class AnimalsService {
    prisma;
    auditLogService;
    activityLogService;
    constructor(prisma, auditLogService, activityLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.activityLogService = activityLogService;
    }
    async create(organizationId, vetId, dto) {
        const client = await this.prisma.client.findFirst({
            where: {
                id: dto.clientId,
                organizationId,
                isDeleted: false,
            },
        });
        if (!client) {
            throw new common_1.NotFoundException({
                code: 'CLIENT_NOT_FOUND',
                message: 'Client not found or deleted',
            });
        }
        if (dto.microchipNumber) {
            const existingMicrochip = await this.prisma.animal.findFirst({
                where: {
                    organizationId,
                    microchipNumber: dto.microchipNumber,
                    isDeleted: false,
                },
            });
            if (existingMicrochip) {
                throw new common_1.ConflictException({
                    code: 'MICROCHIP_EXISTS',
                    message: 'This microchip number is already registered in your organization',
                });
            }
        }
        const animal = await this.prisma.animal.create({
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
            },
        });
        await this.auditLogService.log({
            vetId,
            action: 'animal.created',
            entityType: 'animal',
            entityId: animal.id,
            metadata: {
                organizationId,
                clientId: dto.clientId,
                animalName: animal.name,
                species: animal.species,
            },
        });
        await this.activityLogService.log({
            organizationId,
            vetId,
            action: 'animal.created',
            entityType: 'animal',
            entityId: animal.id,
            description: `Registered ${animal.species.toLowerCase()}: ${animal.name} for ${client.firstName} ${client.lastName}`,
        });
        return animal;
    }
    async findAll(organizationId, page = 1, limit = 50, search, species, clientId, includeDeleted = false) {
        const skip = (page - 1) * limit;
        const where = {
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
    async findOne(organizationId, animalId) {
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
            throw new common_1.NotFoundException({
                code: 'ANIMAL_NOT_FOUND',
                message: 'Animal not found',
            });
        }
        return animal;
    }
    async update(organizationId, animalId, vetId, dto) {
        const animal = await this.findOne(organizationId, animalId);
        if (animal.isDeleted) {
            throw new common_1.BadRequestException({
                code: 'ANIMAL_DELETED',
                message: 'Cannot update a deleted animal. Restore it first.',
            });
        }
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
                throw new common_1.ConflictException({
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
    async softDelete(organizationId, animalId, vetId, dto) {
        const animal = await this.findOne(organizationId, animalId);
        if (animal.isDeleted) {
            throw new common_1.BadRequestException({
                code: 'ALREADY_DELETED',
                message: 'Animal is already deleted',
            });
        }
        const client = await this.prisma.client.findUnique({
            where: { id: animal.clientId },
            select: { isDeleted: true },
        });
        if (client?.isDeleted) {
            throw new common_1.BadRequestException({
                code: 'PARENT_DELETED',
                message: 'Cannot delete animal: parent client is deleted',
            });
        }
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
    async restore(organizationId, animalId, vetId) {
        const animal = await this.findOne(organizationId, animalId);
        if (!animal.isDeleted) {
            throw new common_1.BadRequestException({
                code: 'NOT_DELETED',
                message: 'Animal is not deleted',
            });
        }
        const client = await this.prisma.client.findUnique({
            where: { id: animal.clientId },
            select: { isDeleted: true },
        });
        if (client?.isDeleted) {
            throw new common_1.BadRequestException({
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
    async recordDeath(organizationId, animalId, vetId, dto) {
        const animal = await this.findOne(organizationId, animalId);
        if (animal.isDeleted) {
            throw new common_1.BadRequestException({
                code: 'ANIMAL_DELETED',
                message: 'Cannot record death for deleted animal',
            });
        }
        if (!animal.isAlive) {
            throw new common_1.BadRequestException({
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
    async getTreatmentHistory(organizationId, animalId) {
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
};
exports.AnimalsService = AnimalsService;
exports.AnimalsService = AnimalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        activity_log_service_1.ActivityLogService])
], AnimalsService);
//# sourceMappingURL=animals.service.js.map