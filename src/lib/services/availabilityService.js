// lib/services/availabilityService.js
import prisma from '@/lib/prisma';

// Crear una nueva disponibilidad
export async function createAvailability(data) {
  try {
    const newAvailability = await prisma.availability.create({
      data,
    });
    return newAvailability;
  } catch (error) {
    throw new Error('Error al crear la disponibilidad');
  }
}

// Obtener todas las disponibilidades
export async function getAllAvailabilities() {
  try {
    const availabilities = await prisma.availability.findMany();
    return availabilities;
  } catch (error) {
    throw new Error('Error al obtener las disponibilidades');
  }
}

// Obtener una disponibilidad por ID
export async function getAvailabilityById(id) {
  try {
    const availability = await prisma.availability.findUnique({
      where: { id },
    });
    return availability;
  } catch (error) {
    throw new Error('Disponibilidad no encontrada');
  }
}

// Actualizar una disponibilidad
export async function updateAvailability(id, updatedData) {
  try {
    const updatedAvailability = await prisma.availability.update({
      where: { id },
      data: updatedData,
    });
    return updatedAvailability;
  } catch (error) {
    throw new Error('Error al actualizar la disponibilidad');
  }
}

// Eliminar una disponibilidad
export async function deleteAvailability(id) {
  try {
    await prisma.availability.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error('Error al eliminar la disponibilidad');
  }
}
