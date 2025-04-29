import { NextResponse } from 'next/server'
import { verifyAndLimit } from '@/lib/permissions' // Función para verificar permisos
import prisma from '@/lib/prisma'  // Instancia de Prisma

export async function GET(req, { params }) {
  const { id } = await params  // Extraemos el id de los parámetros de la URL

  const authResponse = await verifyAndLimit(req, ["ADMIN", "SUPERVISOR"])
  if (authResponse) {
    return authResponse  // Si no tiene permisos, devolver respuesta con error 403
  }

  try {
    // Obtener los detalles del cliente por id
    const client = await prisma.client.findUnique({
      where: {
        dni: id,  // Buscamos por el DNI (id del cliente)
      },
      include: {
        orders: true,  // Incluir las órdenes del cliente (si es necesario)
        visits: true,  // Incluir las visitas del cliente (si es necesario)
      },
    })

    // Si no se encuentra al cliente, devolver 404
    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Devolver los detalles del cliente
    return NextResponse.json(client, { status: 200 })
  } catch (error) {
    console.error('Error al obtener cliente:', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 })
  }
}
