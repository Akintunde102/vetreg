"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogPermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let ActivityLogPermissionGuard = class ActivityLogPermissionGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const membership = request.orgMembership;
        if (!membership) {
            throw new common_1.ForbiddenException({
                code: 'NO_ORG_MEMBERSHIP',
                message: 'Organization membership required',
            });
        }
        const hasAccess = membership.role === client_1.MembershipRole.OWNER ||
            membership.canViewActivityLog === true;
        if (!hasAccess) {
            throw new common_1.ForbiddenException({
                code: 'ACTIVITY_LOG_ACCESS_DENIED',
                message: 'You do not have permission to view the organization activity log',
            });
        }
        return true;
    }
};
exports.ActivityLogPermissionGuard = ActivityLogPermissionGuard;
exports.ActivityLogPermissionGuard = ActivityLogPermissionGuard = __decorate([
    (0, common_1.Injectable)()
], ActivityLogPermissionGuard);
//# sourceMappingURL=activity-log-permission.guard.js.map