// lib/services/roleService.js
import prisma from '@/lib/prisma';

// Crear un nuevo rol
export async function createRole(data) {
  try {
    const newRole = await prisma.role.create({
      data,
    });
    return newRole;
  } catch (error) {
    throw new Error('Error al crear el rol');
  }
}

// Obtener todos los roles
export async function getAllRoles() {
  try {
    const roles = await prisma.role.findMany();
    return roles;
  } catch (error) {
    throw new Error('Error al obtener los roles');
  }
}

// Obtener un rol por ID
export async function getRoleById(id) {
  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true, users: true },
    });
    return role;
  } catch (error) {
    throw new Error('Rol no encontrado');
  }
}

// Actualizar un rol
export async function updateRole(id, updatedData) {
  try {
    const updatedRole = await prisma.role.update({
      where: { id },
      data: updatedData,
    });
    return updatedRole;
  } catch (error) {
    throw new Error('Error al actualizar el rol');
  }
}

// Eliminar un rol
export async function deleteRole(id) {
  try {
    await prisma.role.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error('Error al eliminar el rol');
  }
}
