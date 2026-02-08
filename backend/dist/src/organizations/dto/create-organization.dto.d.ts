import { OrgType } from '@prisma/client';
export declare class CreateOrganizationDto {
    name: string;
    description?: string;
    address: string;
    city: string;
    state: string;
    country?: string;
    phoneNumber: string;
    email?: string;
    website?: string;
    type: OrgType;
}
