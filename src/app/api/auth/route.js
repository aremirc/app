import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'
import { setAuthCookies, setRefreshTokenCookies, removeAuthCookies } from '@/lib/cookies'
import { NextResponse } from 'next/server' // Importamos NextResponse

// Función para manejar el login
export async function POST(req) {
  try {
    const { usernameOrEmail, password } = await req.json()

    // Validar que ambos campos están presentes
    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { error: 'Nombre de usuario o correo electrónico y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Buscar el usuario por nombre de usuario o correo electrónico
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: usernameOrEmail },
          { username: usernameOrEmail },
        ],
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    // Verificar la contraseña usando bcrypt
    const isPasswordValid = await (password === user.password || bcrypt.compare(password, user.password))
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    // Verificar las variables de entorno necesarias
    const requiredEnvVars = ['JWT_SECRET', 'JWT_EXPIRATION', 'REFRESH_TOKEN_SECRET', 'REFRESH_TOKEN_EXPIRATION']
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        return NextResponse.json(
          { error: `Falta la variable de entorno ${varName}` },
          { status: 500 }
        )
      }
    }

    // Generar un JWT (Access Token)
    const accessToken = jwt.sign(
      { dni: user.dni, username: user.username, roleId: user.roleId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    )

    // Generar un Refresh Token (para obtener un nuevo JWT)
    const refreshToken = jwt.sign(
      { dni: user.dni, username: user.username, roleId: user.roleId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
    )

    // Obtener el rol del usuario
    const role = await prisma.role.findUnique({ where: { id: user.roleId } })

    const res = NextResponse.json(
      {
        message: 'Inicio de sesión exitoso',
        userData: {
          id: user.dni,
          name: user.username,
          roleId: user.roleId,
          role: role.name,
          avatar: 'https://cdn.pixabay.com/photo/2024/07/22/17/11/elegance-in-profile-8913207_640.png',
          notifications: 3,
        },
      },
      { status: 200 }
    )

    // Establecemos las cookies con el token y el refresh token
    setAuthCookies(res, accessToken, user.roleId) // Setea el JWT en cookie HttpOnly
    setRefreshTokenCookies(res, refreshToken) // Setea el refresh token en cookie HttpOnly

    return res
  } catch (error) {
    console.error('Error en el proceso de login:', error)
    return NextResponse.json(
      { error: 'Ocurrió un error en el proceso de inicio de sesión' },
      { status: 500 }
    )
  }
}

// Función para manejar el logout
export async function DELETE(req) {
  try {
    // Eliminar cookies de sesión
    const res = NextResponse.json(
      { message: 'Sesión cerrada correctamente' },
      { status: 200 }
    )

    // Eliminar cookies de JWT y refresh token
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
