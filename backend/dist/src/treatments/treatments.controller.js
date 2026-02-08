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
exports.TreatmentsController = void 0;
const common_1 = require("@nestjs/common");
const treatments_service_1 = require("./treatments.service");
const create_treatment_dto_1 = require("./dto/create-treatment.dto");
const update_treatment_dto_1 = require("./dto/update-treatment.dto");
const delete_treatment_dto_1 = require("./dto/delete-treatment.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const approval_guard_1 = require("../auth/guards/approval.guard");
const org_scope_guard_1 = require("../auth/guards/org-scope.guard");
const role_guard_1 = require("../auth/guards/role.guard");
const delete_permission_guard_1 = require("../auth/guards/delete-permission.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const delete_permission_decorator_1 = require("../auth/decorators/delete-permission.decorator");
const client_1 = require("@prisma/client");
let TreatmentsController = class TreatmentsController {
    treatmentsService;
    constructor(treatmentsService) {
        this.treatmentsService = treatmentsService;
    }
    async create(orgId, user, dto) {
        return this.treatmentsService.create(orgId, user.id, dto);
    }
    async findAll(orgId, page, limit, animalId, vetId, status, includeDeleted) {
        return this.treatmentsService.findAll(orgId, page, limit, animalId, vetId, status, includeDeleted);
    }
    async findOne(orgId, treatmentId) {
        return this.treatmentsService.findOne(orgId, treatmentId);
    }
    async update(orgId, treatmentId, user, dto) {
        return this.treatmentsService.update(orgId, treatmentId, user.id, dto);
    }
    async softDelete(orgId, treatmentId, user, dto) {
        return this.treatmentsService.softDelete(orgId, treatmentId, user.id, dto);
    }
    async restore(orgId, treatmentId, user) {
        return this.treatmentsService.restore(orgId, treatmentId, user.id);
    }
    async getVersions(orgId, treatmentId) {
        return this.treatmentsService.getVersions(orgId, treatmentId);
    }
};
exports.TreatmentsController = TreatmentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_treatment_dto_1.CreateTreatmentDto]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('animalId')),
    __param(4, (0, common_1.Query)('vetId')),
    __param(5, (0, common_1.Query)('status')),
    __param(6, (0, common_1.Query)('includeDeleted', new common_1.DefaultValuePipe(false), common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':treatmentId'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('treatmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':treatmentId'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('treatmentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, update_treatment_dto_1.UpdateTreatmentDto]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':treatmentId'),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard, delete_permission_guard_1.DeletePermissionGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OWNER, client_1.MembershipRole.ADMIN, client_1.MembershipRole.MEMBER),
    (0, delete_permission_decorator_1.RequireDeletePermission)('canDeleteTreatments'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('treatmentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, delete_treatment_dto_1.DeleteTreatmentDto]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Post)(':treatmentId/restore'),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OWNER, client_1.MembershipRole.ADMIN),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('treatmentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "restore", null);
__decorate([
    (0, common_1.Get)(':treatmentId/versions'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('treatmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TreatmentsController.prototype, "getVersions", null);
exports.TreatmentsController = TreatmentsController = __decorate([
    (0, common_1.Controller)('orgs/:orgId/treatments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, approval_guard_1.ApprovalGuard, org_scope_guard_1.OrgScopeGuard),
    __metadata("design:paramtypes", [treatments_service_1.TreatmentsService])
], TreatmentsController);
//# sourceMappingURL=treatments.controller.js.map