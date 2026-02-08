import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { MembershipRole } from '@prisma/client';

export class CreateInvitationDto {
  @IsEmail()
  invitedEmail!: string;

  @IsEnum(MembershipRole)
  @IsOptional()
  role?: MembershipRole;
}
