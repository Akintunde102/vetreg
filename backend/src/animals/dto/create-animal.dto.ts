import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsUrl,
  MinLength,
  MaxLength,
  Min,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AnimalSpecies,
  AnimalGender,
  WeightUnit,
  PatientType,
} from '@prisma/client';

export class TreatmentHistoryDto {
  @IsDateString()
  visitDate!: string;

  @IsString()
  @MinLength(10)
  chiefComplaint!: string;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @MinLength(10)
  treatmentGiven!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateAnimalDto {
  @IsString()
  clientId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsEnum(AnimalSpecies)
  species!: AnimalSpecies;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsEnum(AnimalGender)
  @IsOptional()
  gender?: AnimalGender;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  approximateAge?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @IsEnum(WeightUnit)
  @IsOptional()
  weightUnit?: WeightUnit;

  @IsString()
  @IsOptional()
  microchipNumber?: string;

  @IsString()
  @IsOptional()
  identifyingMarks?: string;

  @IsUrl()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  // Patient Type
  @IsEnum(PatientType)
  @IsOptional()
  patientType?: PatientType;

  // Batch Livestock fields
  @IsString()
  @IsOptional()
  batchName?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  batchSize?: number;

  @IsString()
  @IsOptional()
  batchIdentifier?: string;

  // Treatment history backlog for livestock
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TreatmentHistoryDto)
  @IsOptional()
  treatmentHistory?: TreatmentHistoryDto[];
}
