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
} from 'class-validator';
import { AnimalSpecies, AnimalGender, WeightUnit } from '@prisma/client';

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
}
