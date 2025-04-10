// lib/services/userService.js
import prisma from '@/lib/prisma';  // Asegúrate de que la conexión a la base de datos está configurada correctamente

// Crear un nuevo usuario
export async function createUser(data) {
  try {
    const newUser = await prisma.user.create({
      data,
    });
    return newUser;
  } catch (error) {
    throw new Error('Error al crear el usuario');
  }
}

// Obtener un usuario por DNI
export async function getUserByDni(dni) {
  try {
    const user = await prisma.user.findUnique({
      where: { dni },
      include: { role: true }, // Puedes incluir la relación de `role` si es necesario
    });
    return user;
  } catch (error) {
    throw new Error('Usuario no encontrado');
  }
}

// Obtener todos los usuarios
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    throw new Error('Error al obtener los usuarios');
  }
}

// Actualizar un usuario
export async function updateUser(dni, updatedData) {
  try {
    const updatedUser = await prisma.user.update({
      where: { dni },
      data: updatedData,
    });
    return updatedUser;
  } catch (error) {
    throw new Error('Error al actualizar el usuario');
  }
}

// Eliminar un usuario
export async function deleteUser(dni) {
  try {
    await prisma.user.delete({
      where: { dni },
    });
  } catch (error) {
    throw new Error('Error al eliminar el usuario');
  }
}
