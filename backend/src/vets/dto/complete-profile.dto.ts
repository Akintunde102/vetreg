import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsEnum,
  IsDateString,
  MinLength,
  Min,
  Max,
} from 'class-validator';
import { Gender, PracticeType } from '@prisma/client';

export class CompleteProfileDto {
  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsString()
  @MinLength(10)
  phoneNumber!: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @MinLength(5)
  vcnNumber!: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsInt()
  @Min(0)
  @Max(60)
  @IsOptional()
  yearsOfExperience?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  qualifications?: string[];

  @IsString()
  @IsOptional()
  universityAttended?: string;

  @IsInt()
  @Min(1950)
  @Max(new Date().getFullYear())
  @IsOptional()
  graduationYear?: number;

  @IsString()
  @MinLength(10)
  practiceAddress!: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsEnum(PracticeType)
  @IsOptional()
  practiceType?: PracticeType;
}
