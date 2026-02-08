"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VetsModule = void 0;
const common_1 = require("@nestjs/common");
const vets_controller_1 = require("./vets.controller");
const vets_service_1 = require("./vets.service");
const audit_log_service_1 = require("../common/services/audit-log.service");
let VetsModule = class VetsModule {
};
exports.VetsModule = VetsModule;
exports.VetsModule = VetsModule = __decorate([
    (0, common_1.Module)({
        controllers: [vets_controller_1.VetsController],
        providers: [vets_service_1.VetsService, audit_log_service_1.AuditLogService],
        exports: [vets_service_1.VetsService],
    })
], VetsModule);
//# sourceMappingURL=vets.module.js.map