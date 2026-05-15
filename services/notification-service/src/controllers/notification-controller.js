import { AppError, catchAsync, ok } from '@mualdoo/shared'
import { patientExists } from '../services/patient-service.js'
import { sendAppointmentReminderEmail } from '../services/email-service.js'
import { setAppointmentSent } from '../services/agenda-service.js'

export const send = catchAsync(async (req, res) => {
    console.log('hola, llega aquí??', req.body)

    const patient = await patientExists(req.body.patientId)
    if (!patient) throw new AppError('Patient not found')

    const response = await sendAppointmentReminderEmail({
        email: patient.email,
        patientName: req.body.patientName,
        dentistName: req.body.dentistName,
        appointmentDate: req.body.startTime,
        cubicle: `#${req.body.Cubicle.number} - ${req.body.Cubicle.name}`,
    })

    await setAppointmentSent(req.body.id)

    return ok(res, response)
})
