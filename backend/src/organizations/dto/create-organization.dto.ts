import {
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  IsEmail,
  MinLength,
} from 'class-validator';
import { OrgType } from '@prisma/client';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @MinLength(10)
  address!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @MinLength(10)
  phoneNumber!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsEnum(OrgType)
  type!: OrgType;
}
