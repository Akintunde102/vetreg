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
exports.AnimalsController = void 0;
const common_1 = require("@nestjs/common");
const animals_service_1 = require("./animals.service");
const create_animal_dto_1 = require("./dto/create-animal.dto");
const update_animal_dto_1 = require("./dto/update-animal.dto");
const record_death_dto_1 = require("./dto/record-death.dto");
const delete_animal_dto_1 = require("./dto/delete-animal.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const approval_guard_1 = require("../auth/guards/approval.guard");
const org_scope_guard_1 = require("../auth/guards/org-scope.guard");
const role_guard_1 = require("../auth/guards/role.guard");
const delete_permission_guard_1 = require("../auth/guards/delete-permission.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const delete_permission_decorator_1 = require("../auth/decorators/delete-permission.decorator");
const client_1 = require("@prisma/client");
let AnimalsController = class AnimalsController {
    animalsService;
    constructor(animalsService) {
        this.animalsService = animalsService;
    }
    async create(orgId, user, dto) {
        return this.animalsService.create(orgId, user.id, dto);
    }
    async findAll(orgId, page, limit, search, species, clientId, includeDeleted) {
        return this.animalsService.findAll(orgId, page, limit, search, species, clientId, includeDeleted);
    }
    async findOne(orgId, animalId) {
        return this.animalsService.findOne(orgId, animalId);
    }
    async update(orgId, animalId, user, dto) {
        return this.animalsService.update(orgId, animalId, user.id, dto);
    }
    async softDelete(orgId, animalId, user, dto) {
        return this.animalsService.softDelete(orgId, animalId, user.id, dto);
    }
    async restore(orgId, animalId, user) {
        return this.animalsService.restore(orgId, animalId, user.id);
    }
    async recordDeath(orgId, animalId, user, dto) {
        return this.animalsService.recordDeath(orgId, animalId, user.id, dto);
    }
    async getTreatmentHistory(orgId, animalId) {
        return this.animalsService.getTreatmentHistory(orgId, animalId);
    }
};
exports.AnimalsController = AnimalsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_animal_dto_1.CreateAnimalDto]),
    __metadata("design:returntype", Promise)
], AnimalsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('species')),
    __param(5, (0, common_1.Query)('clientId')),
    __param(6, (0, common_1.Query)('includeDeleted', new common_1.DefaultValuePipe(false), common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], AnimalsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':animalId'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('animalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnimalsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':animalId'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('animalId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, update_animal_dto_1.UpdateAnimalDto]),
    __metadata("design:returntype", Promise)
], AnimalsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':animalId'),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard, delete_permission_guard_1.DeletePermissionGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OWNER, client_1.MembershipRole.ADMIN, client_1.MembershipRole.MEMBER),
    (0, delete_permission_decorator_1.RequireDeletePermission)('canDeleteAnimals'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('animalId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, delete_animal_dto_1.DeleteAnimalDto]),
    __metadata("design:returntype", Promise)
], AnimalsController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Post)(':animalId/restore'),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OWNER, client_1.MembershipRole.ADMIN),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('animalId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AnimalsController.prototype, "restore", null);
__decorate([
    (0, common_1.Patch)(':animalId/death'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('animalId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, record_death_dto_1.RecordDeathDto]),
    __metadata("design:returntype", Promise)
], AnimalsController.prototype, "recordDeath", null);
__decorate([
    (0, common_1.Get)(':animalId/treatments'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('animalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnimalsController.prototype, "getTreatmentHistory", null);
exports.AnimalsController = AnimalsController = __decorate([
    (0, common_1.Controller)('orgs/:orgId/animals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, approval_guard_1.ApprovalGuard, org_scope_guard_1.OrgScopeGuard),
    __metadata("design:paramtypes", [animals_service_1.AnimalsService])
], AnimalsController);
//# sourceMappingURL=animals.controller.js.map