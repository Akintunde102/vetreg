import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create-organization.dto';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateOrganizationDto extends PartialType(
  CreateOrganizationDto,
) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  welcomeMessage?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;
}
