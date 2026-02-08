import { MembershipRole } from '@prisma/client';
export declare class CreateInvitationDto {
    invitedEmail: string;
    role?: MembershipRole;
}
