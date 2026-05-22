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

function evaluateEmail(data) {
    const sendEmail = !data.email.includes('@falso.com')

    if (!sendEmail) {
        console.log('Simulación de correo enviado, con información: ', data)
    }

    return sendEmail
}

export const sendStaffAccountVerificationEmail = async (data) => {
    try {
        if (!evaluateEmail(data)) return true
        const htmlContent = await renderTemplate('verificar-cuenta-staff', {
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

export const sendAccountVerificationEmail = async (data) => {
    try {
        if (!evaluateEmail(data)) return true
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
        if (!evaluateEmail(data)) return true
        const htmlContent = await renderTemplate('confirmacion-cita', {
            patientFullName: data.patientName,
            dentistFullName: data.dentistName,
            date: formatDate(new Date(data.appointmentDate)),
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
        if (!evaluateEmail(data)) return true
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

export const sendPatientFile = async (data) => {
    try {
        if (!evaluateEmail(data)) return true
        const htmlContent = await renderTemplate('compartir-archivo', data)

        const { data: response, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: data.email,
            subject: 'Archivo médico',
            html: htmlContent,
        })

        if (error) throw error

        console.log('Correo enviado:', response)
        return response
    } catch (error) {
        console.error('Error enviando email:', error.message)
    }
}
