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
exports.ClientsController = void 0;
const common_1 = require("@nestjs/common");
const clients_service_1 = require("./clients.service");
const create_client_dto_1 = require("./dto/create-client.dto");
const update_client_dto_1 = require("./dto/update-client.dto");
const delete_client_dto_1 = require("./dto/delete-client.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const approval_guard_1 = require("../auth/guards/approval.guard");
const org_scope_guard_1 = require("../auth/guards/org-scope.guard");
const role_guard_1 = require("../auth/guards/role.guard");
const delete_permission_guard_1 = require("../auth/guards/delete-permission.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const delete_permission_decorator_1 = require("../auth/decorators/delete-permission.decorator");
const client_1 = require("@prisma/client");
let ClientsController = class ClientsController {
    clientsService;
    constructor(clientsService) {
        this.clientsService = clientsService;
    }
    async create(orgId, user, dto) {
        return this.clientsService.create(orgId, user.id, dto);
    }
    async findAll(orgId, page, limit, search, includeDeleted) {
        return this.clientsService.findAll(orgId, page, limit, search, includeDeleted);
    }
    async findOne(orgId, clientId) {
        return this.clientsService.findOne(orgId, clientId);
    }
    async update(orgId, clientId, user, dto) {
        return this.clientsService.update(orgId, clientId, user.id, dto);
    }
    async softDelete(orgId, clientId, user, dto) {
        return this.clientsService.softDelete(orgId, clientId, user.id, dto);
    }
    async restore(orgId, clientId, user) {
        return this.clientsService.restore(orgId, clientId, user.id);
    }
    async getClientAnimals(orgId, clientId) {
        return this.clientsService.getClientAnimals(orgId, clientId);
    }
};
exports.ClientsController = ClientsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_client_dto_1.CreateClientDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(50), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('includeDeleted', new common_1.DefaultValuePipe(false), common_1.ParseBoolPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, Boolean]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':clientId'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':clientId'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('clientId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, update_client_dto_1.UpdateClientDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':clientId'),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard, delete_permission_guard_1.DeletePermissionGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OWNER, client_1.MembershipRole.ADMIN, client_1.MembershipRole.MEMBER),
    (0, delete_permission_decorator_1.RequireDeletePermission)('canDeleteClients'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('clientId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, delete_client_dto_1.DeleteClientDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Post)(':clientId/restore'),
    (0, common_1.UseGuards)(role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OWNER, client_1.MembershipRole.ADMIN),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('clientId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "restore", null);
__decorate([
    (0, common_1.Get)(':clientId/animals'),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "getClientAnimals", null);
exports.ClientsController = ClientsController = __decorate([
    (0, common_1.Controller)('orgs/:orgId/clients'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, approval_guard_1.ApprovalGuard, org_scope_guard_1.OrgScopeGuard),
    __metadata("design:paramtypes", [clients_service_1.ClientsService])
], ClientsController);
//# sourceMappingURL=clients.controller.js.map