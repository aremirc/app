import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'
import { parse } from 'cookie'
import { setAuthCookies, setRefreshTokenCookies } from '@/lib/cookies'

const JWT_SECRET = process.env.JWT_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
const JWT_EXPIRATION = process.env.JWT_EXPIRATION
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION

const createToken = (user, secret, expiration) => {
  return jwt.sign(
    {
      dni: user.dni,
      username: user.username,
      role: user.role.name
    },
    secret,
    { expiresIn: expiration }
  )
}

const errorResponse = (message, errorDetails, status) => {
  return NextResponse.json(
    {
      status: 'error',
      message,
      errorDetails,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

export async function GET(req) {
  try {
    const cookies = parse(req.headers.get('cookie') || '')
    const token = cookies.token
    const refresh_token = cookies.refresh_token

    if (!token) {
      const hasRefreshToken = Boolean(refresh_token)

      return NextResponse.json({
        status: 'success',
        message: 'Hola, puedes seguir explorando libremente.',
        code: hasRefreshToken ? 1027 : 1000,
        timestamp: new Date().toISOString(),
      }, { status: 200 })
    }

    const decoded = jwt.decode(token)
    if (!decoded) {
      return errorResponse('Token inválido', 'El token no pudo ser decodificado', 401)
    }

    try {
      jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return errorResponse('Token expirado o inválido', err.message, 401)
    }

    const user = await prisma.user.findUnique({
      where: { dni: decoded.dni },
      select: {
        avatar: true,
        dni: true,
        firstName: true,
        gender: true,
        birthDate: true,
        lastName: true,
        notifications: true,
        role: {
          select: {
            name: true,
          },
        },
        roleId: true,
        username: true,
      }
    })

    if (!user) {
      return errorResponse('Usuario no encontrado', 'No se pudo encontrar el usuario asociado al token', 404)
    }

    return NextResponse.json({
      status: 'success',
      message: 'Datos de usuario obtenidos exitosamente',
      data: { user },
      timestamp: new Date().toISOString(),
    }, { status: 200 })

  } catch (err) {
    console.error('Error al verificar la sesión:', err)
    return errorResponse('No autenticado o sesión inválida', err.message, 401)
  }
}

export async function POST(req) {
  try {
    const cookies = req.cookies
    const refreshToken = cookies.get('refresh_token')?.value ?? null // nullish coalescing

    if (!refreshToken) {
      return errorResponse('No se proporcionó refresh token', 'Falta el refresh token en la solicitud', 400)
    }

    let decoded
    try {
      decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET)
    } catch (err) {
      return errorResponse('Refresh token no válido', err.message, 401)
    }

    const user = await prisma.user.findUnique({
      where: { dni: decoded.dni },
      select: {
        dni: true,
        username: true,
        roleId: true,
        role: {
          select: { name: true }
        }
      }
    })

    if (!user) {
      return errorResponse('Usuario no encontrado', 'No se pudo encontrar el usuario asociado al refresh token', 404)
    }

    const newAccessToken = createToken(user, JWT_SECRET, JWT_EXPIRATION)
    const newRefreshToken = createToken(user, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRATION)

    const res = NextResponse.json(
      {
        status: 'success',
        message: 'Tokens renovados exitosamente',
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )

    setAuthCookies(res, newAccessToken, user.roleId)
    setRefreshTokenCookies(res, newRefreshToken)

    return res
  } catch (error) {
    console.error('Error al renovar el token:', error)
    return errorResponse('Ocurrió un error al renovar el token', error.message, 500)
  }
}
