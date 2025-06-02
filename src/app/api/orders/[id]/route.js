import { NextResponse } from 'next/server'
import { verifyAndLimit } from '@/lib/permissions'  // Función para verificar permisos
import prisma from '@/lib/prisma'  // Instancia de Prisma

export async function GET(req, { params }) {
  const { id } = await params // Extraemos el `id` de los parámetros de la URL

  // Verificamos los permisos del usuario
  const authResponse = await verifyAndLimit(req)
  if (authResponse) {
    return authResponse  // Si no tiene permisos, devolvemos una respuesta con error 403
  }

  try {
    // Obtener los detalles de la orden por `id`
    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(id), // Asegúrate de que el `id` sea un número
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
          include: {
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
          },
        },
        visits: {
          include: {
            // user: true,
            // evidences: true,
          },
        },
        // services: true,
        // managedBy: true,
        locations: true,
        conformity: true,
      },
    })

    // Si no se encuentra la orden, devolver un 404
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Devolver los detalles de la orden
    return NextResponse.json(order, { status: 200 })
  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
