import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { rateLimit } from '@/lib/rate-limit'
import { sendPasswordResetEmail } from '@/lib/email'

const RESET_SECRET = process.env.RESET_PASSWORD_SECRET || process.env.JWT_SECRET
const RESET_EXPIRATION = process.env.RESET_PASSWORD_EXPIRATION || '15m'

export async function POST(req) {
  const limited = await rateLimit(req)
  if (limited) return limited

  const origin = req.headers.get('origin') || process.env.APP_URL
  const resetUrl = `${origin}/reset-password?token=${token}`
  console.log('Dominio actual:', origin)

  const { email } = await req.json()
  if (!email) {
    return NextResponse.json(
      { error: 'El campo email es requerido' },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json(
      { message: 'Si ese email existe, recibirás un enlace de recuperación.' },
      { status: 200 }
    )
  }

  const token = jwt.sign(
    { dni: user.dni },
    RESET_SECRET,
    { expiresIn: RESET_EXPIRATION }
  )

  try {
    await sendPasswordResetEmail(user.email, resetUrl)
  } catch (err) {
    console.error('Error enviando correo:', err)
    return NextResponse.json(
      { error: 'No se pudo enviar el correo de recuperación' },
      { status: 500 }
    )
  }
  console.log(`Password reset token for ${user.email}: ${token}`)

  return NextResponse.json(
    { message: 'Enlace de recuperación enviado al correo.' },
    { status: 200 }
  )
}

// 2) Consumir el token y cambiar la contraseña
export async function PATCH(req) {
  const { token, newPassword } = await req.json()
  if (!token || !newPassword) {
    return NextResponse.json(
      { error: 'Se requieren token y nueva contraseña' },
      { status: 400 }
    )
  }

  let payload
  try {
    payload = jwt.verify(token, RESET_SECRET)
  } catch (err) {
    return NextResponse.json(
      { error: 'Token inválido o expirado' },
      { status: 401 }
    )
  }

  const { dni } = payload
  const user = await prisma.user.findUnique({ where: { dni } })
  if (!user) {
    return NextResponse.json(
      { error: 'Usuario no encontrado' },
      { status: 404 }
    )
  }

  // Validación de contraseña (mínimo 8 caracteres, letras y números)
  const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  if (!pwdRegex.test(newPassword)) {
    return NextResponse.json(
      { error: 'La contraseña debe tener al menos 8 caracteres, con letras y números' },
      { status: 400 }
    )
  }

  // Hashea y actualiza
  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { dni },
    data: { password: hashed },
  })

  return NextResponse.json(
    { message: 'Contraseña actualizada correctamente' },
    { status: 200 }
  )
}
