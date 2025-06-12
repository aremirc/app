import { NextResponse } from 'next/server'
import { verifyAndLimit } from '@/lib/permissions' // Función para verificar permisos
import prisma from '@/lib/prisma'  // Instancia de Prisma

export async function GET(req, { params }) {
  const { id } = await params  // Extraemos el id de los parámetros de la URL

  const authResponse = await verifyAndLimit(req, ["ADMIN", "SUPERVISOR"])
  if (authResponse) {
    return authResponse  // Si no tiene permisos, devolver respuesta con error 403
  }

  try {
    const client = await prisma.client.findFirst({
      where: {
        id, // Buscamos por el RUC/DNI (id del cliente)
        deletedAt: null, // Ignorar eliminados lógicamente
      },
      include: {
        orders: {
          where: { deletedAt: null }, // Opcional: incluir solo órdenes activas
        },
        visits: {
          where: { deletedAt: null }, // Opcional: incluir solo visitas activas
        },
      },
    })

    // Si no se encuentra al cliente, devolver 404
    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Excluir la contraseña antes de enviar la respuesta
    const { password: _, ...clientWithoutPassword } = client
    return NextResponse.json(clientWithoutPassword, { status: 200 })
  } catch (error) {
    console.error('Error al obtener cliente:', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 })
  }
}
