import { PartialType } from '@nestjs/mapped-types';
import { CreateTreatmentDto } from './create-treatment.dto';
import { Exclude } from 'class-transformer';

export class UpdateTreatmentDto extends PartialType(CreateTreatmentDto) {
  @Exclude()
  animalId?: string; // Cannot change animal via update
}
