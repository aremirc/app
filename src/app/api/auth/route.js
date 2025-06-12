import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'
import { setAuthCookies, setRefreshTokenCookies, removeAuthCookies } from '@/lib/cookies'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { usernameOrEmail, password } = await req.json()

    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { error: 'Nombre de usuario o correo electrónico y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { email: usernameOrEmail },
          { username: usernameOrEmail },
        ],
      },
      select: {
        avatar: true,
        dni: true,
        firstName: true,
        gender: true,
        birthDate: true,
        isVerified: true,
        lastName: true,
        notifications: true,
        password: true,
        role: {
          select: { name: true },
        },
        status: true,
        roleId: true,
        username: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      return NextResponse.json(
        { error: 'Cuenta temporalmente bloqueada. Intenta más tarde.' },
        { status: 403 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      const attempts = user.failedLoginAttempts + 1
      const MAX_ATTEMPTS = 5
      const LOCK_MINUTES = 15

      if (attempts >= MAX_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCK_MINUTES * 60000)
        await prisma.$executeRawUnsafe(
          `UPDATE "User" SET "failedLoginAttempts" = $1, "lockedUntil" = $2 WHERE "dni" = $3`,
          attempts,
          lockUntil,
          user.dni
        )
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE "User" SET "failedLoginAttempts" = $1 WHERE "dni" = $2`,
          attempts,
          user.dni
        )
      }

      const errorMessage = attempts >= MAX_ATTEMPTS
        ? 'Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.'
        : 'Credenciales incorrectas'

      return NextResponse.json({ error: errorMessage }, { status: 401 })
    }

    if (!user.isVerified) {
      return NextResponse.json({ error: 'El usuario no está verificado' }, { status: 401 })
    }

    if (user.status !== 'ACTIVE') {
      let mensaje = 'Tu cuenta no está activa.'

      if (user.status === 'PENDING_VERIFICATION') {
        mensaje = 'Debes verificar tu cuenta antes de iniciar sesión.'
      } else if (user.status === 'SUSPENDED') {
        mensaje = 'Tu cuenta ha sido suspendida. Contacta al soporte.'
      } else if (user.status === 'INACTIVE') {
        mensaje = 'Tu cuenta está inactiva. Solicita reactivación.'
      }

      return NextResponse.json({ error: mensaje }, { status: 403 })
    }

    // Password correcto → resetear fallos y actualizar login
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "failedLoginAttempts" = 0, "lockedUntil" = NULL, "lastLogin" = $1 WHERE "dni" = $2`,
      new Date(),
      user.dni
    )

    delete user.isVerified
    delete user.password
    delete user.status
    delete user.failedLoginAttempts
    delete user.lockedUntil

    const requiredEnvVars = ['JWT_SECRET', 'JWT_EXPIRATION', 'REFRESH_TOKEN_SECRET', 'REFRESH_TOKEN_EXPIRATION']
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        return NextResponse.json(
          { error: `Falta la variable de entorno ${varName}` },
          { status: 500 }
        )
      }
    }

    const accessToken = jwt.sign(
      { dni: user.dni, username: user.username, role: user.role.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    )

    const refreshToken = jwt.sign(
      { dni: user.dni, username: user.username, role: user.role.name },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
    )

    const res = NextResponse.json(
      {
        message: 'Inicio de sesión exitoso',
        userData: user,
      },
      { status: 200 }
    )

    setAuthCookies(res, accessToken, user.roleId)
    setRefreshTokenCookies(res, refreshToken)

    return res
  } catch (error) {
    console.error('Error en el proceso de login:', error)
    return NextResponse.json(
      { error: 'Ocurrió un error en el proceso de inicio de sesión' },
      { status: 500 }
    )
  }
}

export async function DELETE(req) {
  try {
    const res = NextResponse.json(
      { message: 'Sesión cerrada correctamente' },
      { status: 200 }
    )

    removeAuthCookies(res)

    return res
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    return NextResponse.json(
      { error: 'Ocurrió un error al cerrar sesión' },
      { status: 500 }
    )
  }
}
