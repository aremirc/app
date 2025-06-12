import { NextResponse } from 'next/server'
import { verifyCsrfToken } from '@/lib/csrf'
import { verifyAndLimit } from '@/lib/permissions'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const authResponse = await verifyAndLimit(req, 'ADMIN')
  if (authResponse) return authResponse

  try {
    const searchParams = req.nextUrl.searchParams

    const status = searchParams.get('status')?.toUpperCase() // 'ACTIVE' | 'INACTIVE'
    const minPrice = parseFloat(searchParams.get('minPrice'))
    const maxPrice = parseFloat(searchParams.get('maxPrice'))

    const whereClause = {
      deletedAt: null,
      ...(status && { status }),
      ...(Number.isFinite(minPrice) && { price: { gte: minPrice } }),
      ...(Number.isFinite(maxPrice) && {
        price: {
          ...(Number.isFinite(minPrice) ? { gte: minPrice } : {}),
          lte: maxPrice,
        },
      }),
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        estimatedTime: true,
        status: true,
      },
    })

    return NextResponse.json(services, { status: 200 })
  } catch (error) {
    console.error('Error al obtener servicios:', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    verifyCsrfToken(req)
    const authResponse = await verifyAndLimit(req, "ADMIN")
    if (authResponse) return authResponse

    const { name, description, price, estimatedTime, status } = await req.json()

    if (!name || !price || !status) {
      return NextResponse.json({ error: 'Nombre, precio y estado son requeridos' }, { status: 400 })
    }

    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: 'Nombre no válido' }, { status: 400 })
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'El precio debe ser un número positivo' }, { status: 400 })
    }

    if (estimatedTime && (isNaN(estimatedTime) || estimatedTime <= 0)) {
      return NextResponse.json({ error: 'El tiempo estimado debe ser un número positivo' }, { status: 400 })
    }

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const existingService = await prisma.service.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive', // No distingue mayúsculas/minúsculas
        },
      },
    })

    if (existingService) {
      return NextResponse.json({ error: `Ya existe un servicio con el nombre '${name}'` }, { status: 409 })
    }

    const newService = await prisma.service.create({
      data: {
        name,
        description: description || null,
        price,
        estimatedTime: estimatedTime || null,
        status
      },
    })

    return NextResponse.json(newService, { status: 201 })
  } catch (error) {
    if (error.message?.includes('CSRF')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error al crear el servicio:', error)
    return NextResponse.json({ error: 'Error al crear el servicio' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    verifyCsrfToken(req)
    const authResponse = await verifyAndLimit(req, "ADMIN")
    if (authResponse) return authResponse

    const { id, name, description, price, estimatedTime, status } = await req.json()

    if (!id || !name || !price || !status) {
      return NextResponse.json({ error: 'ID, nombre, precio y estado son requeridos' }, { status: 400 })
    }

    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: 'Nombre no válido' }, { status: 400 })
    }

    if (typeof price !== "number" || price <= 0) {
      return NextResponse.json({ error: 'El precio debe ser un número positivo' }, { status: 400 })
    }

    if (estimatedTime && (isNaN(estimatedTime) || estimatedTime <= 0)) {
      return NextResponse.json({ error: 'El tiempo estimado debe ser un número positivo' }, { status: 400 })
    }

    const validStatus = ["ACTIVE", "INACTIVE"]
    const normalizedStatus = status.toUpperCase()
    if (!validStatus.includes(normalizedStatus)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const existingService = await prisma.service.findUnique({ where: { id } })
    if (!existingService) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    const nameConflict = await prisma.service.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        NOT: { id }, // evita el mismo servicio actual
      },
    })
    if (nameConflict) {
      return NextResponse.json({ error: `Ya existe un servicio con el nombre '${name}'` }, { status: 409 })
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        description: description || null,
        price,
        estimatedTime: estimatedTime || null,
        status: normalizedStatus,
      },
    })

    return NextResponse.json(updatedService, { status: 200 })
  } catch (error) {
    if (error.message?.includes('CSRF')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error al actualizar el servicio:', error)
    return NextResponse.json({ error: 'Error al actualizar el servicio' }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    verifyCsrfToken(req)
    const authResponse = await verifyAndLimit(req, "ADMIN")
    if (authResponse) return authResponse

    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    const existingService = await prisma.service.findUnique({ where: { id } })

    if (!existingService || existingService.deletedAt !== null) {
      return NextResponse.json({ error: 'Servicio no encontrado o ya eliminado' }, {
        status: 404,
      })
    }

    await prisma.service.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'INACTIVE',
      },
    })

    return NextResponse.json({ message: 'Servicio eliminado correctamente' }, { status: 200 })
  } catch (error) {
    if (error.message?.includes('CSRF')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error al eliminar el servicio:', error)
    return NextResponse.json({ error: 'Error al eliminar el servicio' }, { status: 500 })
  }
}
