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
exports.VetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../common/services/audit-log.service");
const client_1 = require("@prisma/client");
let VetsService = class VetsService {
    prisma;
    auditLogService;
    constructor(prisma, auditLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
    }
    async completeProfile(vetId, dto) {
        const vet = await this.prisma.vet.findUnique({
            where: { id: vetId },
        });
        if (!vet) {
            throw new common_1.NotFoundException({
                code: 'VET_NOT_FOUND',
                message: 'Vet not found',
            });
        }
        if (vet.profileCompleted) {
            throw new common_1.BadRequestException({
                code: 'PROFILE_ALREADY_COMPLETED',
                message: 'Profile has already been completed',
            });
        }
        const existingVcn = await this.prisma.vet.findUnique({
            where: { vcnNumber: dto.vcnNumber },
        });
        if (existingVcn && existingVcn.id !== vetId) {
            throw new common_1.ConflictException({
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
        await this.auditLogService.log({
            vetId,
            action: 'vet.profile_completed',
            entityType: 'vet',
            entityId: vetId,
            metadata: { vcnNumber: dto.vcnNumber },
        });
        return updatedVet;
    }
    async getProfile(vetId) {
        const vet = await this.prisma.vet.findUnique({
            where: { id: vetId },
        });
        if (!vet) {
            throw new common_1.NotFoundException({
                code: 'VET_NOT_FOUND',
                message: 'Vet not found',
            });
        }
        return vet;
    }
    async getApprovalStatus(vetId) {
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
            throw new common_1.NotFoundException({
                code: 'VET_NOT_FOUND',
                message: 'Vet not found',
            });
        }
        return vet;
    }
    async getPendingApprovals() {
        return this.prisma.vet.findMany({
            where: {
                status: client_1.VetStatus.PENDING_APPROVAL,
                profileCompleted: true,
            },
            orderBy: { profileSubmittedAt: 'asc' },
        });
    }
    async approveVet(adminId, vetId) {
        const vet = await this.prisma.vet.findUnique({
            where: { id: vetId },
        });
        if (!vet) {
            throw new common_1.NotFoundException({
                code: 'VET_NOT_FOUND',
                message: 'Vet not found',
            });
        }
        if (vet.status !== client_1.VetStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException({
                code: 'VET_NOT_PENDING',
                message: 'Vet is not pending approval',
                details: { currentStatus: vet.status },
            });
        }
        const updatedVet = await this.prisma.vet.update({
            where: { id: vetId },
            data: {
                status: client_1.VetStatus.APPROVED,
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
        return updatedVet;
    }
    async rejectVet(adminId, vetId, reason) {
        const vet = await this.prisma.vet.findUnique({
            where: { id: vetId },
        });
        if (!vet) {
            throw new common_1.NotFoundException({
                code: 'VET_NOT_FOUND',
                message: 'Vet not found',
            });
        }
        if (vet.status !== client_1.VetStatus.PENDING_APPROVAL) {
            throw new common_1.BadRequestException({
                code: 'VET_NOT_PENDING',
                message: 'Vet is not pending approval',
                details: { currentStatus: vet.status },
            });
        }
        const updatedVet = await this.prisma.vet.update({
            where: { id: vetId },
            data: {
                status: client_1.VetStatus.REJECTED,
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
        return updatedVet;
    }
    async suspendVet(adminId, vetId, reason) {
        const vet = await this.prisma.vet.findUnique({
            where: { id: vetId },
        });
        if (!vet) {
            throw new common_1.NotFoundException({
                code: 'VET_NOT_FOUND',
                message: 'Vet not found',
            });
        }
        if (vet.status === client_1.VetStatus.SUSPENDED) {
            throw new common_1.BadRequestException({
                code: 'VET_ALREADY_SUSPENDED',
                message: 'Vet is already suspended',
            });
        }
        const updatedVet = await this.prisma.vet.update({
            where: { id: vetId },
            data: {
                status: client_1.VetStatus.SUSPENDED,
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
        return updatedVet;
    }
    async reactivateVet(adminId, vetId) {
        const vet = await this.prisma.vet.findUnique({
            where: { id: vetId },
        });
        if (!vet) {
            throw new common_1.NotFoundException({
                code: 'VET_NOT_FOUND',
                message: 'Vet not found',
            });
        }
        if (vet.status !== client_1.VetStatus.SUSPENDED) {
            throw new common_1.BadRequestException({
                code: 'VET_NOT_SUSPENDED',
                message: 'Vet is not suspended',
                details: { currentStatus: vet.status },
            });
        }
        const updatedVet = await this.prisma.vet.update({
            where: { id: vetId },
            data: {
                status: client_1.VetStatus.APPROVED,
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
        return updatedVet;
    }
};
exports.VetsService = VetsService;
exports.VetsService = VetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], VetsService);
//# sourceMappingURL=vets.service.js.map