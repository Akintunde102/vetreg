"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipApproval = void 0;
const common_1 = require("@nestjs/common");
const approval_guard_1 = require("../guards/approval.guard");
const SkipApproval = () => (0, common_1.SetMetadata)(approval_guard_1.SKIP_APPROVAL_KEY, true);
exports.SkipApproval = SkipApproval;
//# sourceMappingURL=skip-approval.decorator.js.map