import { Gender, PracticeType } from '@prisma/client';
export declare class CompleteProfileDto {
    fullName: string;
    phoneNumber: string;
    dateOfBirth?: string;
    gender?: Gender;
    vcnNumber: string;
    specialization?: string;
    yearsOfExperience?: number;
    qualifications?: string[];
    universityAttended?: string;
    graduationYear?: number;
    practiceAddress: string;
    city?: string;
    state?: string;
    country?: string;
    practiceType?: PracticeType;
}
