import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Consulta para obtener todos los técnicos y sus métricas
    const workers = await prisma.worker.findMany({
      include: {
        visits: true, // Incluye todas las visitas
        orders: {
          include: {
            order: true, // Incluir la orden para extraer información de ella
          }
        },
      },
    });

    const metrics = workers.map((worker) => {
      const totalVisits = worker.visits.length;
      const totalTime = worker.visits.reduce((acc, visit) => acc + visit.duration, 0);
      const averageSatisfaction = worker.visits.filter(v => v.evaluation !== null).reduce((acc, visit) => acc + visit.evaluation, 0) / (worker.visits.filter(v => v.evaluation !== null).length || 1);
      
      // Calcular número de órdenes completadas
      const completedOrders = worker.orders.filter(orderWorker => orderWorker.status === 'completed').length;

      // Cálculo de tiempos de intervención y de respuesta
      const totalInterventionTime = worker.orders.reduce((acc, orderWorker) => acc + orderWorker.duration, 0);
      const totalResponseTime = worker.orders.filter(orderWorker => orderWorker.order.status === 'completed').reduce((acc, orderWorker) => {
        // Este cálculo depende de la lógica de "tiempo de respuesta", que debe definirse
        return acc + (new Date(orderWorker.order.updatedAt).getTime() - new Date(orderWorker.order.createdAt).getTime());
      }, 0);

      return {
        dni: worker.dni,
        firstName: worker.firstName,
        lastName: worker.lastName,
        totalVisits,
        totalTime,
        averageSatisfaction,
        completedOrders,
        totalInterventionTime,
        totalResponseTime,
      };
    });

    return new NextResponse(JSON.stringify({ data: metrics }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Error al calcular las métricas' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
