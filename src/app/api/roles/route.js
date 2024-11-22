import prisma from '@/lib/prisma';
import { verifyJWT } from '../login/route';
import { rateLimit } from '@/lib/rateLimiter';

export async function GET(req) {
  // Aplicamos Rate Limiting
  const rateLimitResponse = await rateLimit(req);
  if (rateLimitResponse) {
    return rateLimitResponse; // Si el límite se excede, devolver la respuesta 429
  }

  try {
    const user = await verifyJWT(req); // Verificamos el token JWT

    if (user instanceof Response) {
      return user; // Si hay un error con el token, devolvemos la respuesta de error
    }

    const roles = await prisma.role.findMany(); // Obtener todos los roles
    console.log(roles);

    return new Response(JSON.stringify(roles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return new Response(JSON.stringify({ error: "Error al obtener roles" }), {
      status: 500,
    });
  }
}