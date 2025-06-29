import { NextResponse } from 'next/server'
import { verifyAndLimit } from '@/lib/permissions'  // Función para verificar permisos
import { verifyJWT } from '@/lib/auth'
import prisma from '@/lib/prisma'  // Instancia de Prisma

export async function GET(req, { params }) {
  const { id } = await params // Extraemos el `id` de los parámetros de la URL

  const authResponse = await verifyAndLimit(req)
  if (authResponse) {
    return authResponse  // Si no tiene permisos, devolvemos una respuesta con error 403
  }

  try {
    const decoded = await verifyJWT(req)
    if (!decoded || decoded?.error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const userRole = decoded.role
    const userDni = decoded.dni

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id), // Asegúrate de que el `id` sea un número
        deletedAt: null, // Soft delete aplicado
        ...(userRole === 'TECHNICIAN' && {
          workers: {
            some: {
              userId: userDni,
              status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
            },
          },
        }),
      },
      include: {
        client: {
          select: {
            name: true,
            phone: true,
            address: true,
            type: true,
            contactPersonName: true,
            contactPersonPhone: true,
            notes: true,
          },
        },
        workers: {
          select: {
            user: {
              select: {
                dni: true,
                firstName: true,
                lastName: true,
                phone: true,
                gender: true,
                avatar: true,
                birthDate: true,
              },
            },
            isResponsible: true,
          },
          where: {
            user: {
              status: 'ACTIVE',
              deletedAt: null,
            }
          },
        },
        visits: {
          where: { deletedAt: null }, // Opcional: solo visitas activas
          // select: {
          //   user: true,
          //   evidences: true,
          // },
        },
        // services: true,
        // managedBy: true,
        locations: true,
        conformity: true,
      },
    })

    // Si no se encuentra la orden, devolver un 404
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada o acceso denegado' }, { status: 404 })
    }

    // Devolver los detalles de la orden
    return NextResponse.json(order, { status: 200 })
  } catch (error) {
    console.error('Error al obtener orden:', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 })
  }
}
