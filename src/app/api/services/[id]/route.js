import { NextResponse } from 'next/server'
import { verifyAndLimit } from '@/lib/permissions'  // Función para verificar permisos
import prisma from '@/lib/prisma'  // Instancia de Prisma

export async function GET(req, { params }) {
  const { id } = await params  // Extraemos el `id` de los parámetros de la URL

  const authResponse = await verifyAndLimit(req, 'ADMIN')  // Verificación de permisos
  if (authResponse) {
    return authResponse  // Si no tiene permisos, devolver respuesta con error 403
  }

  try {
    // Obtener los detalles del servicio por ID
    const service = await prisma.service.findUnique({
      where: {
        id: parseInt(id),  // Asegúrate de convertir el `id` a entero si es necesario
      },
    })

    // Si no se encuentra el servicio, devolver 404
    if (!service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    // Devolver los detalles del servicio
    return NextResponse.json(service, { status: 200 })
  } catch (error) {
    console.error('Error al obtener servicio:', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 })
  }
}
