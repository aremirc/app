// lib/services/orderWorkerService.js
import prisma from '@/lib/prisma';

// Asignar un trabajador a una orden
export async function assignWorkerToOrder(data) {
  try {
    const newOrderWorker = await prisma.orderWorker.create({
      data,
    });
    return newOrderWorker;
  } catch (error) {
    throw new Error('Error al asignar trabajador a la orden');
  }
}

// Obtener todos los trabajadores asignados a una orden
export async function getWorkersForOrder(orderId) {
  try {
    const workers = await prisma.orderWorker.findMany({
      where: { orderId },
      include: { worker: true },
    });
    return workers;
  } catch (error) {
    throw new Error('Error al obtener los trabajadores asignados a la orden');
  }
}

// Eliminar un trabajador de una orden
export async function removeWorkerFromOrder(orderId, workerId) {
  try {
    await prisma.orderWorker.delete({
      where: { orderId_workerId: { orderId, workerId } },
    });
  } catch (error) {
    throw new Error('Error al eliminar trabajador de la orden');
  }
}
