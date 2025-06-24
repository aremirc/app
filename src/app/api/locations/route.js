import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req) {
  try {
    const body = await req.json()

    if (!Array.isArray(body) || body.length === 0 || !body[0].orderId) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    const orderId = body[0].orderId

    const existing = await prisma.location.findMany({ where: { orderId } })
    const incomingIds = body.map((loc) => loc.id).filter(Boolean)

    // 1. Eliminar ubicaciones que ya no están
    const toDelete = existing.filter((loc) => !incomingIds.includes(loc.id))
    await prisma.location.deleteMany({
      where: {
        id: {
          in: toDelete.map((loc) => loc.id),
        },
      },
    })

    // 2. Crear o actualizar las demás
    const results = await Promise.all(
      body.map(async (loc) => {
        if (loc.id) {
          return await prisma.location.update({
            where: { id: loc.id },
            data: {
              latitude: loc.latitude,
              longitude: loc.longitude,
              label: loc.label,
              mapUrl: loc.mapUrl,
              createdBy: loc.createdBy,
            },
          })
        } else {
          return await prisma.location.create({
            data: {
              orderId,
              latitude: loc.latitude,
              longitude: loc.longitude,
              label: loc.label,
              mapUrl: loc.mapUrl,
              createdBy: loc.createdBy,
            },
          })
        }
      })
    )

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    console.error("Error actualizando ubicaciones:", error)
    return NextResponse.json(
      { error: "Error al actualizar ubicaciones" },
      { status: 500 }
    )
  }
}
