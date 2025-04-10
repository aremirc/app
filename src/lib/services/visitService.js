// lib/services/visitService.js
import prisma from '@/lib/prisma';

// Crear una nueva visita
export async function createVisit(data) {
  try {
    const newVisit = await prisma.visit.create({
      data,
    });
    return newVisit;
  } catch (error) {
    throw new Error('Error al crear la visita');
  }
}

// Obtener todas las visitas
export async function getAllVisits() {
  try {
    const visits = await prisma.visit.findMany();
    return visits;
  } catch (error) {
    throw new Error('Error al obtener las visitas');
  }
}

// Obtener una visita por ID
export async function getVisitById(id) {
  try {
    const visit = await prisma.visit.findUnique({
      where: { id },
    });
    return visit;
  } catch (error) {
    throw new Error('Visita no encontrada');
  }
}

// Actualizar una visita
export async function updateVisit(id, updatedData) {
  try {
    const updatedVisit = await prisma.visit.update({
      where: { id },
      data: updatedData,
    });
    return updatedVisit;
  } catch (error) {
    throw new Error('Error al actualizar la visita');
  }
}

// Eliminar una visita
export async function deleteVisit(id) {
  try {
    await prisma.visit.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error('Error al eliminar la visita');
  }
}
