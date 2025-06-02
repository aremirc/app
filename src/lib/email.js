import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendPasswordResetEmail(to, resetUrl) {
  await transporter.sendMail({
    from: `"Soporte" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Recuperación de contraseña',
    html: `
      <p>Solicitaste recuperar tu contraseña.</p>
      <p><a href="${resetUrl}">Haz clic aquí para restablecerla</a></p>
      <p>Este enlace expirará en 15 minutos.</p>
    `,
  })
}
