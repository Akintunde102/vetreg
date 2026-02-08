import { IsDateString, IsString, IsOptional } from 'class-validator';

export class RecordDeathDto {
  @IsDateString()
  dateOfDeath!: string;

  @IsString()
  @IsOptional()
  causeOfDeath?: string;
}
