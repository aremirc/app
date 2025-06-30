import { NextResponse } from 'next/server'
import { verifyCsrfToken } from '@/lib/csrf'
import { verifyAndLimit } from '@/lib/permissions'
import { verifyJWT } from '@/lib/auth'
import prisma from '@/lib/prisma'

function isValidDate(d) {
  return d instanceof Date && !isNaN(d)
}

function getDateRange(query) {
  const isoDate = /^\d{4}-\d{2}-\d{2}$/        // 2025-05-20
  const monthOnly = /^\d{4}-\d{2}$/            // 2025-05
  const yearOnly = /^\d{4}$/                   // 2025
  const dayMonthYear = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/  // 20-05-2025 o 20/05/2025
  const range = /^(.+)\s+(to|a)\s+(.+)$/i      // rango: "2025-05-01 to 2025-05-20"

  if (range.test(query)) {
    const [, startStr, , endStr] = query.match(range)
    const start = parseFlexibleDate(startStr)
    const end = parseFlexibleDate(endStr)
    if (isValidDate(start) && isValidDate(end)) {
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
    return null
  }

  if (isoDate.test(query)) {
    const date = new Date(query)
    if (isValidDate(date)) {
      const start = new Date(date.setHours(0, 0, 0, 0))
      const end = new Date(date.setHours(23, 59, 59, 999))
      return { start, end }
    }
    return null
  }

  if (dayMonthYear.test(query)) {
    const [, dd, mm, yyyy] = query.match(dayMonthYear)
    const date = new Date(`${yyyy}-${mm}-${dd}`)
    if (isValidDate(date)) {
      const start = new Date(date.setHours(0, 0, 0, 0))
      const end = new Date(date.setHours(23, 59, 59, 999))
      return { start, end }
    }
    return null
  }

  if (monthOnly.test(query)) {
    const start = new Date(`${query}-01T00:00:00`)
    if (!isValidDate(start)) return null
    const end = new Date(start)
    end.setMonth(end.getMonth() + 1)
    return { start, end }
  }

  if (yearOnly.test(query)) {
    const start = new Date(`${query}-01-01T00:00:00`)
    const end = new Date(`${Number(query) + 1}-01-01T00:00:00`)
    if (isValidDate(start) && isValidDate(end)) {
      return { start, end }
    }
    return null
  }

  return null
}

function parseFlexibleDate(input) {
  const isoDate = /^\d{4}-\d{2}-\d{2}$/
  const dmy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/

  if (isoDate.test(input)) {
    const d = new Date(input)
    return isValidDate(d) ? d : null
  }

  if (dmy.test(input)) {
    const [, dd, mm, yyyy] = input.match(dmy)
    const d = new Date(`${yyyy}-${mm}-${dd}`)
    return isValidDate(d) ? d : null
  }

  const parsed = new Date(input)
  return isValidDate(parsed) ? parsed : null
}

export async function GET(req) {
  const authResponse = await verifyAndLimit(req)
  if (authResponse) return authResponse

  try {
    const decoded = await verifyJWT(req)
    if (!decoded || decoded?.error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const userRole = decoded.role
    const userDni = decoded.dni
    const { searchParams } = req.nextUrl

    const query = searchParams.get('q')?.trim()
    const status = searchParams.get('status')?.toUpperCase()
    const clientId = searchParams.get('clientId')
    const workerDni = searchParams.get('workerDni')
    const orderId = searchParams.get('orderId')

    const isTechnician = userRole === 'TECHNICIAN'
    const dateRange = getDateRange(query)

    const VALID_STATUSES = [
      'PENDING',
      'AWAITING_APPROVAL',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'ON_HOLD',
      'FAILED',
      'DELETED',
    ]

    const orConditions = []

    if (query) {
      const upperQuery = query.toUpperCase()

      if (!isNaN(Number(query))) {
        orConditions.push({ id: Number(query) })
      }

      if (VALID_STATUSES.includes(upperQuery)) {
        orConditions.push({ status: upperQuery })
      }

      orConditions.push(
        { clientId: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        {
          client: {
            OR: [
              { id: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
            ]
          }
        },
        {
          workers: {
            some: {
              user: {
                OR: [
                  { dni: { contains: query, mode: 'insensitive' } },
                  { firstName: { contains: query, mode: 'insensitive' } },
                  { lastName: { contains: query, mode: 'insensitive' } },
                ]
              }
            }
          }
        },
        {
          services: {
            some: {
              name: { contains: query, mode: 'insensitive' }
            }
          }
        }
      )

      if (dateRange) {
        orConditions.push(
          {
            scheduledDate: {
              gte: dateRange.start,
              lte: dateRange.end,
            }
          },
          {
            endDate: {
              gte: dateRange.start,
              lte: dateRange.end,
            }
          }
        )
      }
    }

    const excludeDeleted = !(status === 'DELETED')

    const whereClause = {
      ...(orderId && { id: Number(orderId) }),
      ...(excludeDeleted && { deletedAt: null }),
      ...(status && { status }),
      ...(clientId && { clientId }),
      ...(workerDni && {
        workers: {
          some: { userId: workerDni }
        }
      }),
      ...(isTechnician && {
        workers: {
          some: {
            userId: userDni,
            status: { in: ['ASSIGNED', 'IN_PROGRESS'] }
          }
        }
      }),
      ...(orConditions.length > 0 && { OR: orConditions })
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { scheduledDate: 'desc' },
      select: {
        id: true,
        alternateContactName: true,
        alternateContactPhone: true,
        clientId: true,
        description: true,
        endDate: true,
        scheduledDate: true,
        status: true,
        statusDetails: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: {
            id: true,
            name: true
          }
        },
        workers: {
          select: {
            userId: true,
            isResponsible: true,
            user: {
              select: {
                dni: true,
                firstName: true,
                lastName: true
              }
            }
          },
          where: {
            user: {
              deletedAt: null,
            },
          },
        },
        services: {
          select: {
            id: true,
            name: true
          },
        },
        ...(status === 'PENDING') && { locations: true },
      }
    })

    return NextResponse.json(orders, { status: 200 })
  } catch (error) {
    console.error('Error al obtener órdenes:', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    verifyCsrfToken(req)

    const authResponse = await verifyAndLimit(req, "ADMIN")
    if (authResponse) return authResponse

    const { clientId, description, status, scheduledDate, endDate, alternateContactName, alternateContactPhone, workers = [], services = [], responsibleId } = await req.json()

    if (!clientId || !description || !status) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }

    let parsedScheduledDate, parsedEndDate

    if (scheduledDate) {
      parsedScheduledDate = new Date(scheduledDate)
      if (isNaN(parsedScheduledDate)) {
        return NextResponse.json({ error: 'scheduledDate inválida' }, { status: 400 })
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate)
      if (isNaN(parsedEndDate)) {
        return NextResponse.json({ error: 'endDate inválida' }, { status: 400 })
      }
      if (parsedScheduledDate && parsedEndDate <= parsedScheduledDate) {
        return NextResponse.json({
          error: 'endDate debe ser posterior a scheduledDate',
        }, { status: 400 })
      }
    }

    const validStatuses = ['PENDING', 'AWAITING_APPROVAL']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado de orden no válido' }, { status: 400 })
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } })
    if (!client) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 400 })

    const techs = await prisma.user.findMany({
      where: {
        dni: { in: workers },
        role: { name: 'TECHNICIAN' },
      },
    })

    if (techs.length !== workers.length) {
      return NextResponse.json({ error: 'Algunos trabajadores no son válidos o no son técnicos' }, { status: 400 })
    }

    if (responsibleId) {
      if (!workers.includes(responsibleId)) {
        return NextResponse.json({
          error: 'El responsable debe estar en la lista de técnicos asignados',
        }, { status: 400 })
      }

      const isValidResponsible = techs.some((w) => w.dni === responsibleId)
      if (!isValidResponsible) {
        return NextResponse.json({
          error: 'El responsable no es un técnico válido',
        }, { status: 400 })
      }
    }

    const validServices = await prisma.service.findMany({ where: { id: { in: services } } })
    if (validServices.length !== services.length) {
      return NextResponse.json({ error: 'Uno o más servicios no son válidos' }, { status: 400 })
    }

    const decoded = await verifyJWT(req)
    const createdBy = decoded?.dni || "system"

    const newOrder = await prisma.order.create({
      data: {
        clientId,
        description,
        status,
        createdBy,
        ...(parsedScheduledDate && { scheduledDate: parsedScheduledDate }),
        ...(parsedEndDate && { endDate: parsedEndDate }),
        ...(alternateContactName && { alternateContactName }),
        ...(alternateContactPhone && { alternateContactPhone }),
        services: {
          connect: services.map((id) => ({ id })),
        },
      },
    })

    await prisma.orderWorker.createMany({
      data: workers.map((dni) => ({
        orderId: newOrder.id,
        userId: dni,
        status: 'ASSIGNED',
        isResponsible: responsibleId === dni,
      })),
    })

    await prisma.notification.createMany({
      data: workers.map((dni) => ({
        userId: dni,
        type: 'ASSIGNMENT_UPDATE',
        title: 'Nueva orden asignada',
        message: `Has sido asignado a la orden N° ${newOrder.id}`,
      })),
    })

    const fullOrder = await prisma.order.findUnique({
      where: { id: newOrder.id },
      include: {
        client: true,
        services: true,
        workers: {
          include: { user: true },
        },
      },
    })

    return NextResponse.json(fullOrder, { status: 201 })
  } catch (error) {
    if (error.message?.includes('CSRF')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error al crear la orden:', error)
    return NextResponse.json({ error: 'Error al crear la orden' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    verifyCsrfToken(req)

    const authResponse = await verifyAndLimit(req, ["ADMIN", "SUPERVISOR"])
    if (authResponse) return authResponse

    const { id, description, status, clientId, workers = [], services = [], scheduledDate, endDate, alternateContactName, alternateContactPhone, responsibleId, updatedAt } = await req.json()

    if (!id || !description || !status || !clientId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (!updatedAt) {
      return NextResponse.json(
        { error: 'El timestamp de actualización es requerido' },
        { status: 400 }
      )
    }

    const clientUpdatedAt = new Date(updatedAt)

    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { workers: true, services: true },
    })

    if (!currentOrder) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    const validStatuses = [
      'PENDING',
      'AWAITING_APPROVAL',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'ON_HOLD',
      'FAILED',
      'DELETED',
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado de orden no válido' }, { status: 400 })
    }

    // Reglas de transición para OrderStatus
    const validOrderTransitions = {
      AWAITING_APPROVAL: ['AWAITING_APPROVAL', 'PENDING', 'IN_PROGRESS'],
      PENDING: ['PENDING', 'AWAITING_APPROVAL', 'IN_PROGRESS', 'ON_HOLD', 'CANCELLED'],
      IN_PROGRESS: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD', 'FAILED'],
      COMPLETED: ['COMPLETED', 'IN_PROGRESS'],
      ON_HOLD: ['ON_HOLD', 'IN_PROGRESS', 'CANCELLED', 'PENDING'],
    }

    const currentOrderStatus = currentOrder.status
    if (!validOrderTransitions[currentOrderStatus]?.includes(status)) {
      return NextResponse.json({
        error: `No se puede cambiar el estado de ${currentOrderStatus} a ${status}`,
      }, { status: 400 })
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } })
    if (!client) {
      return NextResponse.json({ error: 'Cliente no válido' }, { status: 400 })
    }

    const validServices = await prisma.service.findMany({ where: { id: { in: services } } })
    if (validServices.length !== services.length) {
      return NextResponse.json({ error: 'Uno o más servicios no son válidos' }, { status: 400 })
    }

    const validWorkers = await prisma.user.findMany({
      where: {
        dni: { in: workers },
        role: { name: 'TECHNICIAN' },
        status: 'ACTIVE',
      },
    })
    if (validWorkers.length !== workers.length) {
      return NextResponse.json({ error: 'Uno o más técnicos no son válidos o están inactivos' }, { status: 400 })
    }

    // // Reglas de transición para OrderWorkerStatus
    // const validWorkerTransitions = {
    //   ASSIGNED: ['ASSIGNED', 'IN_PROGRESS', 'REASSIGNED', 'CANCELLED', 'DECLINED'],
    //   IN_PROGRESS: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED'],
    //   COMPLETED: ['COMPLETED', 'IN_PROGRESS'],
    //   FAILED: ['FAILED', 'REASSIGNED'],
    // }

    // // Validación de transición de estado de los trabajadores
    // for (const worker of validWorkers) {
    //   // Obtener el estado actual de la relación OrderWorker para este trabajador
    //   const orderWorker = await prisma.orderWorker.findUnique({
    //     where: { orderId_userId: { orderId: id, userId: worker.dni } },
    //   })

    //   // Si no encontramos la relación, retornamos un error
    //   if (!orderWorker) {
    //     return NextResponse.json({
    //       error: `El trabajador ${worker.dni} no está asignado a esta orden`,
    //     }, { status: 400 })
    //   }

    //   const workerStatus = orderWorker.status // El estado del trabajador en la orden

    //   // Verificar si la transición es válida
    //   if (!validWorkerTransitions[workerStatus]?.includes(status)) {
    //     return NextResponse.json({
    //       error: `No se puede cambiar el estado del trabajador ${worker.dni} de ${workerStatus} a ${status}`,
    //     }, { status: 400 })
    //   }
    // }

    if (responsibleId) {
      if (!workers.includes(responsibleId)) {
        return NextResponse.json({
          error: 'El responsable debe estar en la lista de técnicos asignados',
        }, { status: 400 })
      }

      const isValidResponsible = validWorkers.some((w) => w.dni === responsibleId)
      if (!isValidResponsible) {
        return NextResponse.json({
          error: 'El responsable no es un técnico válido',
        }, { status: 400 })
      }
    }

    const parsedScheduledDate = scheduledDate ? new Date(scheduledDate) : undefined
    const parsedEndDate = endDate ? new Date(endDate) : undefined

    if (parsedScheduledDate && isNaN(parsedScheduledDate.getTime())) {
      return NextResponse.json({ error: 'Fecha programada inválida' }, { status: 400 })
    }

    if (parsedEndDate && isNaN(parsedEndDate.getTime())) {
      return NextResponse.json({ error: 'Fecha de fin inválida' }, { status: 400 })
    }

    if (parsedScheduledDate && parsedEndDate && parsedEndDate <= parsedScheduledDate) {
      return NextResponse.json({ error: 'Fecha de fin debe ser posterior a fecha programada' }, { status: 400 })
    }

    const decoded = await verifyJWT(req)
    if (!decoded || decoded?.error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const updatedBy = decoded.dni

    // Verificación de estado PENDING antes de permitir el cambio
    if (status === "PENDING") {
      const visitCount = await prisma.visit.count({
        where: {
          orderId: id,
          deletedAt: null, // solo visitas no eliminadas
        },
      })

      if (visitCount > 0) {
        return NextResponse.json({
          error: 'No se puede volver a PENDING una orden con visitas registradas',
        }, { status: 400 })
      }
    }

    const updatedOrder = await prisma.order.updateMany({
      where: {
        id,
        updatedAt: clientUpdatedAt,
      },
      data: {
        description,
        status,
        clientId,
        ...(parsedScheduledDate && { scheduledDate: parsedScheduledDate }),
        ...(parsedEndDate && { endDate: parsedEndDate }),
        ...(alternateContactName && { alternateContactName }),
        ...(alternateContactPhone && { alternateContactPhone }),
        updatedBy,
      },
    })

    if (updatedOrder.count === 0) {
      return NextResponse.json(
        { error: 'La orden fue modificada por otro usuario. Revisa los últimos cambios.' },
        { status: 409 } // HTTP 409 Conflict
      )
    }

    // Actualización separada de relaciones many-to-many
    await prisma.order.update({
      where: { id },
      data: {
        services: {
          set: [], // Limpiamos servicios anteriores
          connect: services.map((id) => ({ id })),
        },
      }
    })

    // Si el estado global de la orden se cierra, actualizar los estados de todos los OrderWorker asociados
    const closedStatuses = ['COMPLETED', 'CANCELLED', 'FAILED']
    if (closedStatuses.includes(status)) {
      // Técnicos con estados que deben actualizarse
      const affectedWorkers = await prisma.orderWorker.findMany({
        where: {
          orderId: id,
          status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
        },
        select: { userId: true },
      })

      if (affectedWorkers.length > 0) {
        const affectedDnis = affectedWorkers.map((w) => w.userId)

        // Actualizar el estado de esos técnicos
        await prisma.orderWorker.updateMany({
          where: {
            orderId: id,
            userId: { in: affectedDnis },
            // Solo actualizar si su estado actual aún no es el final (para evitar sobrescribir estados explícitos como FAILED individual)
            // status: { notIn: closedStatuses },
          },
          data: { status }, // Usar el mismo estado que la orden
        })

        // Crear notificaciones para ellos
        await prisma.notification.createMany({
          data: affectedDnis.map((dni) => ({
            userId: dni,
            type: 'ASSIGNMENT_UPDATE',
            title: `Orden ${status === 'COMPLETED' ? 'completada' : status === 'CANCELLED' ? 'cancelada' : 'fallida'}`,
            message: `La orden N° ${id} ha sido marcada como ${status.toLowerCase()}`,
          })),
        })
      }
    }

    const currentWorkerDnis = currentOrder.workers.map((w) => w.userId)

    // Técnicos a desasignar (ya no están en la nueva lista)
    const reassignedWorkers = currentWorkerDnis.filter(dni => !workers.includes(dni))

    // Técnicos nuevos (no estaban antes)
    const newWorkers = workers.filter(dni => !currentWorkerDnis.includes(dni))

    // Técnicos que siguen pero puede que haya cambiado su responsabilidad
    const remainingWorkers = workers.filter(dni => currentWorkerDnis.includes(dni))

    await prisma.$transaction([
      // Marcar como REASSIGNED los técnicos que ya no están asignados
      ...reassignedWorkers.map((dni) =>
        prisma.orderWorker.updateMany({
          where: { orderId: id, userId: dni },
          data: { status: 'REASSIGNED', isResponsible: false },
        })
      ),

      // Crear nuevos registros para los nuevos técnicos
      ...newWorkers.map((dni) =>
        prisma.orderWorker.create({
          data: {
            orderId: id,
            userId: dni,
            status: 'ASSIGNED',
            isResponsible: responsibleId === dni,
          },
        })
      ),

      // Actualizar `isResponsible` para técnicos existentes
      ...remainingWorkers.map((dni) =>
        prisma.orderWorker.updateMany({
          where: { orderId: id, userId: dni },
          data: {
            isResponsible: responsibleId === dni,
          },
        })
      ),
    ])

    await prisma.notification.createMany({
      data: newWorkers.map((dni) => ({
        userId: dni,
        type: 'ASSIGNMENT_UPDATE',
        title: 'Nueva asignación de orden',
        message: `Has sido asignado a la orden N° ${id}`,
      })),
    })

    const fullOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        services: true,
        workers: {
          include: { user: true },
        },
      },
    })

    return NextResponse.json(fullOrder, { status: 200 })
  } catch (error) {
    if (error.message?.includes('CSRF')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error al actualizar la orden:', error)
    return NextResponse.json({ error: 'Error al actualizar la orden' }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    verifyCsrfToken(req)

    const authResponse = await verifyAndLimit(req, "ADMIN")
    if (authResponse) return authResponse

    const { id } = await req.json()

    const existingOrder = await prisma.order.findUnique({ where: { id } })

    if (!existingOrder || existingOrder.deletedAt !== null) {
      return NextResponse.json({ error: 'Orden no encontrada o ya eliminada' }, {
        status: 404,
      })
    }

    const decoded = await verifyJWT(req)
    if (!decoded || decoded?.error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    await prisma.orderWorker.updateMany({
      where: { orderId: id },
      data: { status: 'REASSIGNED' }, // también podrías usar 'CANCELLED' o 'DECLINED'
    })

    // Soft delete: actualiza el estado y la fecha de eliminación
    const deletedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
        updatedBy: decoded.dni,
      },
    })

    return NextResponse.json({ message: 'Orden eliminada correctamente', deletedOrder }, { status: 200 })
  } catch (error) {
    if (error.message?.includes('CSRF')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error al eliminar la orden:', error)
    return NextResponse.json({ error: 'Error al eliminar la orden' }, { status: 500 })
  }
}
