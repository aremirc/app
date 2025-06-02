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

    const userRole = decoded.role
    const userDni = decoded.dni
    const searchParams = req.nextUrl.searchParams

    const status = searchParams.get('status')?.toUpperCase()
    const clientId = searchParams.get('clientId')
    const workerDni = searchParams.get('workerDni')

    const isTechnician = userRole === 'TECHNICIAN'

    const whereClause = {
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
            status: {
              in: ['ASSIGNED', 'IN_PROGRESS']
            }
          }
        }
      })
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
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
        client: {
          select: { name: true }
        },
        workers: {
          select: {
            userId: true,
            isResponsible: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        services: {
          select: { id: true }
        }
      }
    })

    return NextResponse.json(orders, { status: 200 })
  } catch (error) {
    console.error('Error al obtener órdenes:', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 })
  }
}

export async function POST(req) {
  verifyCsrfToken(req)

  const authResponse = await verifyAndLimit(req, "ADMIN")
  if (authResponse) return authResponse

  try {
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

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED']
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
        message: `Has sido asignado a la orden #${newOrder.id}`,
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
    console.error('Error al crear la orden:', error)
    return NextResponse.json({ error: 'Error al crear la orden' }, { status: 500 })
  }
}

export async function PUT(req) {
  verifyCsrfToken(req)

  const authResponse = await verifyAndLimit(req, ["ADMIN", "SUPERVISOR"])
  if (authResponse) return authResponse

  try {
    const { id, description, status, clientId, workers = [], services = [], scheduledDate, endDate, alternateContactName, alternateContactPhone, responsibleId } = await req.json()

    if (!id || !description || !status || !clientId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { workers: true, services: true },
    })

    if (!currentOrder) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
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
      },
    })
    if (validWorkers.length !== workers.length) {
      return NextResponse.json({ error: 'Uno o más técnicos no son válidos' }, { status: 400 })
    }

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

    const decoded = await verifyJWT(req)
    if (!decoded || decoded?.error) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

    const updatedBy = decoded.dni

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        description,
        status,
        client: { connect: { id: clientId } },
        services: {
          set: [], // Limpiamos servicios anteriores
          connect: services.map((id) => ({ id })),
        },
        ...(parsedScheduledDate && { scheduledDate: parsedScheduledDate }),
        ...(parsedEndDate && { endDate: parsedEndDate }),
        ...(alternateContactName && { alternateContactName }),
        ...(alternateContactPhone && { alternateContactPhone }),
        updatedBy,
      },
    })

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
      data: workers.map((dni) => ({
        userId: dni,
        type: 'ASSIGNMENT_UPDATE',
        title: 'Nueva asignación de orden',
        message: `Has sido asignado a la orden #${id}`,
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
    console.error('Error al actualizar la orden:', error)
    return NextResponse.json({ error: 'Error al actualizar la orden' }, { status: 500 })
  }
}

export async function DELETE(req) {
  verifyCsrfToken(req)

  const authResponse = await verifyAndLimit(req, "ADMIN")
  if (authResponse) return authResponse

  try {
    const { id } = await req.json()

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    await prisma.orderWorker.deleteMany({ where: { orderId: id } })

    const deletedOrder = await prisma.order.delete({ where: { id } })

    return NextResponse.json({ message: 'Orden eliminada con éxito', deletedOrder }, { status: 200 })
  } catch (error) {
    console.error('Error al eliminar la orden:', error)
    return NextResponse.json({ error: 'Error al eliminar la orden' }, { status: 500 })
  }
}
