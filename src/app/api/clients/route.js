import { NextResponse } from 'next/server'
import { verifyCsrfToken } from '@/lib/csrf'
import { verifyAndLimit } from '@/lib/permissions'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function GET(req) {
  const authResponse = await verifyAndLimit(req, ["ADMIN", "SUPERVISOR"])
  if (authResponse) return authResponse

  try {
    const searchParams = req.nextUrl.searchParams

    const typeParam = searchParams.get('type') // 'INDIVIDUAL' | 'COMPANY'
    const isActiveParam = searchParams.get('isActive') // 'true' | 'false'
    const id = searchParams.get('id')

    const whereClause = {
      deletedAt: null,
      ...(typeParam && {
        type: typeParam.toUpperCase(), // debe coincidir con el enum ClientType
      }),
      ...(isActiveParam !== null && {
        isActive: isActiveParam === 'true', // conversión explícita a booleano
      }),
      ...(id && { id }),
    }

    const clients = await prisma.client.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,       // RUC o DNI
        name: true,
        email: true,
        phone: true,
        address: true,
        contactPersonName: true,
        contactPersonPhone: true,
        notes: true,
        isActive: true,
      },
    })

    return NextResponse.json(clients, { status: 200 })
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    verifyCsrfToken(req)

    const authResponse = await verifyAndLimit(req, "ADMIN")
    if (authResponse) {
      return authResponse
    }

    const { id, name, email, phone, address, type, password, contactPersonName, contactPersonPhone, notes } = await req.json()

    if (!id || !name || !email || !type) {
      return NextResponse.json({ error: 'Todos los campos obligatorios deben ser proporcionados' }, { status: 400 })
    }

    const validTypes = ['INDIVIDUAL', 'COMPANY']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Tipo de cliente no válido' }, { status: 400 })
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Correo electrónico no válido' }, { status: 400 })
    }

    if (type === 'INDIVIDUAL' && !/^\d{8}$/.test(id)) {
      return NextResponse.json({ error: 'DNI no válido. Debe contener 8 dígitos numéricos' }, { status: 400 })
    }

    if (type === 'COMPANY' && !/^\d{11}$/.test(id)) {
      return NextResponse.json({ error: 'RUC no válido. Debe contener 11 dígitos numéricos' }, { status: 400 })
    }

    const existingClientEmail = await prisma.client.findUnique({ where: { email } })
    if (existingClientEmail) {
      return NextResponse.json({ error: 'El correo electrónico ya está registrado' }, { status: 400 })
    }

    const existingClientId = await prisma.client.findUnique({ where: { id } })
    if (existingClientId) {
      const docLabel = type === 'COMPANY' ? 'RUC' : 'DNI'
      return NextResponse.json({ error: `El ${docLabel} ya está registrado` }, { status: 400 })
    }

    const existingClientName = await prisma.client.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive', // ignora mayúsculas/minúsculas
        }
      }
    })

    if (existingClientName) {
      return NextResponse.json({ error: 'Ya existe un cliente con el mismo nombre' }, { status: 400 })
    }

    let hashedPassword = undefined
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
      }
      hashedPassword = await bcrypt.hash(password, 12)
    }

    const newClient = await prisma.client.create({
      data: {
        id, name, email, phone, address, type,
        ...(hashedPassword && { password: hashedPassword }),
        ...(contactPersonName && { contactPersonName }),
        ...(contactPersonPhone && { contactPersonPhone }),
        ...(notes && { notes }),
      }
    })

    // Responder con los datos del nuevo cliente (sin el DNI, por razones de privacidad)
    // const { dni: _, ...newClient } = newClient
    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    if (error.message?.includes('CSRF')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error al crear el cliente:', error)
    return NextResponse.json({ error: 'Error al crear el cliente' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    verifyCsrfToken(req)

    const authResponse = await verifyAndLimit(req, "ADMIN")
    if (authResponse) {
      return authResponse
    }

    const { id, name, email, phone, address, password, contactPersonName, contactPersonPhone, notes, isActive } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'ID (DNI o RUC) es requerido' }, { status: 400 })
    }

    const existingClient = await prisma.client.findUnique({
      where: { id },
    })

    if (!existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    if (email) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Correo electrónico no válido' }, { status: 400 })
      }
    }

    const duplicateClient = await prisma.client.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { email },
              {
                name: {
                  equals: name,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
    })

    if (duplicateClient) {
      const errorMessage = duplicateClient.email === email
        ? 'El correo electrónico ya está registrado'
        : 'Ya existe un cliente con el mismo nombre'

      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    let hashedPassword
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
      }
      hashedPassword = await bcrypt.hash(password, 12)
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        contactPersonName, contactPersonPhone, notes, isActive,
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(hashedPassword && { password: hashedPassword }),
      },
    })

    const { password: _, ...clientWithoutPassword } = updatedClient
    return NextResponse.json(clientWithoutPassword, { status: 200 })
  } catch (error) {
    if (error.message?.includes('CSRF')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error al actualizar el cliente:', error)
    return NextResponse.json({ error: 'Error al actualizar el cliente' }, {
      status: 500,
    })
  }
}

export async function DELETE(req) {
  try {
    verifyCsrfToken(req)

    const authResponse = await verifyAndLimit(req, "ADMIN")
    if (authResponse) {
      return authResponse
    }

    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'RUC/DNI es requerido' }, {
        status: 400,
      })
    }

    const existingClient = await prisma.client.findUnique({
      where: { id },
    })

    if (!existingClient || existingClient.deletedAt !== null) {
      return NextResponse.json({ error: 'Cliente no encontrado o ya eliminado' }, {
        status: 404,
      })
    }

    await prisma.client.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false
      }
    })

    return NextResponse.json({ message: 'Cliente eliminado correctamente' }, { status: 200 })
  } catch (error) {
    if (error.message?.includes('CSRF')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error al eliminar el cliente:', error)
    return NextResponse.json({ error: 'Error al eliminar el cliente' }, {
      status: 500,
    })
  }
}
