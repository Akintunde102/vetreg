"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterAdminGuard = void 0;
const common_1 = require("@nestjs/common");
let MasterAdminGuard = class MasterAdminGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException({
                code: 'UNAUTHENTICATED',
                message: 'User not authenticated',
            });
        }
        if (!user.isMasterAdmin) {
            throw new common_1.ForbiddenException({
                code: 'MASTER_ADMIN_REQUIRED',
                message: 'This action requires Master Admin privileges',
            });
        }
        return true;
    }
};
exports.MasterAdminGuard = MasterAdminGuard;
exports.MasterAdminGuard = MasterAdminGuard = __decorate([
    (0, common_1.Injectable)()
], MasterAdminGuard);
//# sourceMappingURL=master-admin.guard.js.map