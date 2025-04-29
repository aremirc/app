// Importa los middlewares desde la carpeta de middleware
import { middleware as authMiddleware } from '@/app/middleware/auth'
import { middleware as sessionMiddleware } from '@/app/middleware/session'
import { middleware as errorMiddleware } from '@/app/middleware/errorHandler'
import { middleware as loggingMiddleware } from '@/app/middleware/logging'
import { middleware as validationMiddleware } from '@/app/middleware/validation'
import { middleware as corsMiddleware } from '@/app/middleware/cors'
import { middleware as compressionMiddleware } from '@/app/middleware/compression'
import { middleware as securityMiddleware } from '@/app/middleware/security'
import { middleware as rateLimitMiddleware } from '@/app/middleware/rateLimit'
import { middleware as modifyResponseMiddleware } from '@/app/middleware/modifyResponse'
import { NextResponse } from 'next/server'

// Aplicar middlewares específicos a rutas
export const config = {
  matcher: [
    '/:path*',  // Aplica a todas las rutas
    '/api/:path*', // Aplica a todas las rutas de la API
  ],
}

// La función middleware global que encadena todos los middlewares
export function middleware(req) {
  // const { pathname } = req.nextUrl

  // if (pathname === '/') {
  //   const newUrl = req.nextUrl.clone()
  //   newUrl.pathname = '/dashboard'
  //   return NextResponse.redirect(newUrl)
  // }

  // Primero, aplicamos la validación de rate limiting
  // rateLimitMiddleware(req)

  // Luego, activamos la autenticación
  authMiddleware(req)

  // Middleware de sesión para verificar cookies
  // sessionMiddleware(req)

  // Logger para registrar solicitudes
  loggingMiddleware(req)

  // Middleware de CORS
  // corsMiddleware(req)

  // Middleware de seguridad para cabeceras
  securityMiddleware(req)

  // Middleware de compresión para respuestas
  compressionMiddleware(req)

  // Manejo de errores global
  errorMiddleware(req)

  // Modificación de respuestas
  // modifyResponseMiddleware(req)

  // Validación de datos de la solicitud (si es necesario)
  validationMiddleware(req)

  // Si todo está bien, continuamos con la solicitud
  return NextResponse.next()
}
