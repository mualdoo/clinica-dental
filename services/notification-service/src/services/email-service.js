import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendAccountVerificationEmail = async (data) => {
    try {
        const response = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: data.email,
            subject: 'Verifica tu cuenta',
            html: `
            ${data.fullName}.
            Ingresa al siguiente enlace para verificar tu cuenta: ${data.token}
            El enlace expirará en 24h.
            `
        });

        console.log('Email sent:', response.id);
    } catch (error) {
        console.error('Error sending email:', error.message)
    }
};

export const sendAppointmentConfirmationEmail = async (data) => {
    try {
        const response = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: data.email,
            subject: 'Confirmación de cita médica',
            html: `
                <h2>Hola ${data.fullName}</h2>
                <h2>Tu cita ha sido confirmada</h2>
                <p><strong>Fecha:</strong> ${data.appointmentDate}</p>
            `
        });

        console.log("Email enviado:", response.id);
    } catch (error) {
        console.error("Error enviando email:", error.message);
    }
};