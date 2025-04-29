import { NextResponse } from 'next/server'

export function middleware(req) {
  // const protocol = req.headers.get('x-forwarded-proto') || 'http'
  // const host = req.headers.get('host')
  // const url = req.nextUrl.pathname
  
  // if (protocol !== 'https') {
  //   // Redirigir a HTTPS con la URL correctamente formada
  //   return  NextResponse.redirect(`https://${host}${url}`, 301)
  // }

  // Crear la respuesta y establecer las cabeceras de seguridad
  const res = NextResponse.next()
  
  // 1. HSTS (Strict-Transport-Security) - Fuerza el uso de HTTPS
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

  // 2. CSP (Content-Security-Policy) - Restringe las fuentes de contenido cargado en la página
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' https://www.example.com; object-src 'none'; font-src 'self';"
  )

  // 3. X-Content-Type-Options - Previene la detección automática de tipo MIME
  res.headers.set('X-Content-Type-Options', 'nosniff')

  //  X-Frame-Options - Previene ataques de clickjacking (evita que la página sea embebida en un iframe)
  res.headers.set('X-Frame-Options', 'DENY')

  // 5. X-XSS-Protection - Previene ataques de Cross-Site Scripting (XSS)
  res.headers.set('X-XSS-Protection', '1; mode=block')

  // 6. Referrer-Policy - Controla la cantidad de información sobre el origen que se envía con las solicitudes
  res.headers.set('Referrer-Policy', 'no-referrer-when-downgrade')

  // 7. Permissions-Policy - Restringe qué características del navegador pueden ser utilizadas por la página
  res.headers.set('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()')

  // 8. Cache-Control - Controla el almacenamiento en caché de las respuestas, importante para prevenir la exposición de contenido sensible
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')

  // 9. Feature-Policy - Limita el uso de ciertas características de los navegadores, como WebRTC, geolocalización, etc.
  res.headers.set('Feature-Policy', 'geolocation "self"; microphone "none"; camera "none"')

  return res
}
