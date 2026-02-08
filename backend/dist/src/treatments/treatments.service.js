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
exports.TreatmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../common/services/audit-log.service");
const activity_log_service_1 = require("../common/services/activity-log.service");
let TreatmentsService = class TreatmentsService {
    prisma;
    auditLogService;
    activityLogService;
    constructor(prisma, auditLogService, activityLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.activityLogService = activityLogService;
    }
    async create(organizationId, vetId, dto) {
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
            throw new common_1.NotFoundException({
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
    async findAll(organizationId, page = 1, limit = 50, animalId, vetId, status, includeDeleted = false) {
        const skip = (page - 1) * limit;
        const where = {
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
    async findOne(organizationId, treatmentId) {
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
            throw new common_1.NotFoundException({
                code: 'TREATMENT_NOT_FOUND',
                message: 'Treatment record not found',
            });
        }
        return treatment;
    }
    async update(organizationId, treatmentId, vetId, dto) {
        const existingTreatment = await this.findOne(organizationId, treatmentId);
        if (existingTreatment.isDeleted) {
            throw new common_1.BadRequestException({
                code: 'TREATMENT_DELETED',
                message: 'Cannot update a deleted treatment. Restore it first.',
            });
        }
        const newVersion = await this.prisma.$transaction(async (tx) => {
            await tx.treatmentRecord.update({
                where: { id: treatmentId },
                data: { isLatestVersion: false },
            });
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
                    clinicalFindings: dto.clinicalFindings ?? existingTreatment.clinicalFindings,
                    diagnosis: dto.diagnosis ?? existingTreatment.diagnosis,
                    differentialDiagnosis: dto.differentialDiagnosis ?? existingTreatment.differentialDiagnosis,
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
                    temperatureUnit: dto.temperatureUnit ?? existingTreatment.temperatureUnit,
                    heartRate: dto.heartRate ?? existingTreatment.heartRate,
                    respiratoryRate: dto.respiratoryRate ?? existingTreatment.respiratoryRate,
                    bodyConditionScore: dto.bodyConditionScore ?? existingTreatment.bodyConditionScore,
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
    async softDelete(organizationId, treatmentId, vetId, dto) {
        const treatment = await this.findOne(organizationId, treatmentId);
        if (treatment.isDeleted) {
            throw new common_1.BadRequestException({
                code: 'ALREADY_DELETED',
                message: 'Treatment is already deleted',
            });
        }
        const animal = await this.prisma.animal.findUnique({
            where: { id: treatment.animalId },
            select: { isDeleted: true },
        });
        if (animal?.isDeleted) {
            throw new common_1.BadRequestException({
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
    async restore(organizationId, treatmentId, vetId) {
        const treatment = await this.findOne(organizationId, treatmentId);
        if (!treatment.isDeleted) {
            throw new common_1.BadRequestException({
                code: 'NOT_DELETED',
                message: 'Treatment is not deleted',
            });
        }
        const animal = await this.prisma.animal.findUnique({
            where: { id: treatment.animalId },
            select: { isDeleted: true },
        });
        if (animal?.isDeleted) {
            throw new common_1.BadRequestException({
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
    async getVersions(organizationId, treatmentId) {
        const treatment = await this.findOne(organizationId, treatmentId);
        const rootId = treatment.parentRecordId
            ? await this.findRootRecord(treatment.parentRecordId)
            : treatmentId;
        const versions = await this.prisma.treatmentRecord.findMany({
            where: {
                OR: [
                    { id: rootId },
                    { parentRecordId: rootId },
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
    async findRootRecord(recordId) {
        const record = await this.prisma.treatmentRecord.findUnique({
            where: { id: recordId },
            select: { parentRecordId: true },
        });
        if (!record?.parentRecordId) {
            return recordId;
        }
        return this.findRootRecord(record.parentRecordId);
    }
    async getAllChildIds(rootId) {
        const children = await this.prisma.treatmentRecord.findMany({
            where: { parentRecordId: rootId },
            select: { id: true },
        });
        return children.map((c) => c.id);
    }
};
exports.TreatmentsService = TreatmentsService;
exports.TreatmentsService = TreatmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        activity_log_service_1.ActivityLogService])
], TreatmentsService);
//# sourceMappingURL=treatments.service.js.map