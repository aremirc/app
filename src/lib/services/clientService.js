// lib/services/clientService.js
import prisma from '@/lib/prisma';

// Crear un nuevo cliente
export async function createClient(data) {
  try {
    const newClient = await prisma.client.create({
      data,
    });
    return newClient;
  } catch (error) {
    throw new Error('Error al crear el cliente');
  }
}

// Obtener todos los clientes
export async function getAllClients() {
  try {
    const clients = await prisma.client.findMany();
    return clients;
  } catch (error) {
    throw new Error('Error al obtener los clientes');
  }
}

// Obtener un cliente por DNI
export async function getClientByDni(dni) {
  try {
    const client = await prisma.client.findUnique({
      where: { dni },
    });
    return client;
  } catch (error) {
    throw new Error('Cliente no encontrado');
  }
}

// Actualizar un cliente
export async function updateClient(dni, updatedData) {
  try {
    const updatedClient = await prisma.client.update({
      where: { dni },
      data: updatedData,
    });
    return updatedClient;
  } catch (error) {
    throw new Error('Error al actualizar el cliente');
  }
}

// Eliminar un cliente
export async function deleteClient(dni) {
  try {
    await prisma.client.delete({
      where: { dni },
    });
  } catch (error) {
    throw new Error('Error al eliminar el cliente');
  }
}
