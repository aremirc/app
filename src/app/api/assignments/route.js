import { NextResponse } from 'next/server'
import { verifyAndLimit } from '@/lib/permissions'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const authResponse = await verifyAndLimit(req, ["ADMIN", "SUPERVISOR"])
  if (authResponse) return authResponse

  try {
    const { searchParams } = new URL(req.url)

    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const clientId = searchParams.get('clientId')
    const userId = searchParams.get('userId')
    const orderId = searchParams.get('orderId')
    const status = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'REASSIGNED', 'DECLINED'].includes(searchParams.get('status')) ? searchParams.get('status') : null

    const filters = {}

    if (userId) filters.userId = userId
    if (orderId) filters.orderId = parseInt(orderId)
    if (status) filters.status = status
    if (from || to) {
      filters.createdAt = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      }
    }

    const where = {
      ...filters,
      order: {
        ...(clientId && {
          clientId,
        }),
        deletedAt: null,
      },
    }

    const assignments = await prisma.orderWorker.findMany({
      where,
      include: {
        user: {
          select: {
            dni: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        order: {
          select: {
            id: true,
            description: true,
            scheduledDate: true,
            status: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error al obtener las asignaciones técnicas', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 })
  }
}

// Umbral de carga máxima
const MAX_LOAD = 3

export async function POST(req) {
  const authResponse = await verifyAndLimit(req, ["ADMIN"])
  if (authResponse) return authResponse

  try {
    const body = await req.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: "Falta el orderId" }, { status: 400 })
    }

    // Buscar orden y verificar que tenga fecha programada
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        scheduledDate: true,
        endDate: true,
      },
    })

    if (!order || !order.scheduledDate) {
      return NextResponse.json({ error: "Orden no encontrada o sin fecha programada" }, { status: 404 })
    }

    const scheduledDate = order.scheduledDate
    const now = new Date()

    if (scheduledDate < now) {
      return NextResponse.json({ error: "La fecha programada ya ha pasado" }, { status: 400 })
    }

    // Estimar duración si no hay endDate
    const endDate = order.endDate ?? new Date(scheduledDate.getTime() + 2 * 60 * 60 * 1000) // +2h por defecto

    // Buscar técnicos disponibles con disponibilidad adecuada
    const availableUsers = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
        availability: {
          some: {
            type: "FULL_TIME",
            startDate: { lte: scheduledDate },
            endDate: { gte: endDate },
          },
        },
      },
      include: {
        orderWorkers: {
          where: {
            status: {
              in: ["ASSIGNED", "IN_PROGRESS"],
            },
          },
          select: {
            order: {
              select: {
                scheduledDate: true,
                endDate: true,
              },
            },
            status: true,
          },
        },
      },
    })

    if (!availableUsers.length) {
      return NextResponse.json({ error: "No hay técnicos disponibles para la fecha programada" }, { status: 404 })
    }

    // Filtrar por carga de trabajo y conflictos de horario
    const candidates = []

    for (const user of availableUsers) {
      const currentLoad = user.orderWorkers.length

      if (currentLoad >= MAX_LOAD) continue

      const hasConflict = user.orderWorkers.some((ow) => {
        const otherStart = ow.order.scheduledDate
        const otherEnd = ow.order.endDate ?? new Date(otherStart.getTime() + 2 * 60 * 60 * 1000)

        // Termina después de que empieza la nueva y empieza antes de que termine la nueva
        return scheduledDate < otherEnd && endDate > otherStart
      })

      if (!hasConflict) {
        candidates.push({ ...user, currentLoad })
      }
    }

    // Ordenar por menor carga
    const sorted = candidates.sort((a, b) => a.currentLoad - b.currentLoad)
    const selectedUser = sorted[0]

    if (!selectedUser) {
      return NextResponse.json({ error: "No se encontró un técnico sin conflicto de horario y con carga aceptable" }, { status: 409 })
    }

    // Transacción para asignar técnico
    const [assignment] = await prisma.$transaction([
      prisma.orderWorker.create({
        data: {
          orderId,
          userId: selectedUser.dni,
          status: "ASSIGNED",
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { updatedAt: new Date() },
      }),
    ])

    return NextResponse.json({
      message: "Técnico asignado automáticamente",
      assignment,
    })
  } catch (error) {
    console.error("Error en asignación automática:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
