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
exports.CreateTreatmentDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateTreatmentDto {
    animalId;
    visitDate;
    chiefComplaint;
    history;
    clinicalFindings;
    diagnosis;
    differentialDiagnosis;
    treatmentGiven;
    prescriptions;
    procedures;
    labResults;
    followUpDate;
    followUpNotes;
    weight;
    weightUnit;
    temperature;
    temperatureUnit;
    heartRate;
    respiratoryRate;
    bodyConditionScore;
    attachments;
    notes;
    status;
}
exports.CreateTreatmentDto = CreateTreatmentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "animalId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "visitDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "chiefComplaint", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "history", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "clinicalFindings", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "diagnosis", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "differentialDiagnosis", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "treatmentGiven", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateTreatmentDto.prototype, "prescriptions", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "procedures", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "labResults", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "followUpDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "followUpNotes", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTreatmentDto.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.WeightUnit),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "weightUnit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTreatmentDto.prototype, "temperature", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TemperatureUnit),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "temperatureUnit", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTreatmentDto.prototype, "heartRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTreatmentDto.prototype, "respiratoryRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTreatmentDto.prototype, "bodyConditionScore", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateTreatmentDto.prototype, "attachments", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TreatmentStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTreatmentDto.prototype, "status", void 0);
//# sourceMappingURL=create-treatment.dto.js.map