import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { verifyJWT } from '@/lib/auth' // Asumimos que este es el archivo donde tienes verifyJWT
import { setAuthCookies, setRefreshTokenCookies } from '@/lib/cookies'

export async function GET(req) {
  const decoded = await verifyJWT(req)
  if (decoded?.error) return decoded // Si verifyJWT devuelve una respuesta de error, la devolvemos directamente

  try {
    const user = await prisma.user.findUnique({
      where: { dni: decoded.dni },
      select: {
        dni: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Error en /api/profile [GET]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(req) {
  const decoded = await verifyJWT(req)
  if (decoded?.error) return decoded // Si verifyJWT devuelve una respuesta de error, la devolvemos directamente

  try {
    const { username, email, password } = await req.json()

    if (!username && !email && !password) {
      return NextResponse.json({ error: 'Debes enviar al menos un campo para actualizar' }, { status: 400 })
    }

    const updates = {}

    if (username) updates.username = username

    if (email) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Correo electrónico no válido' }, { status: 400 })
      }
      updates.email = email
    }

    if (password) {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
      if (!passwordRegex.test(password)) {
        return NextResponse.json({
          error: 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números',
        }, { status: 400 })
      }
      updates.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { dni: decoded.dni },
      data: updates,
    })

    const role = await prisma.role.findUnique({
      where: { id: updatedUser.roleId },
    })

    const newAccessToken = jwt.sign(
      {
        dni: updatedUser.dni,
        username: updatedUser.username,
        roleId: updatedUser.roleId,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    )

    const newRefreshToken = jwt.sign(
      {
        dni: updatedUser.dni,
        username: updatedUser.username,
        roleId: updatedUser.roleId,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
    )

    const res = NextResponse.json({
      message: 'Perfil actualizado correctamente',
      user: {
        dni: updatedUser.dni,
        username: updatedUser.username,
        email: updatedUser.email,
        role: role?.name,
      },
    }, { status: 200 })

    setAuthCookies(res, newAccessToken, updatedUser.roleId)
    setRefreshTokenCookies(res, newRefreshToken)

    return res
  } catch (error) {
    console.error('Error en /api/profile [PATCH]:', error)
    return NextResponse.json({ error: 'Error al actualizar el perfil' }, { status: 500 })
  }
}
