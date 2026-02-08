import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePermissionsDto {
  @IsBoolean()
  @IsOptional()
  canDeleteClients?: boolean;

  @IsBoolean()
  @IsOptional()
  canDeleteAnimals?: boolean;

  @IsBoolean()
  @IsOptional()
  canDeleteTreatments?: boolean;

  @IsBoolean()
  @IsOptional()
  canViewActivityLog?: boolean;
}
