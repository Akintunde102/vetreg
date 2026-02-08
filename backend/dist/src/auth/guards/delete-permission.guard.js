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
exports.DeletePermissionGuard = exports.DELETE_PERMISSION_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const client_1 = require("@prisma/client");
exports.DELETE_PERMISSION_KEY = 'deletePermission';
let DeletePermissionGuard = class DeletePermissionGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredPermission = this.reflector.getAllAndOverride(exports.DELETE_PERMISSION_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredPermission) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const membership = request.orgMembership;
        if (!membership) {
            throw new common_1.ForbiddenException({
                code: 'NO_ORG_MEMBERSHIP',
                message: 'Organization membership required',
            });
        }
        if (membership.role === client_1.MembershipRole.OWNER) {
            return true;
        }
        const hasPermission = membership[requiredPermission] === true;
        if (!hasPermission) {
            throw new common_1.ForbiddenException({
                code: 'DELETE_PERMISSION_DENIED',
                message: `You do not have permission to perform this delete operation`,
                details: {
                    requiredPermission,
                },
            });
        }
        return true;
    }
};
exports.DeletePermissionGuard = DeletePermissionGuard;
exports.DeletePermissionGuard = DeletePermissionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], DeletePermissionGuard);
//# sourceMappingURL=delete-permission.guard.js.map