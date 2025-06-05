import csrf from 'csrf'

const tokens = new csrf()

export function verifyCsrfToken(req) {
  // Obtener el token CSRF del encabezado
  const csrfToken = req.headers.get('csrf-token') // 'get' para acceder a los encabezados en Next.js

  if (!csrfToken) {
    throw new Error('CSRF token no enviado')
  }

  const csrfSecret = process.env.CSRF_SECRET

  if (!csrfSecret) {
    throw new Error('CSRF_SECRET no configurado en el entorno')
  }

  // Verificar que el token CSRF sea válido
  const valid = tokens.verify(csrfSecret, csrfToken)

  if (!valid) {
    throw new Error('Token CSRF no válido o expirado')
  }
}
