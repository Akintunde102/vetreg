import { PartialType } from '@nestjs/mapped-types';
import { CreateAnimalDto } from './create-animal.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { Exclude } from 'class-transformer';

export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {
  @Exclude()
  clientId?: string; // Cannot change owner via update

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
