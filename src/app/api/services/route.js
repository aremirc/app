import prisma from '@/lib/prisma'
import { verifyCsrfToken } from '@/lib/csrf'
import { verifyAndLimit } from '@/lib/permissions' // Importar la función de permisos
import { NextResponse } from 'next/server' // Importar NextResponse

// Obtener todos los servicios
export async function GET(req) {
  const authResponse = await verifyAndLimit(req)
  if (authResponse) {
    return authResponse // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Obtener todos los servicios
    const services = await prisma.service.findMany()

    return NextResponse.json(services, { status: 200 }) // Usar NextResponse.json()
  } catch (error) {
    console.error('Error al obtener servicios:', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 })
  }
}

// Crear un nuevo servicio
export async function POST(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req)

  const authResponse = await verifyAndLimit(req, "ADMIN")
  if (authResponse) {
    return authResponse // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { name, description, price } = await req.json()

    // Validaciones básicas
    if (!name || !price) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 }) // Bad request
    }

    // Validar el precio: debe ser un número positivo
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'El precio debe ser un número positivo' }, { status: 400 })
    }

    // // Verificar si el servicio con el mismo nombre ya existe
    // const existingService = await prisma.service.findUnique({
    //   where: { name },
    // })
    // if (existingService) {
    //   return new Response(
    //     JSON.stringify({ error: `Ya existe un servicio con el nombre '${name}'` }),
    //     { status: 400 }
    //   )
    // }

    // Crear el nuevo servicio
    const newService = await prisma.service.create({
      data: {
        name,
        description: description || null, // Si no se proporciona descripción, se guarda como null
        price,
      },
    })

    // Responder con el servicio creado
    return NextResponse.json(newService, { status: 201 }) // Creado con éxito
  } catch (error) {
    console.error('Error al crear el servicio:', error)
    return NextResponse.json({ error: 'Error al crear el servicio' }, { status: 500 }) // Error en el servidor
  }
}

// Actualizar un servicio existente
export async function PUT(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req)

  const authResponse = await verifyAndLimit(req, "ADMIN")
  if (authResponse) {
    return authResponse // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { id, name, description, price } = await req.json()

    // Validar que el ID esté presente
    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 }) // Bad request
    }

    // Verificar si el servicio existe
    const existingService = await prisma.service.findUnique({
      where: { id },
    })
    if (!existingService) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 }) // Not found
    }

    // Validaciones básicas
    if (!name || !price) {
      return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 }) // Bad request
    }

    // Validar el precio: debe ser un número positivo
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'El precio debe ser un número positivo' }, { status: 400 })
    }

    // Actualizar el servicio
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        description: description || null, // Si no se proporciona descripción, se guarda como null
        price,
      },
    })

    return NextResponse.json(updatedService, { status: 200 }) // OK
  } catch (error) {
    console.error('Error al actualizar el servicio:', error)
    return NextResponse.json({ error: 'Error al actualizar el servicio' }, { status: 500 }) // Error en el servidor
  }
}

// Eliminar un servicio
export async function DELETE(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req)

  const authResponse = await verifyAndLimit(req, "ADMIN")
  if (authResponse) {
    return authResponse // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { id } = await req.json()

    // Validar que el ID esté presente
    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 }) // Bad request
    }

    // Verificar si el servicio existe
    const existingService = await prisma.service.findUnique({
      where: { id },
    })
    if (!existingService) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 }) // Not found
    }

    // Eliminar el servicio
    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Servicio eliminado con éxito' }, { status: 200 }) // OK
  } catch (error) {
    console.error('Error al eliminar el servicio:', error)
    return NextResponse.json({ error: 'Error al eliminar el servicio' }, { status: 500 }) // Error en el servidor
  }
}
