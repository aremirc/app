// lib/services/workerService.js
import prisma from '@/lib/prisma';

// Crear un nuevo trabajador
export async function createWorker(data) {
  try {
    const newWorker = await prisma.worker.create({
      data,
    });
    return newWorker;
  } catch (error) {
    throw new Error('Error al crear el trabajador');
  }
}

// Obtener todos los trabajadores
export async function getAllWorkers() {
  try {
    const workers = await prisma.worker.findMany();
    return workers;
  } catch (error) {
    throw new Error('Error al obtener los trabajadores');
  }
}

// Obtener un trabajador por DNI
export async function getWorkerByDni(dni) {
  try {
    const worker = await prisma.worker.findUnique({
      where: { dni },
    });
    return worker;
  } catch (error) {
    throw new Error('Trabajador no encontrado');
  }
}

// Actualizar un trabajador
export async function updateWorker(dni, updatedData) {
  try {
    const updatedWorker = await prisma.worker.update({
      where: { dni },
      data: updatedData,
    });
    return updatedWorker;
  } catch (error) {
    throw new Error('Error al actualizar el trabajador');
  }
}

// Eliminar un trabajador
export async function deleteWorker(dni) {
  try {
    await prisma.worker.delete({
      where: { dni },
    });
  } catch (error) {
    throw new Error('Error al eliminar el trabajador');
  }
}
