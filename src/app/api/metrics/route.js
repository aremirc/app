import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Función para calcular métricas de un trabajador
function calculateWorkerMetrics(worker) {
  const totalVisits = worker.visits.length;
  const totalTime = worker.visits.reduce((acc, visit) => acc + visit.duration, 0);

  const visitsWithEvaluation = worker.visits.filter(v => v.evaluation !== null);
  const averageSatisfaction = visitsWithEvaluation.reduce((acc, visit) => acc + visit.evaluation, 0) / (visitsWithEvaluation.length || 1);

  // Calcular número de órdenes completadas
  const completedOrders = worker.orders.filter(orderWorker => orderWorker.status === 'completed').length;

  // Cálculo de tiempos de intervención y de respuesta
  const totalInterventionTime = worker.orders.reduce((acc, orderWorker) => acc + orderWorker.duration, 0);
  const totalResponseTime = worker.orders.filter(orderWorker => orderWorker.order.status === 'completed').reduce((acc, orderWorker) => {
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
}

// Función para obtener los trabajadores y calcular sus métricas
export async function GET() {
  try {
    // Consulta para obtener todos los trabajadores con sus visitas y órdenes
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

    // Calcular métricas de cada trabajador
    const metrics = workers.map(calculateWorkerMetrics);

    // Usar NextResponse.json() para devolver las métricas en formato JSON
    return NextResponse.json({ data: metrics });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al calcular las métricas' }, { status: 500 });
  }
}
