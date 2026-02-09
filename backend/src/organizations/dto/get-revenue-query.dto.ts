import { IsOptional, IsDateString } from 'class-validator';

export class GetRevenueQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
