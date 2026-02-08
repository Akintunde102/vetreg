import { TreatmentStatus, WeightUnit, TemperatureUnit } from '@prisma/client';
export declare class CreateTreatmentDto {
    animalId: string;
    visitDate: string;
    chiefComplaint: string;
    history?: string;
    clinicalFindings?: string;
    diagnosis?: string;
    differentialDiagnosis?: string;
    treatmentGiven: string;
    prescriptions?: any;
    procedures?: string;
    labResults?: string;
    followUpDate?: string;
    followUpNotes?: string;
    weight?: number;
    weightUnit?: WeightUnit;
    temperature?: number;
    temperatureUnit?: TemperatureUnit;
    heartRate?: number;
    respiratoryRate?: number;
    bodyConditionScore?: number;
    attachments?: any;
    notes?: string;
    status?: TreatmentStatus;
}
