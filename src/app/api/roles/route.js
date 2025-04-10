import prisma from '@/lib/prisma';
import { verifyAndLimit } from '@/lib/permissions'; // Usamos la función de permisos
import { NextResponse } from 'next/server'; // Importar NextResponse

export async function GET(req) {
  // Verificamos el token JWT y aplicamos Rate Limiting
  const authResponse = await verifyAndLimit(req); // No se pasa el rol porque todos pueden ver los roles
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Obtener todos los roles
    const roles = await prisma.role.findMany();
    console.log(roles);

    return NextResponse.json(roles, { status: 200 }); // Usar NextResponse.json()
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return NextResponse.json({ error: "Error al obtener roles" }, { status: 500 });
  }
}
