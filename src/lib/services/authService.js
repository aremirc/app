// lib/services/authService.js
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function authenticateUser(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { dni: decoded.dni },
      include: { role: true },
    });
    return user;
  } catch (error) {
    throw new Error('Autenticación fallida');
  }
}

export function verifyRole(user, roleRequired) {
  if (user.role.name !== roleRequired) {
    throw new Error('Acceso denegado');
  }
}
