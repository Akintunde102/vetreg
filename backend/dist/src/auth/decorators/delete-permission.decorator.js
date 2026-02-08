"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireDeletePermission = void 0;
const common_1 = require("@nestjs/common");
const delete_permission_guard_1 = require("../guards/delete-permission.guard");
const RequireDeletePermission = (permission) => (0, common_1.SetMetadata)(delete_permission_guard_1.DELETE_PERMISSION_KEY, permission);
exports.RequireDeletePermission = RequireDeletePermission;
//# sourceMappingURL=delete-permission.decorator.js.map