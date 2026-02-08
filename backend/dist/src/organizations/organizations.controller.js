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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const organizations_service_1 = require("./organizations.service");
const create_organization_dto_1 = require("./dto/create-organization.dto");
const update_organization_dto_1 = require("./dto/update-organization.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const approval_guard_1 = require("../auth/guards/approval.guard");
const org_scope_guard_1 = require("../auth/guards/org-scope.guard");
const role_guard_1 = require("../auth/guards/role.guard");
const activity_log_permission_guard_1 = require("../auth/guards/activity-log-permission.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let OrganizationsController = class OrganizationsController {
    organizationsService;
    constructor(organizationsService) {
        this.organizationsService = organizationsService;
    }
    async create(user, dto) {
        return this.organizationsService.create(user.id, dto);
    }
    async findAll(user) {
        return this.organizationsService.findAll(user.id);
    }
    async findOne(orgId, user) {
        return this.organizationsService.findOne(orgId, user.id);
    }
    async update(orgId, user, dto) {
        return this.organizationsService.update(orgId, user.id, dto);
    }
    async getMembers(orgId) {
        return this.organizationsService.getMembers(orgId);
    }
    async getActivityLogs(orgId, page, limit) {
        return this.organizationsService.getActivityLogs(orgId, page, limit);
    }
};
exports.OrganizationsController = OrganizationsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_organization_dto_1.CreateOrganizationDto]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':orgId'),
    (0, common_1.UseGuards)(org_scope_guard_1.OrgScopeGuard),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':orgId'),
    (0, common_1.UseGuards)(org_scope_guard_1.OrgScopeGuard, role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OWNER, client_1.MembershipRole.ADMIN),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_organization_dto_1.UpdateOrganizationDto]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':orgId/members'),
    (0, common_1.UseGuards)(org_scope_guard_1.OrgScopeGuard),
    __param(0, (0, common_1.Param)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Get)(':orgId/activity-log'),
    (0, common_1.UseGuards)(org_scope_guard_1.OrgScopeGuard, activity_log_permission_guard_1.ActivityLogPermissionGuard),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "getActivityLogs", null);
exports.OrganizationsController = OrganizationsController = __decorate([
    (0, common_1.Controller)('orgs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, approval_guard_1.ApprovalGuard),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService])
], OrganizationsController);
//# sourceMappingURL=organizations.controller.js.map