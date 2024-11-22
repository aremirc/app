import { RateLimiterMemory } from 'rate-limiter-flexible';

// Configuración del Rate Limiter
const rateLimiter = new RateLimiterMemory({
  points: 5, // Cuántas solicitudes por IP permitimos por segundo
  duration: 1, // Duración en segundos
});

export async function rateLimit(req) {
  try {
    // Obtener la IP del cliente (considerando proxies)
    const ip = req.headers.get('x-forwarded-for') || req.socket.remoteAddress;

    // Intentamos consumir un punto de la IP solicitante
    await rateLimiter.consume(ip);

    // Si no se excedió el límite, no hay error, retorna null (todo bien)
    return null;
  } catch (err) {
    // Si se excede el límite, respondemos con un error 429 (Too Many Requests)
    return new Response(
      JSON.stringify({ message: 'Too many requests, please try again later.' }),
      { status: 429 }
    );
  }
}
