import { NextResponse } from 'next/server'
import { verifyAndLimit } from '@/lib/permissions' // Función para verificar permisos
import prisma from '@/lib/prisma'  // Instancia de Prisma

export async function GET(req, { params }) {
  const { id } = await params  // Extraemos el `id` de los parámetros de la URL

  const authResponse = await verifyAndLimit(req)  // Verificación de permisos
  if (authResponse) {
    return authResponse  // Si no tiene permisos, devolver respuesta con error 403
  }

  try {
    // Obtener los detalles de la visita por ID
    const visit = await prisma.visit.findUnique({
      where: {
        id: parseInt(id),  // Asegúrate de convertir el `id` a entero si es necesario
      },
      include: {
        evidences: true,
        order: true,
        user: true, // Puedes incluir los trabajadores relacionados si es necesario
        client: true, // Puedes incluir el cliente si es necesario
      },
    })

    // Si no se encuentra la visita, devolver 404
    if (!visit) {
      return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })
    }

    // Devolver los detalles de la visita
    return NextResponse.json(visit, { status: 200 })
  } catch (error) {
    console.error('Error al obtener visita:', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 })
  }
}
