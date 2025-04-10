// lib/services/orderService.js
import prisma from '@/lib/prisma';

// Crear una nueva orden
export async function createOrder(data) {
  try {
    const newOrder = await prisma.order.create({
      data,
    });
    return newOrder;
  } catch (error) {
    throw new Error('Error al crear la orden');
  }
}

// Obtener una orden por ID
export async function getOrderById(id) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { client: true, user: true, workers: true }, // Puedes incluir las relaciones necesarias
    });
    return order;
  } catch (error) {
    throw new Error('Orden no encontrada');
  }
}

// Obtener todas las órdenes
export async function getAllOrders() {
  try {
    const orders = await prisma.order.findMany();
    return orders;
  } catch (error) {
    throw new Error('Error al obtener las órdenes');
  }
}

// Actualizar una orden
export async function updateOrder(id, updatedData) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updatedData,
    });
    return updatedOrder;
  } catch (error) {
    throw new Error('Error al actualizar la orden');
  }
}

// Eliminar una orden
export async function deleteOrder(id) {
  try {
    await prisma.order.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error('Error al eliminar la orden');
  }
}
