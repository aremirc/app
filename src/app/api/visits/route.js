import prisma from '@/lib/prisma'
import { verifyCsrfToken } from '@/lib/csrf'
import { verifyAndLimit } from '@/lib/permissions' // Importamos la función centralizada
import { NextResponse } from 'next/server' // Importa NextResponse

// Obtener todas las visitas
export async function GET(req) {
  const authResponse = await verifyAndLimit(req) // Verificación centralizada
  if (authResponse) {
    return authResponse // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Obtener todas las visitas
    const visits = await prisma.visit.findMany()

    return NextResponse.json(visits, { status: 200 }) // Usamos NextResponse
  } catch (error) {
    console.error('Error al obtener visitas:', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 }) // Usamos NextResponse
  }
}

// Crear una nueva visita
export async function POST(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req)

  const authResponse = await verifyAndLimit(req) // Verificación centralizada de JWT y Rate Limiting
  if (authResponse) {
    return authResponse // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { orderId, workerId, date, endTime, description } = await req.json()

    // Validar endTime
    const visitStart = new Date(date)
    const visitEnd = new Date(endTime)

    if (isNaN(visitEnd.getTime()) || visitEnd <= visitStart) {
      return NextResponse.json({ error: 'La hora de fin debe ser posterior a la de inicio' }, { status: 400 })
    }

    const duration = Math.floor((visitEnd - visitStart) / 60000) // Duración en minutos

    // Validaciones básicas
    if (!orderId || !workerId || !date || !description) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, {
        status: 400, // Bad request
      }) // Usamos NextResponse
    }

    // Validar el formato de la fecha
    if (isNaN(visitStart.getTime())) {
      return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 }) // Usamos NextResponse
    }

    // Verificar que la fecha no sea en el futuro
    const currentDate = new Date()
    if (visitStart > currentDate) {
      return NextResponse.json({ error: 'La fecha de la visita no puede ser en el futuro' }, {
        status: 400,
      }) // Usamos NextResponse
    }

    // Verificar si la orden existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 400 }) // Usamos NextResponse
    }

    // Verificar el estado de la orden (la visita solo se puede registrar si la orden está "PENDING" o "IN_PROGRESS")
    if (!["PENDING", "IN_PROGRESS"].includes(order.status)) {
      return NextResponse.json({ error: 'La orden no está en un estado válido para registrar una visita' }, {
        status: 400,
      }) // Usamos NextResponse
    }

    // Verificar si el trabajador está asignado a la orden
    if (order.workerId && order.workerId !== workerId) {
      return NextResponse.json(
        { error: 'El trabajador no está asignado a esta orden' },
        { status: 400 }
      ) // Usamos NextResponse
    }

    // Verificar si el trabajador existe
    const worker = await prisma.worker.findUnique({
      where: { dni: workerId },
    })
    if (!worker) {
      return NextResponse.json({ error: 'Trabajador no encontrado' }, { status: 400 }) // Usamos NextResponse
    }

    // Verificar la disponibilidad del trabajador en la fecha de la visita
    // const workerAvailability = await prisma.availability.findFirst({
    //   where: {
    //     dni: workerId,
    //     startDate: { lte: visitStart },
    //     endDate: { gte: visitStart },
    //   },
    // })
    // if (!workerAvailability) {
    //   return new Response(
    //     JSON.stringify({ error: 'El trabajador no está disponible en esta fecha' }),
    //     { status: 400 }
    //   )
    // }

    // Crear la nueva visita
    const newVisit = await prisma.visit.create({
      data: {
        orderId,
        workerId,
        date: visitStart,
        endTime: visitEnd,
        duration,
        description,
        clientId: order.clientId, // Asociar al cliente de la orden
      },
      include: {
        order: true,
        worker: true,
        client: true,
      },
    })

    // Responder con la visita creada
    return NextResponse.json(newVisit, {
      status: 201, // Creado con éxito
    }) // Usamos NextResponse
  } catch (error) {
    console.error('Error al crear la visita:', error)
    return NextResponse.json({ error: 'Error al crear la visita' }, { status: 500 }) // Usamos NextResponse
  }
}

// Actualizar una visita existente
export async function PUT(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req)

  const authResponse = await verifyAndLimit(req)
  if (authResponse) {
    return authResponse // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { id, orderId, workerId, date, endTime, description } = await req.json()

    const visitStart = new Date(date)
    const visitEnd = new Date(endTime)

    if (isNaN(visitStart.getTime()) || isNaN(visitEnd.getTime()) || visitEnd <= visitStart) {
      return NextResponse.json({ error: 'Fecha de inicio o fin inválida' }, { status: 400 })
    }

    const duration = Math.floor((visitEnd - visitStart) / 60000) // minutos

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, {
        status: 400, // Bad request
      }) // Usamos NextResponse
    }

    // Verificar si la visita existe
    const existingVisit = await prisma.visit.findUnique({
      where: { id },
    })
    if (!existingVisit) {
      return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 }) // Usamos NextResponse
    }

    // Validaciones
    if (!orderId || !workerId || !date || !description) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, {
        status: 400, // Bad request
      }) // Usamos NextResponse
    }

    if (isNaN(visitStart.getTime())) {
      return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 }) // Usamos NextResponse
    }

    // Verificar que la fecha no sea en el futuro
    const currentDate = new Date()
    if (visitStart > currentDate) {
      return NextResponse.json({ error: 'La fecha de la visita no puede ser en el futuro' }, {
        status: 400,
      }) // Usamos NextResponse
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 400 }) // Usamos NextResponse
    }

    const worker = await prisma.worker.findUnique({
      where: { dni: workerId },
    })
    if (!worker) {
      return NextResponse.json({ error: 'Trabajador no encontrado' }, { status: 400 }) // Usamos NextResponse
    }

    // Actualizar la visita
    const updatedVisit = await prisma.visit.update({
      where: { id },
      data: {
        orderId,
        workerId,
        date: visitStart,
        endTime: visitEnd,
        duration,
        description,
      },
    })

    return NextResponse.json(updatedVisit, {
      status: 200, // OK
    }) // Usamos NextResponse
  } catch (error) {
    console.error('Error al actualizar la visita:', error)
    return NextResponse.json({ error: 'Error al actualizar la visita' }, { status: 500 }) // Usamos NextResponse
  }
}

// Eliminar una visita
export async function DELETE(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req)

  const authResponse = await verifyAndLimit(req)
  if (authResponse) {
    return authResponse // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, {
        status: 400, // Bad request
      }) // Usamos NextResponse
    }

    // Verificar si la visita existe
    const existingVisit = await prisma.visit.findUnique({
      where: { id },
    })
    if (!existingVisit) {
      return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 }) // Usamos NextResponse
    }

    // Eliminar la visita
    await prisma.visit.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Visita eliminada' }, {
      status: 200, // OK
    }) // Usamos NextResponse
  } catch (error) {
    console.error('Error al eliminar la visita:', error)
    return NextResponse.json({ error: 'Error al eliminar la visita' }, { status: 500 }) // Usamos NextResponse
  }
}
