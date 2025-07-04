import { NextResponse } from 'next/server'
import { verifyAndLimit } from '@/lib/permissions'
import { verifyJWT } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req) {
  const authResponse = await verifyAndLimit(req)
  if (authResponse) return authResponse

  try {
    const decoded = await verifyJWT(req)
    if (!decoded || decoded?.error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const body = await req.json()

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { orderId } = body[0]
    if (!orderId || body.some(loc => loc.orderId !== orderId)) {
      return NextResponse.json({ error: 'Todas las ubicaciones deben tener el mismo orderId' }, { status: 400 })
    }

    const existing = await prisma.location.findMany({ where: { orderId } })
    const incomingIds = body.map(loc => loc.id).filter(Boolean)

    // Eliminar ubicaciones no incluidas
    const toDelete = existing.filter(loc => !incomingIds.includes(loc.id))
    if (toDelete.length > 0) {
      await prisma.location.deleteMany({
        where: {
          id: {
            in: toDelete.map(loc => loc.id),
          },
        },
      })
    }

    const createdBy = decoded.dni

    // Crear o actualizar las ubicaciones
    const tasks = body.map(loc => {
      const { id, latitude, longitude, label, mapUrl } = loc

      if (id) {
        return prisma.location.update({
          where: { id },
          data: { latitude, longitude, label, mapUrl, createdBy },
        })
      } else {
        return prisma.location.create({
          data: { orderId, latitude, longitude, label, mapUrl, createdBy },
        })
      }
    })

    const results = await Promise.all(tasks)
    return NextResponse.json(results, { status: 200 })

  } catch (error) {
    console.error("❌ Error actualizando ubicaciones:", error)
    return NextResponse.json(
      { error: "Error al actualizar ubicaciones" },
      { status: 500 }
    )
  }
}
