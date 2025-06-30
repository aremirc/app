import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'
import { verifyJWT } from '@/lib/auth'
import { setAuthCookies, setRefreshTokenCookies } from '@/lib/cookies'

export async function GET(req) {
  const decoded = await verifyJWT(req)
  if (decoded?.error) return decoded

  try {
    const user = await prisma.user.findUnique({
      where: { dni: decoded.dni },
      select: {
        dni: true,
        avatar: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        isVerified: true,
        lastLogin: true,
        birthDate: true,
        address: true,
        country: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
        socialLinks: true,
        notifications: {
          where: { isRead: false },
          orderBy: { createdAt: 'desc' },
          take: 5, // solo las últimas 5
        },
        role: {
          select: { name: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Error al obtener datos del perfil:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PATCH(req) {
  const decoded = await verifyJWT(req)
  if (decoded?.error) return decoded

  try {
    const { username, email, password, firstName, lastName, phone, country, avatar } = await req.json()

    if (!username && !email && !password && !firstName && !lastName && !phone && !country && !avatar) {
      return NextResponse.json({ error: 'Debes enviar al menos un campo para actualizar' }, { status: 400 })
    }

    const updates = {}

    if (username) updates.username = username
    if (firstName) updates.firstName = firstName
    if (lastName) updates.lastName = lastName
    if (phone) updates.phone = phone
    if (country) updates.country = country
    if (avatar) updates.avatar = avatar

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Correo electrónico no válido' }, { status: 400 })
      }
      // updates.email = email
    }

    if (password) {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
      if (!passwordRegex.test(password)) {
        return NextResponse.json({
          error: 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números',
        }, { status: 400 })
      }
      updates.password = await bcrypt.hash(password, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { dni: decoded.dni },
      data: updates,
    })

    const role = await prisma.role.findUnique({
      where: { id: updatedUser.roleId },
    })

    const payload = {
      dni: updatedUser.dni,
      username: updatedUser.username,
      role: role?.name,
    }

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    })

    const newRefreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    })

    const res = NextResponse.json({
      message: 'Perfil actualizado correctamente',
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        country: updatedUser.country,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
      },
    }, { status: 200 })

    setAuthCookies(res, newAccessToken, updatedUser.roleId)
    setRefreshTokenCookies(res, newRefreshToken)

    return res
  } catch (error) {
    console.error('Error al actualizar el perfil:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
