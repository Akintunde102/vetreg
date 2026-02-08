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
exports.VetsController = void 0;
const common_1 = require("@nestjs/common");
const vets_service_1 = require("./vets.service");
const complete_profile_dto_1 = require("./dto/complete-profile.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const approval_guard_1 = require("../auth/guards/approval.guard");
const master_admin_guard_1 = require("../auth/guards/master-admin.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const skip_approval_decorator_1 = require("../auth/decorators/skip-approval.decorator");
let VetsController = class VetsController {
    vetsService;
    constructor(vetsService) {
        this.vetsService = vetsService;
    }
    async completeProfile(user, dto) {
        return this.vetsService.completeProfile(user.id, dto);
    }
    async getProfile(user) {
        return this.vetsService.getProfile(user.id);
    }
    async getApprovalStatus(user) {
        return this.vetsService.getApprovalStatus(user.id);
    }
    async getPendingApprovals() {
        return this.vetsService.getPendingApprovals();
    }
    async approveVet(admin, vetId) {
        return this.vetsService.approveVet(admin.id, vetId);
    }
    async rejectVet(admin, vetId, reason) {
        return this.vetsService.rejectVet(admin.id, vetId, reason);
    }
    async suspendVet(admin, vetId, reason) {
        return this.vetsService.suspendVet(admin.id, vetId, reason);
    }
    async reactivateVet(admin, vetId) {
        return this.vetsService.reactivateVet(admin.id, vetId);
    }
};
exports.VetsController = VetsController;
__decorate([
    (0, common_1.Post)('profile/complete'),
    (0, skip_approval_decorator_1.SkipApproval)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, complete_profile_dto_1.CompleteProfileDto]),
    __metadata("design:returntype", Promise)
], VetsController.prototype, "completeProfile", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, skip_approval_decorator_1.SkipApproval)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VetsController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('approval-status'),
    (0, skip_approval_decorator_1.SkipApproval)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VetsController.prototype, "getApprovalStatus", null);
__decorate([
    (0, common_1.Get)('pending-approvals'),
    (0, common_1.UseGuards)(approval_guard_1.ApprovalGuard, master_admin_guard_1.MasterAdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VetsController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Patch)(':vetId/approve'),
    (0, common_1.UseGuards)(approval_guard_1.ApprovalGuard, master_admin_guard_1.MasterAdminGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('vetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VetsController.prototype, "approveVet", null);
__decorate([
    (0, common_1.Patch)(':vetId/reject'),
    (0, common_1.UseGuards)(approval_guard_1.ApprovalGuard, master_admin_guard_1.MasterAdminGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('vetId')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], VetsController.prototype, "rejectVet", null);
__decorate([
    (0, common_1.Patch)(':vetId/suspend'),
    (0, common_1.UseGuards)(approval_guard_1.ApprovalGuard, master_admin_guard_1.MasterAdminGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('vetId')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], VetsController.prototype, "suspendVet", null);
__decorate([
    (0, common_1.Patch)(':vetId/reactivate'),
    (0, common_1.UseGuards)(approval_guard_1.ApprovalGuard, master_admin_guard_1.MasterAdminGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('vetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VetsController.prototype, "reactivateVet", null);
exports.VetsController = VetsController = __decorate([
    (0, common_1.Controller)('vets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [vets_service_1.VetsService])
], VetsController);
//# sourceMappingURL=vets.controller.js.map