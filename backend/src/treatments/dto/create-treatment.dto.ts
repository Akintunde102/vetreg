import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  Min,
  MinLength,
} from 'class-validator';
import { TreatmentStatus, WeightUnit, TemperatureUnit } from '@prisma/client';

export class CreateTreatmentDto {
  @IsString()
  animalId!: string;

  @IsDateString()
  visitDate!: string;

  @IsString()
  @MinLength(10)
  chiefComplaint!: string;

  @IsString()
  @IsOptional()
  history?: string;

  @IsString()
  @IsOptional()
  clinicalFindings?: string;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  differentialDiagnosis?: string;

  @IsString()
  @MinLength(10)
  treatmentGiven!: string;

  @IsObject()
  @IsOptional()
  prescriptions?: any;

  @IsString()
  @IsOptional()
  procedures?: string;

  @IsString()
  @IsOptional()
  labResults?: string;

  @IsDateString()
  @IsOptional()
  followUpDate?: string;

  @IsString()
  @IsOptional()
  followUpNotes?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @IsEnum(WeightUnit)
  @IsOptional()
  weightUnit?: WeightUnit;

  @IsNumber()
  @Min(0)
  @IsOptional()
  temperature?: number;

  @IsEnum(TemperatureUnit)
  @IsOptional()
  temperatureUnit?: TemperatureUnit;

  @IsNumber()
  @Min(0)
  @IsOptional()
  heartRate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  respiratoryRate?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  bodyConditionScore?: number;

  @IsObject()
  @IsOptional()
  attachments?: any;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(TreatmentStatus)
  @IsOptional()
  status?: TreatmentStatus;
}
