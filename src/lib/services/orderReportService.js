// lib/services/orderReportService.js
import prisma from '@/lib/prisma';

// Generar reporte de órdenes con filtros opcionales
export async function generateOrderReport({ status, startDate, endDate }) {
  try {
    const where = {};

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        client: true,
        workers: {
          include: {
            worker: true,
          },
        },
        services: true,
      },
    });

    return orders;
  } catch (error) {
    throw new Error('Error al generar el reporte de órdenes');
  }
}
