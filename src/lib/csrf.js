import csrf from 'csrf';

const tokens = new csrf();

export function verifyCsrfToken(req) {
  // Obtener el token CSRF del encabezado
  const csrfToken = req.headers.get('csrf-token'); // 'get' para acceder a los encabezados en Next.js

  if (!csrfToken) {
    throw new Error('No CSRF token provided');
  }

  // Verificar que el token CSRF sea válido
  const valid = tokens.verify(process.env.CSRF_SECRET, csrfToken);

  if (!valid) {
    throw new Error('Token CSRF no válido');
  }
}
