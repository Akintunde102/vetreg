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
exports.CreateAnimalDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateAnimalDto {
    clientId;
    name;
    species;
    breed;
    color;
    gender;
    dateOfBirth;
    approximateAge;
    weight;
    weightUnit;
    microchipNumber;
    identifyingMarks;
    photoUrl;
    notes;
}
exports.CreateAnimalDto = CreateAnimalDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "clientId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AnimalSpecies),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "species", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "breed", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AnimalGender),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "approximateAge", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAnimalDto.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.WeightUnit),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "weightUnit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "microchipNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "identifyingMarks", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "photoUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAnimalDto.prototype, "notes", void 0);
//# sourceMappingURL=create-animal.dto.js.map