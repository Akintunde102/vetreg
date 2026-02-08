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
exports.ApprovalGuard = exports.SKIP_APPROVAL_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const client_1 = require("@prisma/client");
exports.SKIP_APPROVAL_KEY = 'skipApproval';
let ApprovalGuard = class ApprovalGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const skipApproval = this.reflector.getAllAndOverride(exports.SKIP_APPROVAL_KEY, [context.getHandler(), context.getClass()]);
        if (skipApproval) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException({
                code: 'UNAUTHENTICATED',
                message: 'User not authenticated',
            });
        }
        if (user.status === client_1.VetStatus.PENDING_APPROVAL) {
            throw new common_1.ForbiddenException({
                code: 'VET_NOT_APPROVED',
                message: 'Your profile is pending approval. Please wait for administrator verification.',
                details: { profileSubmittedAt: user.profileSubmittedAt },
            });
        }
        if (user.status === client_1.VetStatus.REJECTED) {
            throw new common_1.ForbiddenException({
                code: 'VET_REJECTED',
                message: 'Your application has been rejected.',
                details: {
                    rejectionReason: user.rejectionReason,
                    rejectedAt: user.rejectedAt,
                },
            });
        }
        if (user.status === client_1.VetStatus.SUSPENDED) {
            throw new common_1.ForbiddenException({
                code: 'VET_SUSPENDED',
                message: 'Your account has been suspended.',
                details: {
                    suspensionReason: user.suspensionReason,
                    suspendedAt: user.suspendedAt,
                },
            });
        }
        return true;
    }
};
exports.ApprovalGuard = ApprovalGuard;
exports.ApprovalGuard = ApprovalGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], ApprovalGuard);
//# sourceMappingURL=approval.guard.js.map