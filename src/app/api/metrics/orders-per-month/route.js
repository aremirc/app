import { NextResponse } from 'next/server'
import { verifyAndLimit } from '@/lib/permissions'
import { startOfYear } from 'date-fns'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const authResponse = await verifyAndLimit(req)
  if (authResponse) return authResponse

  const now = new Date()
  const from = startOfYear(now)
  const to = new Date(now.getFullYear(), 11, 31, 23, 59, 59)

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      deletedAt: null,
    },
    select: {
      createdAt: true,
      status: true,
    },
  })

  // Inicializa 12 meses
  const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString('es-PE', { month: 'short' }),
    Órdenes: 0,
  }))

  orders.forEach(order => {
    const monthIndex = new Date(order.createdAt).getMonth()
    const stats = monthlyStats[monthIndex]
    stats.Órdenes++

    // Incrementa el estado dinámicamente
    if (order.status in stats) {
      stats[order.status]++
    } else {
      stats[order.status] = 1
    }
  })

  return NextResponse.json({
    year: now.getFullYear(),
    type: 'monthly-orders',
    data: monthlyStats,
  })
}
