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
    // Obtener los detalles del usuario por dni
    const user = await prisma.user.findFirst({
      where: {
        dni: id,  // Buscamos por el DNI
        deletedAt: null,
      },
      include: {
        role: true,  // Incluir el rol asociado
        visits: {
          where: { deletedAt: null }, // solo visitas activas
        },
        availability: true,
        managedOrders: {
          where: { deletedAt: null }, // solo órdenes activas
        },
        orderWorkers: true,
      },
    })

    // Si no se encuentra al usuario, devolver 404
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Excluir la contraseña antes de enviar la respuesta
    const { password: _, ...userWithoutPassword } = user

    // Devolver los detalles del usuario
    return NextResponse.json(userWithoutPassword, { status: 200 })
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 })
  }
}
