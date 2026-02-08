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
exports.OrgScopeGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OrgScopeGuard = class OrgScopeGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException({
                code: 'UNAUTHENTICATED',
                message: 'User not authenticated',
            });
        }
        const organizationId = request.params?.orgId ||
            request.params?.organizationId ||
            request.body?.organizationId;
        if (!organizationId) {
            throw new common_1.BadRequestException({
                code: 'ORG_ID_REQUIRED',
                message: 'Organization ID is required',
            });
        }
        const membership = await this.prisma.orgMembership.findUnique({
            where: {
                vetId_organizationId: {
                    vetId: user.id,
                    organizationId,
                },
            },
        });
        if (!membership) {
            throw new common_1.ForbiddenException({
                code: 'NOT_ORG_MEMBER',
                message: 'You are not a member of this organization',
            });
        }
        if (membership.status !== client_1.MembershipStatus.ACTIVE) {
            throw new common_1.ForbiddenException({
                code: 'MEMBERSHIP_NOT_ACTIVE',
                message: 'Your membership in this organization is not active',
                details: { status: membership.status },
            });
        }
        request.orgMembership = membership;
        request.organizationId = organizationId;
        return true;
    }
};
exports.OrgScopeGuard = OrgScopeGuard;
exports.OrgScopeGuard = OrgScopeGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrgScopeGuard);
//# sourceMappingURL=org-scope.guard.js.map