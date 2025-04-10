// lib/services/conformityService.js
import prisma from '@/lib/prisma';

// Crear una nueva conformidad
export async function createConformity(data) {
  try {
    const newConformity = await prisma.conformity.create({
      data,
    });
    return newConformity;
  } catch (error) {
    throw new Error('Error al crear la conformidad');
  }
}

// Obtener todas las conformidades
export async function getAllConformities() {
  try {
    const conformities = await prisma.conformity.findMany();
    return conformities;
  } catch (error) {
    throw new Error('Error al obtener las conformidades');
  }
}

// Obtener una conformidad por ID
export async function getConformityById(id) {
  try {
    const conformity = await prisma.conformity.findUnique({
      where: { id },
    });
    return conformity;
  } catch (error) {
    throw new Error('Conformidad no encontrada');
  }
}

// Actualizar una conformidad
export async function updateConformity(id, updatedData) {
  try {
    const updatedConformity = await prisma.conformity.update({
      where: { id },
      data: updatedData,
    });
    return updatedConformity;
  } catch (error) {
    throw new Error('Error al actualizar la conformidad');
  }
}

// Eliminar una conformidad
export async function deleteConformity(id) {
  try {
    await prisma.conformity.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error('Error al eliminar la conformidad');
  }
}
