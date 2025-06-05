import { serialize, parse } from 'cookie'

export function setAuthCookies(response, token, role) {
  const cookies = [
    serialize('token', token, {
      maxAge: 60 * 60,  // 1 hora
      path: '/',
      secure: process.env.NODE_ENV === 'production',  // Solo en producción
      sameSite: 'Strict',  // O 'strict' si no necesitas compartir entre sitios
      httpOnly: true,   // No accesible desde JavaScript
    }),
    serialize('user_role', role, {
      maxAge: 60 * 60,  // 1 hora
      path: '/',
      secure: process.env.NODE_ENV === 'production',  // Solo en producción
      sameSite: 'Strict',  // Evita el envío de la cookie en solicitudes de terceros
      httpOnly: true,
    })
  ]

  // Agregar todas las cookies a la respuesta
  response.headers.set('Set-Cookie', cookies.join(', '))  // Usamos `join` para que las cookies no se sobrescriban
}

export function removeAuthCookies(response) {
  const cookies = [
    serialize('token', '', {
      maxAge: -1,  // Caducar la cookie
      path: '/',
    }),
    serialize('user_role', '', {
      maxAge: -1,  // Caducar la cookie
      path: '/',
    }),
    serialize('refresh_token', '', {
      maxAge: -1,  // Caducar la cookie
      path: '/',
    })
  ]

  // Agregar todas las cookies de eliminación a la respuesta
  response.headers.set('Set-Cookie', cookies.join(', '))  // Usamos `join` para asegurarnos de no sobrescribir
}

export function setRefreshTokenCookies(response, refreshToken) {
  const refreshTokenCookie = serialize('refresh_token', refreshToken, {
    maxAge: 60 * 60 * 24 * 7,  // 7 días
    path: '/',
    secure: process.env.NODE_ENV === 'production', // Solo en producción
    sameSite: 'Strict',  // O 'strict' si no necesitas compartir entre sitios
    httpOnly: true,   // No accesible desde JavaScript
  })

  // Establecer la cookie de refresh token
  response.headers.append('Set-Cookie', refreshTokenCookie)  // Usamos `append` para agregar la cookie sin sobrescribir
}

export function removeRefreshTokenCookies(response) {
  response.headers.set('Set-Cookie', serialize('refresh_token', '', {
    maxAge: -1,  // Caducar la cookie
    path: '/',
  }))
}

export function getCookies(request) {
  const cookies = request.headers.get('Cookie') || ''
  return parse(cookies)
}