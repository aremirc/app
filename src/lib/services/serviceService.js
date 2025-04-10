// lib/services/serviceService.js
import prisma from '@/lib/prisma';

// Crear un nuevo servicio
export async function createService(data) {
  try {
    const newService = await prisma.service.create({
      data,
    });
    return newService;
  } catch (error) {
    throw new Error('Error al crear el servicio');
  }
}

// Obtener todos los servicios
export async function getAllServices() {
  try {
    const services = await prisma.service.findMany();
    return services;
  } catch (error) {
    throw new Error('Error al obtener los servicios');
  }
}

// Obtener un servicio por ID
export async function getServiceById(id) {
  try {
    const service = await prisma.service.findUnique({
      where: { id },
    });
    return service;
  } catch (error) {
    throw new Error('Servicio no encontrado');
  }
}

// Actualizar un servicio
export async function updateService(id, updatedData) {
  try {
    const updatedService = await prisma.service.update({
      where: { id },
      data: updatedData,
    });
    return updatedService;
  } catch (error) {
    throw new Error('Error al actualizar el servicio');
  }
}

// Eliminar un servicio
export async function deleteService(id) {
  try {
    await prisma.service.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error('Error al eliminar el servicio');
  }
}
