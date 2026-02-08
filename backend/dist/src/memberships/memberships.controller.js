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
exports.MembershipsController = void 0;
const common_1 = require("@nestjs/common");
const memberships_service_1 = require("./memberships.service");
const create_invitation_dto_1 = require("./dto/create-invitation.dto");
const update_member_role_dto_1 = require("./dto/update-member-role.dto");
const update_permissions_dto_1 = require("./dto/update-permissions.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const approval_guard_1 = require("../auth/guards/approval.guard");
const org_scope_guard_1 = require("../auth/guards/org-scope.guard");
const role_guard_1 = require("../auth/guards/role.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let MembershipsController = class MembershipsController {
    membershipsService;
    constructor(membershipsService) {
        this.membershipsService = membershipsService;
    }
    async createInvitation(orgId, user, dto) {
        return this.membershipsService.createInvitation(orgId, user.id, dto);
    }
    async getInvitations(orgId) {
        return this.membershipsService.getInvitations(orgId);
    }
    async cancelInvitation(orgId, invitationId, user) {
        return this.membershipsService.cancelInvitation(orgId, invitationId, user.id);
    }
    async acceptInvitation(token, user) {
        return this.membershipsService.acceptInvitation(token, user.id);
    }
    async declineInvitation(token, user) {
        return this.membershipsService.declineInvitation(token, user.id);
    }
    async removeMember(orgId, membershipId, user) {
        return this.membershipsService.removeMember(orgId, membershipId, user.id);
    }
    async updateMemberRole(orgId, membershipId, user, dto) {
        return this.membershipsService.updateMemberRole(orgId, membershipId, user.id, dto);
    }
    async updatePermissions(orgId, membershipId, user, dto) {
        return this.membershipsService.updatePermissions(orgId, membershipId, user.id, dto);
    }
    async leaveMembership(orgId, user) {
        return this.membershipsService.leaveMembership(orgId, user.id);
    }
};
exports.MembershipsController = MembershipsController;
__decorate([
    (0, common_1.Post)('orgs/:orgId/invitations'),
    (0, common_1.UseGuards)(org_scope_guard_1.OrgScopeGuard, role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OWNER, client_1.MembershipRole.ADMIN),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_invitation_dto_1.CreateInvitationDto]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "createInvitation", null);
__decorate([
    (0, common_1.Get)('orgs/:orgId/invitations'),
    (0, common_1.UseGuards)(org_scope_guard_1.OrgScopeGuard, role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OWNER, client_1.MembershipRole.ADMIN),
    __param(0, (0, common_1.Param)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "getInvitations", null);
__decorate([
    (0, common_1.Delete)('orgs/:orgId/invitations/:invitationId'),
    (0, common_1.UseGuards)(org_scope_guard_1.OrgScopeGuard, role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OWNER, client_1.MembershipRole.ADMIN),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('invitationId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "cancelInvitation", null);
__decorate([
    (0, common_1.Post)('invitations/:token/accept'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "acceptInvitation", null);
__decorate([
    (0, common_1.Post)('invitations/:token/decline'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "declineInvitation", null);
__decorate([
    (0, common_1.Delete)('orgs/:orgId/members/:membershipId'),
    (0, common_1.UseGuards)(org_scope_guard_1.OrgScopeGuard, role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OWNER),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('membershipId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Patch)('orgs/:orgId/members/:membershipId/role'),
    (0, common_1.UseGuards)(org_scope_guard_1.OrgScopeGuard, role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OWNER),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('membershipId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, update_member_role_dto_1.UpdateMemberRoleDto]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "updateMemberRole", null);
__decorate([
    (0, common_1.Patch)('orgs/:orgId/members/:membershipId/permissions'),
    (0, common_1.UseGuards)(org_scope_guard_1.OrgScopeGuard, role_guard_1.RoleGuard),
    (0, roles_decorator_1.Roles)(client_1.MembershipRole.OWNER),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Param)('membershipId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, update_permissions_dto_1.UpdatePermissionsDto]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "updatePermissions", null);
__decorate([
    (0, common_1.Post)('orgs/:orgId/leave'),
    (0, common_1.UseGuards)(org_scope_guard_1.OrgScopeGuard),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "leaveMembership", null);
exports.MembershipsController = MembershipsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, approval_guard_1.ApprovalGuard),
    __metadata("design:paramtypes", [memberships_service_1.MembershipsService])
], MembershipsController);
//# sourceMappingURL=memberships.controller.js.map