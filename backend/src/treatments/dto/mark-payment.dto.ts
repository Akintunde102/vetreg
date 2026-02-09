import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class MarkPaymentDto {
  @IsEnum(PaymentStatus)
  paymentStatus!: PaymentStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amountPaid?: number;

  @IsString()
  @IsOptional()
  paymentNotes?: string;
}
