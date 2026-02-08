import { AnimalSpecies, AnimalGender, WeightUnit } from '@prisma/client';
export declare class CreateAnimalDto {
    clientId: string;
    name: string;
    species: AnimalSpecies;
    breed?: string;
    color?: string;
    gender?: AnimalGender;
    dateOfBirth?: string;
    approximateAge?: string;
    weight?: number;
    weightUnit?: WeightUnit;
    microchipNumber?: string;
    identifyingMarks?: string;
    photoUrl?: string;
    notes?: string;
}
