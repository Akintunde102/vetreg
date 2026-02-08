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
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuditLogService = class AuditLogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(data) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    vetId: data.vetId,
                    action: data.action,
                    entityType: data.entityType,
                    entityId: data.entityId,
                    metadata: data.metadata,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                },
            });
        }
        catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }
    async logMany(data) {
        try {
            await this.prisma.auditLog.createMany({
                data: data.map((item) => ({
                    vetId: item.vetId,
                    action: item.action,
                    entityType: item.entityType,
                    entityId: item.entityId,
                    metadata: item.metadata,
                    ipAddress: item.ipAddress,
                    userAgent: item.userAgent,
                })),
            });
        }
        catch (error) {
            console.error('Failed to create audit logs:', error);
        }
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map