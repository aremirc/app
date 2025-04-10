// lib/services/clientReportService.js
import prisma from '@/lib/prisma';

// Generar reporte de clientes con sus órdenes y visitas
export async function generateClientReport({ startDate, endDate }) {
  try {
    const where = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        orders: true,
        visits: true,
      },
    });

    const clientStats = clients.map((client) => {
      const totalOrders = client.orders.length;
      const totalVisits = client.visits.length;
      const pendingOrders = client.orders.filter(order => order.status === 'PENDING').length;
      const failedOrders = client.orders.filter(order => order.status === 'FAILED').length;

      return {
        clientId: client.dni,
        totalOrders,
        totalVisits,
        pendingOrders,
        failedOrders,
      };
    });

    return clientStats;
  } catch (error) {
    throw new Error('Error al generar el reporte de clientes');
  }
}
