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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../common/services/audit-log.service");
const activity_log_service_1 = require("../common/services/activity-log.service");
const client_1 = require("@prisma/client");
const slugify_1 = __importDefault(require("slugify"));
let OrganizationsService = class OrganizationsService {
    prisma;
    auditLogService;
    activityLogService;
    constructor(prisma, auditLogService, activityLogService) {
        this.prisma = prisma;
        this.auditLogService = auditLogService;
        this.activityLogService = activityLogService;
    }
    generateSlug(name) {
        const baseSlug = (0, slugify_1.default)(name, { lower: true, strict: true });
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `${baseSlug}-${randomSuffix}`;
    }
    async create(vetId, dto) {
        const slug = this.generateSlug(dto.name);
        const existingSlug = await this.prisma.organization.findUnique({
            where: { slug },
        });
        if (existingSlug) {
            throw new common_1.ConflictException({
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
        await this.prisma.orgMembership.create({
            data: {
                vetId,
                organizationId: organization.id,
                role: client_1.MembershipRole.OWNER,
                status: client_1.MembershipStatus.ACTIVE,
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
    async findAll(vetId) {
        const memberships = await this.prisma.orgMembership.findMany({
            where: {
                vetId,
                status: client_1.MembershipStatus.ACTIVE,
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
    async findOne(orgId, vetId) {
        const organization = await this.prisma.organization.findUnique({
            where: { id: orgId },
            include: {
                memberships: {
                    where: { status: client_1.MembershipStatus.ACTIVE },
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
            throw new common_1.NotFoundException({
                code: 'ORG_NOT_FOUND',
                message: 'Organization not found',
            });
        }
        const isMember = organization.memberships.some((m) => m.vetId === vetId);
        if (!isMember) {
            throw new common_1.ForbiddenException({
                code: 'NOT_ORG_MEMBER',
                message: 'You are not a member of this organization',
            });
        }
        return organization;
    }
    async update(orgId, vetId, dto) {
        const organization = await this.prisma.organization.findUnique({
            where: { id: orgId },
        });
        if (!organization) {
            throw new common_1.NotFoundException({
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
    async getMembers(orgId) {
        const memberships = await this.prisma.orgMembership.findMany({
            where: {
                organizationId: orgId,
                status: client_1.MembershipStatus.ACTIVE,
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
    async getActivityLogs(orgId, page = 1, limit = 50) {
        return this.activityLogService.getOrganizationLogs(orgId, page, limit);
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService,
        activity_log_service_1.ActivityLogService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map