import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const workers = await prisma.user.findMany({
      where: {
        role: {
          name: 'TECHNICIAN',
        },
      },
      include: {
        visits: true,
        orderWorkers: {
          include: {
            order: true,
          },
        },
      },
    })

    const metrics = workers.map((worker) => {
      const totalVisits = worker.visits.length

      const totalTime = worker.visits.reduce((acc, visit) => {
        const start = new Date(visit.date)
        const end = new Date(visit.endTime)
        const duration = (end.getTime() - start.getTime()) / (1000 * 60) // minutos
        return acc + duration
      }, 0)

      const visitsWithEval = worker.visits.filter(v => v.evaluation !== null)
      const averageSatisfaction = visitsWithEval.reduce((acc, v) => acc + (v.evaluation ?? 0), 0) / (visitsWithEval.length || 1)

      const completedOrders = worker.orderWorkers.filter(ow => ow.status === 'COMPLETED').length

      const totalInterventionTime = worker.orderWorkers.reduce((acc, ow) => {
        const { order } = ow
        if (!order) return acc
        const duration = (new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime()) / (1000 * 60)
        return acc + duration
      }, 0)

      const totalResponseTime = worker.orderWorkers
        .filter(ow => ow.order.status === 'COMPLETED')
        .reduce((acc, ow) => {
          const created = new Date(ow.order.createdAt).getTime()
          const updated = new Date(ow.order.updatedAt).getTime()
          return acc + (updated - created) / (1000 * 60)
        }, 0)

      return {
        dni: worker.dni,
        firstName: worker.firstName,
        lastName: worker.lastName,
        totalVisits,
        totalTime: Math.round(totalTime),
        averageSatisfaction: Math.round(averageSatisfaction * 100) / 100,
        completedOrders,
        totalInterventionTime: Math.round(totalInterventionTime),
        totalResponseTime: Math.round(totalResponseTime),
        icon: 'briefcase', // Puedes usar otros íconos si quieres
      }
    })

    return NextResponse.json({ data: metrics })
  } catch (error) {
    console.error('Error al calcular métricas:', error)
    return NextResponse.json({ error: 'Error al calcular métricas' }, { status: 500 })
  }
}
