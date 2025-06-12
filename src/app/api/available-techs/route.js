import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAndLimit } from '@/lib/permissions'

export async function GET(req) {
  const authResponse = await verifyAndLimit(req, 'ADMIN')
  if (authResponse) return authResponse

  const { searchParams } = new URL(req.url)
  const scheduledDate = searchParams.get("scheduledDate")
  const endDate = searchParams.get("endDate")

  if (!scheduledDate || !endDate) {
    return NextResponse.json({ error: "Missing dates" }, { status: 400 })
  }

  const start = new Date(scheduledDate)
  const end = new Date(endDate)

  if (isNaN(start) || isNaN(end)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
  }

  try {
    // Obtener técnicos activos con rol TECHNICIAN
    const technicians = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
        role: {
          name: "TECHNICIAN",
        },
      },
      select: {
        dni: true,
        firstName: true,
        lastName: true,
      },
    })

    // Obtener órdenes con solapamiento en el rango y estados válidos
    const orders = await prisma.order.findMany({
      where: {
        AND: [
          { scheduledDate: { lte: end } },
          { endDate: { gte: start } },
          { status: { in: ["PENDING", "IN_PROGRESS"] } },
          { deletedAt: null },
        ],
      },
      include: {
        workers: true,
      },
    })

    const availableTechs = technicians.filter((tech) => {
      const hasConflict = orders.some((order) => {
        if (!order.scheduledDate || !order.endDate) return false
        const isAssigned = order.workers.some((w) => w.userId === tech.dni)
        return isAssigned
      })

      return !hasConflict
    })

    return NextResponse.json(availableTechs)
  } catch (error) {
    console.error("Error fetching available technicians:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
