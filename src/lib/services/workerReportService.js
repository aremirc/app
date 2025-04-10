// lib/services/workerReportService.js
import prisma from '@/lib/prisma';

// Generar reporte de trabajadores con detalles de su actividad
export async function generateWorkerReport({ startDate, endDate }) {
  try {
    const where = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const workers = await prisma.worker.findMany({
      where,
      include: {
        visits: true,
        orders: {
          include: {
            order: true,
          },
        },
      },
    });

    // Agregar métricas de desempeño por trabajador
    const workerStats = workers.map((worker) => {
      const totalVisits = worker.visits.length;
      const totalTime = worker.visits.reduce((acc, visit) => acc + visit.duration, 0);
      const averageSatisfaction = worker.visits.reduce((acc, visit) => acc + (visit.evaluation || 0), 0) / totalVisits;

      return {
        workerId: worker.dni,
        totalVisits,
        totalTime,
        averageSatisfaction: averageSatisfaction || 0,
      };
    });

    return workerStats;
  } catch (error) {
    throw new Error('Error al generar el reporte de trabajadores');
  }
}
