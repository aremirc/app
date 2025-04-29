import { NextResponse } from 'next/server' // Importa NextResponse
import { verifyAndLimit } from '@/lib/permissions' // Importamos la función
import { verifyCsrfToken } from '@/lib/csrf'
import prisma from '@/lib/prisma'

// Obtener todos los trabajadores
export async function GET(req) {
  const authResponse = await verifyAndLimit(req) // Llamamos a verifyAndLimit
  if (authResponse) {
    return authResponse // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Obtener todos los trabajadores
    const workers = await prisma.worker.findMany({
      include: {
        orders: true,  // Incluir las órdenes asignadas a cada trabajador
        visits: true,  // Incluir las visitas realizadas por el trabajador
      },
    })

    return NextResponse.json(workers, { status: 200 }) // Usamos NextResponse
  } catch (error) {
    console.error('Error al obtener trabajadores:', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 }) // Usamos NextResponse
  }
}

// Crear un nuevo trabajador
export async function POST(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req)

  const authResponse = await verifyAndLimit(req, 'Admin') // Solo los Admins pueden crear trabajadores
  if (authResponse) {
    return authResponse // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { dni, firstName, lastName, email, phone } = await req.json()

    // Validaciones básicas
    if (!dni || !firstName || !lastName || !email) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, {
        status: 400, // Bad request
      }) // Usamos NextResponse
    }

    // Verificar si el trabajador ya existe por DNI
    const existingWorker = await prisma.worker.findUnique({
      where: { dni },
    })
    if (existingWorker) {
      return NextResponse.json({ error: 'El trabajador ya existe' }, {
        status: 400,
      }) // Usamos NextResponse
    }

    // Crear un nuevo trabajador
    const newWorker = await prisma.worker.create({
      data: {
        dni,
        firstName,
        lastName,
        email,
        phone,
      },
    })

    // Responder con el trabajador creado
    return NextResponse.json(newWorker, {
      status: 201, // Creado con éxito
    }) // Usamos NextResponse
  } catch (error) {
    console.error('Error al crear el trabajador:', error)
    return NextResponse.json({ error: 'Error al crear el trabajador' }, {
      status: 500, // Error en el servidor
    }) // Usamos NextResponse
  }
}

// Actualizar un trabajador existente
export async function PUT(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req)

  const authResponse = await verifyAndLimit(req, 'Admin') // Solo los Admins pueden actualizar trabajadores
  if (authResponse) {
    return authResponse // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { dni, firstName, lastName, email, phone } = await req.json()

    // Validar que el DNI esté presente
    if (!dni) {
      return NextResponse.json({ error: 'DNI es requerido' }, {
        status: 400, // Bad request
      }) // Usamos NextResponse
    }

    // Verificar si el trabajador existe
    const existingWorker = await prisma.worker.findUnique({
      where: { dni },
    })
    if (!existingWorker) {
      return NextResponse.json({ error: 'Trabajador no encontrado' }, {
        status: 404, // Not found
      }) // Usamos NextResponse
    }

    // Actualizar el trabajador
    const updatedWorker = await prisma.worker.update({
      where: { dni },
      data: {
        firstName,
        lastName,
        email,
        phone,
      },
    })

    return NextResponse.json(updatedWorker, {
      status: 200, // OK
    }) // Usamos NextResponse
  } catch (error) {
    console.error('Error al actualizar el trabajador:', error)
    return NextResponse.json({ error: 'Error al actualizar el trabajador' }, {
      status: 500, // Error en el servidor
    }) // Usamos NextResponse
  }
}

// Eliminar un trabajador
export async function DELETE(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req)

  const authResponse = await verifyAndLimit(req, 'Admin') // Solo los Admins pueden eliminar trabajadores
  if (authResponse) {
    return authResponse // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { dni } = await req.json()

    // Validar que el DNI esté presente
    if (!dni) {
      return NextResponse.json({ error: 'DNI es requerido' }, {
        status: 400, // Bad request
      }) // Usamos NextResponse
    }

    // Verificar si el trabajador existe
    const existingWorker = await prisma.worker.findUnique({
      where: { dni },
    })
    if (!existingWorker) {
      return NextResponse.json({ error: 'Trabajador no encontrado' }, {
        status: 404, // Not found
      }) // Usamos NextResponse
    }

    // Eliminar el trabajador
    await prisma.worker.delete({
      where: { dni },
    })

    return NextResponse.json({ message: 'Trabajador eliminado' }, {
      status: 200, // OK
    }) // Usamos NextResponse
  } catch (error) {
    console.error('Error al eliminar el trabajador:', error)
    return NextResponse.json({ error: 'Error al eliminar el trabajador' }, {
      status: 500, // Error en el servidor
    }) // Usamos NextResponse
  }
}
