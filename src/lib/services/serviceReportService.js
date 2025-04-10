// lib/services/serviceReportService.js
import prisma from '@/lib/prisma';

// Generar reporte de servicios utilizados en órdenes
export async function generateServiceReport({ startDate, endDate }) {
  try {
    const where = {};

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        orders: true,
      },
    });

    const serviceStats = services.map((service) => {
      const totalUsage = service.orders.length;
      const totalRevenue = service.orders.reduce((acc, order) => acc + order.price, 0);

      return {
        serviceId: service.id,
        totalUsage,
        totalRevenue,
      };
    });

    return serviceStats;
  } catch (error) {
    throw new Error('Error al generar el reporte de servicios');
  }
}
