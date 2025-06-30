import { NextResponse } from 'next/server'
import { verifyCsrfToken } from '@/lib/csrf'
import { verifyAndLimit } from '@/lib/permissions'
import { verifyJWT } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const authResponse = await verifyAndLimit(req)
  if (authResponse) return authResponse

  try {
    const decoded = await verifyJWT(req)
    if (!decoded || decoded?.error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const dateStart = searchParams.get('dateStart')
    const dateEnd = searchParams.get('dateEnd')
    const orderId = searchParams.get('orderId')
    const clientId = searchParams.get('clientId')
    const isReviewed = searchParams.get('isReviewed')
    const dniFromQuery = searchParams.get('dni')

    const userRole = decoded.role
    const userDni = decoded.dni

    const whereClause = {
      deletedAt: null,
      user: {
        status: 'ACTIVE',
      },
      order: {
        deletedAt: null,
      }
    }

    // Si el usuario es TECHNICIAN, ver solo sus propias visitas
    if (userRole === 'TECHNICIAN') {
      whereClause.order = {
        status: 'IN_PROGRESS',
        workers: {
          some: {
            userId: userDni,
            status: {
              in: ['ASSIGNED', 'IN_PROGRESS'],
            },
          },
        },
      }
    }

    // Si es ADMIN o SUPERVISOR, puede filtrar por dni manualmente
    if (userRole !== 'TECHNICIAN' && dniFromQuery) {
      whereClause.order = {
        ...whereClause.order,
        workers: {
          some: {
            userId: dniFromQuery,
          },
        },
      }
    }

    if (dateStart || dateEnd) {
      whereClause.date = {}
      if (dateStart) whereClause.date.gte = new Date(dateStart)
      if (dateEnd) whereClause.date.lte = new Date(dateEnd)
    }

    if (orderId) {
      whereClause.orderId = parseInt(orderId)
    }

    if (clientId) {
      whereClause.clientId = clientId
    }

    if (isReviewed === 'true' || isReviewed === 'false') {
      whereClause.isReviewed = isReviewed === 'true'
    }

    const visits = await prisma.visit.findMany({
      where: whereClause,
      select: {
        id: true,
        date: true,
        endTime: true,
        description: true,
        orderId: true,
        userId: true,
        clientId: true,
        isReviewed: true,
        evaluation: true,
        updatedAt: true,
        client: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(visits, { status: 200 })
  } catch (error) {
    console.error('Error al obtener visitas:', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    verifyCsrfToken(req)

    const authResponse = await verifyAndLimit(req)
    if (authResponse) return authResponse

    const { orderId, userId, date, endTime, description, clientId, isReviewed, evaluation } = await req.json()

    if (!orderId || !userId || !date || !description || !endTime) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }

    if (!date || typeof date !== "string" || isNaN(Date.parse(date))) {
      return NextResponse.json({ error: 'Fecha de inicio inválida' }, { status: 400 })
    }

    if (!endTime || typeof endTime !== "string" || isNaN(Date.parse(endTime))) {
      return NextResponse.json({ error: 'Fecha de fin inválida' }, { status: 400 })
    }

    const visitStart = new Date(date)
    const visitEnd = new Date(endTime)

    if (isNaN(visitEnd.getTime()) || visitEnd <= visitStart) {
      return NextResponse.json({ error: 'La hora de fin debe ser posterior a la de inicio' }, { status: 400 })
    }

    const now = new Date()
    if (visitStart > now) {
      return NextResponse.json({ error: 'La fecha de la visita no puede ser en el futuro' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order || !order.clientId) {
      return NextResponse.json({ error: 'Orden no encontrada o sin cliente asignado' }, { status: 400 })
    }

    // Validar si la visita está dentro del rango de fechas de la orden
    if (order.scheduledDate && visitStart < order.scheduledDate) {
      return NextResponse.json({
        error: 'La fecha de la visita no puede ser anterior a la fecha programada de la orden',
      }, { status: 400 })
    }

    if (order.endDate && visitEnd > order.endDate) {
      return NextResponse.json({
        error: 'La fecha de fin de la visita no puede ser posterior a la fecha de fin de la orden',
      }, { status: 400 })
    }

    if (!["PENDING", "IN_PROGRESS"].includes(order.status)) {
      return NextResponse.json({ error: 'La orden no está en un estado válido' }, { status: 400 })
    }

    const isAssigned = await prisma.orderWorker.findUnique({
      where: { orderId_userId: { orderId, userId } }
    })

    if (!isAssigned) {
      return NextResponse.json({ error: 'El trabajador no está asignado a esta orden' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { dni: userId } })
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 })
    }

    // const availability = await prisma.availability.findFirst({
    //   where: {
    //     userId: userId,
    //     startDate: { lte: visitStart },
    //     endDate: { gte: visitStart },
    //   },
    // })

    // if (!availability) {
    //   return NextResponse.json({ error: 'El usuario no está disponible en esta fecha' }, { status: 400 })
    // }

    if (evaluation !== undefined && (isNaN(evaluation) || evaluation < 0 || evaluation > 5)) {
      return NextResponse.json({ error: 'La evaluación debe ser un número entre 0 y 5' }, { status: 400 })
    }

    if (isReviewed && (evaluation === null || evaluation === undefined)) {
      return NextResponse.json({ error: 'Debe proporcionar una evaluación si la visita ha sido revisada' }, { status: 400 })
    }

    const decoded = await verifyJWT(req)
    const createdBy = decoded?.dni || "system"

    const newVisit = await prisma.visit.create({
      data: {
        orderId,
        userId,
        clientId: order.clientId,
        date: visitStart,
        endTime: visitEnd,
        description,
        evaluation: evaluation ?? null,
        isReviewed: typeof isReviewed === 'boolean' ? isReviewed : false,
        createdBy,
      },
      include: {
        order: true,
        user: true,
        client: true,
      },
    })

    // Revisar si esta es la primera visita
    const existingVisits = await prisma.visit.count({ where: { orderId } })

    // Si está en PENDING y es la primera visita, actualizamos todo en una transacción
    if (order.status === "PENDING" && existingVisits === 1) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: "IN_PROGRESS" }
        }),
        prisma.orderWorker.updateMany({
          where: {
            orderId,
            status: "ASSIGNED"
          },
          data: {
            status: "IN_PROGRESS"
          }
        })
      ])
    } else if (order.status === "IN_PROGRESS") {
      // Si ya está en progreso, aseguramos que los técnicos también estén actualizados
      await prisma.orderWorker.updateMany({
        where: {
          orderId,
          status: "ASSIGNED"
        },
        data: {
          status: "IN_PROGRESS"
        }
      })
    }

    return NextResponse.json(newVisit, { status: 201 })
  } catch (error) {
    if (error.message?.includes('CSRF')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error al crear la visita:', error)
    return NextResponse.json({ error: 'Error al crear la visita' }, { status: 500 }) // Usamos NextResponse
  }
}

