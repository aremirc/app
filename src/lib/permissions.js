import prisma from "./prisma" // Asegúrate de importar la instancia de prisma
import { verifyJWT } from "./auth" // O donde sea que tengas la lógica de verificación de JWT
import { rateLimit } from "./rateLimit" // O donde sea que tengas la lógica de rate limiting
import { NextResponse } from 'next/server' // Importar NextResponse

// Obtener permisos del rol y verificar si el usuario tiene el permiso requerido
export async function verifyAndLimit(req, requiredRole = null, requiredPermission = null) {
  const user = await verifyJWT(req)  // Verificar JWT del usuario
  if (user instanceof Response) {
    return user 
  }

  // Verificar si el usuario tiene un roleId
  if (!user.roleId) {
    return NextResponse.json(
      { error: 'Usuario sin rol asignado' },
      { status: 400 }
    )
  }

  // Verificar si se está superando el límite de solicitudes
  const rateLimitResponse = await rateLimit(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  // Verificar rol y permisos si es necesario
  if (requiredRole) {
    const userRole = await prisma.role.findUnique({
      where: { id: user.roleId },
      include: { permissions: true }, // Incluir permisos del rol
    })

    // Si no se encuentra el rol o el rol no coincide con el requerido
    if (!userRole) {
      return NextResponse.json(
        { error: `Rol no encontrado para el usuario` },
        { status: 403 }
      )
    }

    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

    // Verificar si el rol del usuario es el esperado
    if (!allowedRoles.includes(userRole.name)) {
      return NextResponse.json(
        { error: `No tienes permisos para realizar esta acción` },
        { status: 403 }
      )
    }

    // Verificar si el usuario tiene el permiso necesario
    if (requiredPermission && (!userRole.permissions || !Array.isArray(userRole.permissions) || !userRole.permissions.some(p => p.name === requiredPermission))) {
      return NextResponse.json(
        { error: `No tienes permiso para realizar esta acción` },
        { status: 403 }
      )
    }
  }

  // Si todo está bien, continuar con la operación
  return null
}
