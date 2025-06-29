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

  const visits = await prisma.visit.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      deletedAt: null
    },
    select: {
      createdAt: true,
      date: true,
      endTime: true,
      isReviewed: true,
      evaluation: true
    }
  })

  const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString('es-PE', { month: 'short' }),
    Visitas: 0,
    Evaluadas: 0,
    DuraciónPromedio: 0,
    PromedioSatisfacción: 0,
    _totalDuracion: 0,
    _totalEvaluacion: 0,
    _evaluacionesCount: 0
  }))

  visits.forEach(visit => {
    const monthIndex = new Date(visit.createdAt).getMonth()
    const stat = monthlyStats[monthIndex]
    stat.Visitas++

    if (visit.isReviewed && visit.evaluation !== null) {
      stat.Evaluadas++
      stat._totalEvaluacion += visit.evaluation
      stat._evaluacionesCount++
    }

    if (visit.endTime) {
      const start = new Date(visit.date).getTime()
      const end = new Date(visit.endTime).getTime()
      const duration = (end - start) / (1000 * 60) // minutos
      stat._totalDuracion += duration
    }
  })

  // Calcular promedios
  monthlyStats.forEach(stat => {
    if (stat.Visitas > 0) {
      stat.DuraciónPromedio = parseFloat((stat._totalDuracion / stat.Visitas).toFixed(2))
    }

    if (stat._evaluacionesCount > 0) {
      stat.PromedioSatisfacción = Math.round(stat._totalEvaluacion / stat._evaluacionesCount)
    }

    // Limpiar campos temporales
    delete stat._totalDuracion
    delete stat._totalEvaluacion
    delete stat._evaluacionesCount
  })

  return NextResponse.json({
    year: now.getFullYear(),
    type: 'monthly-visits',
    data: monthlyStats
  })
}
