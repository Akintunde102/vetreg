import { IsString, MinLength } from 'class-validator';

export class DeleteClientDto {
  @IsString()
  @MinLength(10, {
    message: 'Deletion reason must be at least 10 characters long',
  })
  reason!: string;
}
