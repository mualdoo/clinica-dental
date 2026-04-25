export type AppointmentStatus =
    | 'scheduled'
    | 'completed'
    | 'missed'
    | 'cancelled'

export interface Appointment {
    id: string
    patientId: string
    dentistId: string
    cubicleId: string
    startTime: string
    endTime: string
    status: AppointmentStatus
    reminderSentAt?: string | null
}

export interface Cubicle {
    id: string
    name: string
    isActive: boolean
}

export interface AppointmentParams {
    patientId?: string
    dentistId?: string
    cubicleId?: string
    startTime?: string
    endTime?: string
    status?: AppointmentStatus
    page?: number
    limit?: number
    enabled?: boolean
}

export interface CubicleParams {
    name?: string
    isActive?: boolean
    page?: number
    limit?: number
}

export interface CreateAppointmentDto {
    patientId: string
    dentistId: string
    cubicleId: string
    startTime: string
    endTime: string
    status?: AppointmentStatus
}

export interface PatchAppointmentDto extends Partial<CreateAppointmentDto> {}

export interface CreateCubicleDto {
    name: string
    isActive?: boolean
}

export interface PatchCubicleDto extends Partial<CreateCubicleDto> {}
