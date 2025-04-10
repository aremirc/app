// lib/services/permissionService.js
import prisma from '@/lib/prisma';

// Crear un nuevo permiso
export async function createPermission(data) {
  try {
    const newPermission = await prisma.permission.create({
      data,
    });
    return newPermission;
  } catch (error) {
    throw new Error('Error al crear el permiso');
  }
}

// Obtener todos los permisos
export async function getAllPermissions() {
  try {
    const permissions = await prisma.permission.findMany();
    return permissions;
  } catch (error) {
    throw new Error('Error al obtener los permisos');
  }
}

// Obtener un permiso por ID
export async function getPermissionById(id) {
  try {
    const permission = await prisma.permission.findUnique({
      where: { id },
    });
    return permission;
  } catch (error) {
    throw new Error('Permiso no encontrado');
  }
}

// Actualizar un permiso
export async function updatePermission(id, updatedData) {
  try {
    const updatedPermission = await prisma.permission.update({
      where: { id },
      data: updatedData,
    });
    return updatedPermission;
  } catch (error) {
    throw new Error('Error al actualizar el permiso');
  }
}

// Eliminar un permiso
export async function deletePermission(id) {
  try {
    await prisma.permission.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error('Error al eliminar el permiso');
  }
}
