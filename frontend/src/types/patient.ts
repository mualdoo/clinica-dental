import type { PaginatedResponse } from '@/types/backend-response'

// ─── Enums ────────────────────────────────────────────────────────────────────
export type Gender = 'M' | 'F' | 'O'
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
export type HealthAlertType = 'allergy' | 'condition' | 'medication' | 'other'
export type PatientFileType =
    | 'x-ray'
    | 'before_photo'
    | 'after_photo'
    | 'document'
    | 'other'
export type ToothSurface =
    | 'mesial'
    | 'distal'
    | 'vestibular'
    | 'lingual'
    | 'oclusal'

// ─── Modelos ──────────────────────────────────────────────────────────────────
export interface Patient {
    id: string
    authUserId: string
    email: string
    name: string
    lastName: string
    birthDate: string
    gender: Gender
    phone: string
    address: string
    bloodType: BloodType
    completed: boolean
}

export interface ClinicalNote {
    id: string
    patientId: string
    subjective: string
    objective: string
    assessment: string
    plan: string
    createdBy: string
}

export interface HealthAlert {
    id: string
    patientId: string
    type: HealthAlertType
    content: string
    createdBy: string
}

export interface PatientFile {
    id: string
    patientId: string
    type: PatientFileType
    filename: string
    storageKey: string
    mimeType: string
    sizeBytes: number
    createdBy: string
}

export interface Tooth {
    id: string
    patientId: string
    number: number
    surface: ToothSurface
    condition: string
    notes: string
    createdBy: string
}

// ─── Parámetros de paginación ─────────────────────────────────────────────────
export interface PaginationParams {
    page?: number
    limit?: number
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CreatePatientDto {
    email: string
    name: string
    lastName: string
    birthDate: string
    gender: Gender
    phone: string
    address: string
    bloodType: BloodType
}

export interface PatchPatientDto extends Partial<CreatePatientDto> {}

export interface CreateClinicalNoteDto {
    subjective: string
    objective: string
    assessment: string
    plan: string
}

export interface PatchClinicalNoteDto extends Partial<CreateClinicalNoteDto> {}

export interface CreateHealthAlertDto {
    type: HealthAlertType
    content: string
}

export interface PatchHealthAlertDto extends Partial<CreateHealthAlertDto> {}

export interface CreatePatientFileDto {
    type: PatientFileType
    filename: string
    storageKey: string
    mimeType: string
    sizeBytes: number
}

export interface PatchPatientFileDto extends Partial<CreatePatientFileDto> {}

export interface CreateToothDto {
    number: number
    surface: ToothSurface
    condition: string
    notes?: string
}

export interface PatchToothDto extends Partial<CreateToothDto> {}

// ─── Re-exports paginados para comodidad ──────────────────────────────────────
export type PaginatedPatients = PaginatedResponse<Patient>
export type PaginatedNotes = PaginatedResponse<ClinicalNote>
export type PaginatedAlerts = PaginatedResponse<HealthAlert>
export type PaginatedFiles = PaginatedResponse<PatientFile>
export type PaginatedTeeth = PaginatedResponse<Tooth>
