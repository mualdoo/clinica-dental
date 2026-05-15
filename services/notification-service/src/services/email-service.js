import { Resend } from 'resend'
import { renderTemplate } from '../utils/template-compiler.js'

const resend = new Resend(process.env.RESEND_API_KEY)

function formatDate(date) {
    return new Intl.DateTimeFormat('es-MX', {
        weekday: 'long', // 'miércoles'
        year: 'numeric', // '2026'
        month: 'long', // 'mayo'
        day: 'numeric', // '20'
        hour: '2-digit', // '04'
        minute: '2-digit', // '30'
        hour12: true, // AM/PM
        timeZone: 'America/Mexico_City', // Asegura la hora correcta local
    }).format(date)
}

export const sendAccountVerificationEmail = async (data) => {
    try {
        const htmlContent = await renderTemplate('verificar-cuenta', {
            fullName: data.fullName,
            link: `${process.env.FRONTEND_URL}/verificar-cuenta?token=${data.token}`,
        })

        const { data: response, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: data.email,
            subject: 'Completa tu registro - Establece tu contraseña',
            html: htmlContent,
        })

        if (error) throw error

        console.log('Correo enviado: ', response)
        return response
    } catch (error) {
        console.error('Error sending email:', error.message)
    }
}

export const sendAppointmentConfirmationEmail = async (data) => {
    try {
        const htmlContent = await renderTemplate('confirmacion-cita', {
            patientFullName: data.patientName,
            dentistFullName: data.dentistName,
            date: formatDate(data.appointmentDate),
            cubicle: data.cubicle,
        })

        const { data: response, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: data.email,
            subject: 'Confirmación de cita médica',
            html: htmlContent,
        })

        if (error) throw error

        console.log('Correo enviado:', response)
        return response
    } catch (error) {
        console.error('Error enviando email:', error.message)
    }
}

export const sendAppointmentReminderEmail = async (data) => {
    try {
        const htmlContent = await renderTemplate('recordatorio-cita', {
            patientFullName: data.patientName,
            dentistFullName: data.dentistName,
            date: formatDate(new Date(data.appointmentDate)),
            cubicle: data.cubicle,
        })

        const { data: response, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: data.email,
            subject: 'Recordatorio de cita médica',
            html: htmlContent,
        })

        if (error) throw error

        console.log('Correo enviado:', response)
        return response
    } catch (error) {
        console.error('Error enviando email:', error.message)
    }
}