export async function PUT(req) {
  try {
    verifyCsrfToken(req)

    const authResponse = await verifyAndLimit(req)
    if (authResponse) return authResponse

    const { id, orderId, clientId, userId, date, endTime, description, evaluation, isReviewed, updatedAt } = await req.json()

    if (!id || !orderId || !userId || !date || !endTime || !description) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }

    if (!updatedAt) {
      return NextResponse.json(
        { error: 'El timestamp de actualización es requerido' },
        { status: 400 }
      )
    }

    const clientUpdatedAt = new Date(updatedAt)

    if (typeof orderId !== 'number' || orderId < 1) {
      return NextResponse.json({ error: 'orderId inválido' }, { status: 400 })
    }

    const visitStart = new Date(date)
    const visitEnd = new Date(endTime)

    if (isNaN(visitStart.getTime()) || isNaN(visitEnd.getTime()) || visitEnd <= visitStart) {
      return NextResponse.json({ error: 'Fechas inválidas' }, { status: 400 })
    }

    const currentDate = new Date()
    if (visitStart > currentDate) {
      return NextResponse.json({ error: 'La fecha de la visita no puede ser en el futuro' }, { status: 400 })
    }

    const existingVisit = await prisma.visit.findUnique({ where: { id } })
    if (!existingVisit) {
      return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 400 })
    }

    // Validar si la visita está dentro del rango de fechas de la orden
    if (order.scheduledDate && visitStart < order.scheduledDate) {
      return NextResponse.json({
        error: 'La fecha de la visita no puede ser anterior a la fecha programada de la orden',
      }, { status: 400 })
    }

    if (order.endDate && visitEnd > order.endDate) {
      return NextResponse.json({
        error: 'La fecha de fin de la visita no puede ser posterior a la fecha de fin de la orden',
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { dni: userId } })
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 })
    }

    const availability = await prisma.availability.findFirst({
      where: {
        userId: userId,
        startDate: { lte: visitStart },
        endDate: { gte: visitEnd }, // Asegura que la disponibilidad cubre todo el rango
      },
    })

    if (!availability) {
      return NextResponse.json({ error: 'El usuario no está disponible en este horario' }, { status: 400 })
    }

    if (evaluation !== undefined && (isNaN(evaluation) || evaluation < 0 || evaluation > 5)) {
      return NextResponse.json({ error: 'La evaluación debe ser un número entre 0 y 5' }, { status: 400 })
    }

    if (isReviewed && (evaluation === null || evaluation === undefined)) {
      return NextResponse.json({ error: 'Debe proporcionar una evaluación si la visita ha sido revisada' }, { status: 400 })
    }

    const decoded = await verifyJWT(req)
    if (!decoded || decoded?.error) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

    const updatedBy = decoded.dni

    const updatedVisit = await prisma.visit.updateMany({
      where: {
        id,
        updatedAt: clientUpdatedAt,
      },
      data: {
        orderId,
        userId,
        date: visitStart,
        endTime: visitEnd,
        description,
        clientId: order.clientId,
        evaluation: evaluation ?? null,
        isReviewed: typeof isReviewed === 'boolean' ? isReviewed : false,
        updatedBy,
      },
    })

    if (updatedVisit.count === 0) {
      return NextResponse.json(
        { error: 'La visita fue modificada por otro usuario. Revisa los últimos cambios.' },
        { status: 409 } // HTTP 409 Conflict
      )
    }

    return NextResponse.json(updatedVisit, { status: 200 })
  } catch (error) {
    if (error.message?.includes('CSRF')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error al actualizar la visita:', error)
    return NextResponse.json({ error: 'Error al actualizar la visita' }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    verifyCsrfToken(req)

    const authResponse = await verifyAndLimit(req)
    if (authResponse) return authResponse

    const currentUser = await verifyJWT(req)
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    const visit = await prisma.visit.findUnique({ where: { id } })

    if (!visit || visit.deletedAt !== null) {
      return NextResponse.json({ error: 'Visita no encontrada o ya eliminada' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      // Soft delete: marcar deletedAt y deletedBy
      await tx.visit.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser?.dni || 'system',
        },
      })

      // Verificar si quedan visitas no eliminadas en la orden
      const remainingVisits = await tx.visit.count({
        where: {
          orderId: visit.orderId,
          deletedAt: null,
        },
      })

      if (remainingVisits === 0) {
        // Revertir estado de la orden si era IN_PROGRESS
        const currentOrder = await tx.order.findUnique({
          where: { id: visit.orderId },
          select: { status: true }
        })

        if (currentOrder?.status === 'IN_PROGRESS') {
          await tx.order.update({
            where: { id: visit.orderId },
            data: { status: 'PENDING' }
          })

          // Revertir estado de los técnicos que estaban en IN_PROGRESS a ASSIGNED
          await tx.orderWorker.updateMany({
            where: {
              orderId: visit.orderId,
              status: 'IN_PROGRESS'
            },
            data: {
              status: 'ASSIGNED'
            }
          })
        }
      }
    })

    return NextResponse.json({ message: 'Visita eliminada correctamente' }, { status: 200 })
  } catch (error) {
    if (error.message?.includes('CSRF')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error al eliminar la visita:', error)
    return NextResponse.json({ error: 'Error al eliminar la visita' }, { status: 500 })
  }
}
