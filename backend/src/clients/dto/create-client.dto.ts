import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phoneNumber!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(20)
  @IsOptional()
  alternatePhone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
