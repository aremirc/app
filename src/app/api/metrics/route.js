import { NextResponse } from 'next/server'
import { verifyAndLimit } from '@/lib/permissions'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const authResponse = await verifyAndLimit(req)
  if (authResponse) return authResponse

  try {
    const workers = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        role: {
          is: {
            name: 'TECHNICIAN',
          },
        },
      },
      include: {
        visits: {
          where: {
            deletedAt: null,
          },
        },
        orderWorkers: {
          include: {
            order: true,
          },
          where: {
            order: {
              deletedAt: null,
            }
          },
        },
      },
    })

    const metrics = workers.map((worker) => {
      const totalVisits = worker.visits.length

      const totalTime = worker.visits.reduce((acc, visit) => {
        const duration = visit.endTime
          ? (new Date(visit.endTime).getTime() - new Date(visit.date).getTime()) / (1000 * 60) // minutos
          : 0

        return acc + duration
      }, 0)

      const totalHours = Math.round(totalTime / 60 * 100) / 100

      const visitsWithEval = worker.visits.filter(v => v.evaluation !== null && v.isReviewed)

      const averageSatisfaction = visitsWithEval.length > 0
        ? visitsWithEval.reduce((acc, v) => acc + v.evaluation, 0) / visitsWithEval.length
        : null

      // completedOrders
      const completedAssignments = worker.orderWorkers.filter(ow => ow.status === 'COMPLETED').length

      const completedOrderIds = [
        ...new Set(
          worker.orderWorkers
            .filter(ow => ow.order.status === 'COMPLETED')
            .map(ow => ow.order.id)
        )
      ]

      return {
        dni: worker.dni,
        firstName: worker.firstName,
        lastName: worker.lastName,
        birthDate: worker.birthDate,
        totalVisits,
        totalTime: Math.round(totalTime),
        totalHours,
        averageSatisfaction: averageSatisfaction !== null ? Math.round(averageSatisfaction * 100) / 100 : null,
        completedAssignments,
        completedOrderIds,
        icon: 'wrench',
      }
    })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error al calcular métricas:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
