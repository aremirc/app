import prisma from '@/lib/prisma';
import { verifyJWT } from '../login/route';
import { rateLimit } from '@/lib/rateLimiter';

// Función para verificar JWT y aplicar Rate Limiting
async function verifyAndLimit(req) {
  // Verificar el token JWT
  const user = await verifyJWT(req);
  if (user instanceof Response) {
    return user; // Si hay un error con el token, devolvemos la respuesta de error
  }

  // Aplicar Rate Limiting
  const rateLimitResponse = await rateLimit(req);
  if (rateLimitResponse) {
    return rateLimitResponse; // Si el límite se excede, devolver la respuesta 429
  }

  return null; // Si todo es correcto, no se retorna nada
}

// Obtener todos los servicios
export async function GET(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Obtener todos los servicios
    const services = await prisma.service.findMany();
    console.log(services);

    return new Response(JSON.stringify(services), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    return new Response(JSON.stringify({ error: 'Error en la base de datos' }), {
      status: 500,
    });
  }
}

// Crear un nuevo servicio
export async function POST(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Verificar el token JWT antes de proceder
    const user = await verifyJWT(req); // Esto devuelve los datos del usuario (incluyendo el rol)
    if (user instanceof Response) {
      return user; // Si el token es inválido, retornar error 401
    }

    // Verificar si el usuario tiene el rol adecuado (por ejemplo, "Admin")
    const userRole = await prisma.role.findUnique({
      where: { id: user.roleId },
    });
    if (!userRole || userRole.name !== "Admin") {
      return new Response(JSON.stringify({ error: 'No tienes permisos para crear un servicio' }), {
        status: 403, // Forbidden
      });
    }

    // Leer el cuerpo de la solicitud
    const { name, description, price } = await req.json();

    // Validaciones básicas
    if (!name || !price) {
      return new Response(JSON.stringify({ error: 'Nombre y precio son requeridos' }), {
        status: 400, // Bad request
      });
    }

    // Validar el precio: debe ser un número positivo
    if (isNaN(price) || price <= 0) {
      return new Response(JSON.stringify({ error: 'El precio debe ser un número positivo' }), {
        status: 400,
      });
    }

    // // Verificar si el servicio con el mismo nombre ya existe
    // const existingService = await prisma.service.findUnique({
    //   where: { name },
    // });
    // if (existingService) {
    //   return new Response(
    //     JSON.stringify({ error: `Ya existe un servicio con el nombre '${name}'` }),
    //     { status: 400 }
    //   );
    // }

    // Crear el nuevo servicio
    const newService = await prisma.service.create({
      data: {
        name,
        description: description || null, // Si no se proporciona descripción, se guarda como null
        price,
      },
    });

    // Responder con el servicio creado
    return new Response(JSON.stringify(newService), {
      status: 201, // Creado con éxito
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al crear el servicio:', error);
    return new Response(JSON.stringify({ error: 'Error al crear el servicio' }), {
      status: 500, // Error en el servidor
    });
  }
}

// Actualizar un servicio existente
export async function PUT(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { id, name, description, price } = await req.json();

    // Validar que el ID esté presente
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID es requerido' }), {
        status: 400, // Bad request
      });
    }

    // Verificar si el servicio existe
    const existingService = await prisma.service.findUnique({
      where: { id },
    });
    if (!existingService) {
      return new Response(JSON.stringify({ error: 'Servicio no encontrado' }), {
        status: 404, // Not found
      });
    }

    // Validaciones básicas
    if (!name || !price) {
      return new Response(JSON.stringify({ error: 'Nombre y precio son requeridos' }), {
        status: 400, // Bad request
      });
    }

    // Validar el precio: debe ser un número positivo
    if (isNaN(price) || price <= 0) {
      return new Response(JSON.stringify({ error: 'El precio debe ser un número positivo' }), {
        status: 400,
      });
    }

    // Actualizar el servicio
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        description: description || null, // Si no se proporciona descripción, se guarda como null
        price,
      },
    });

    return new Response(JSON.stringify(updatedService), {
      status: 200, // OK
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al actualizar el servicio:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar el servicio' }), {
      status: 500, // Error en el servidor
    });
  }
}

// Eliminar un servicio
export async function DELETE(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { id } = await req.json();

    // Validar que el ID esté presente
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID es requerido' }), {
        status: 400, // Bad request
      });
    }

    // Verificar si el servicio existe
    const existingService = await prisma.service.findUnique({
      where: { id },
    });
    if (!existingService) {
      return new Response(JSON.stringify({ error: 'Servicio no encontrado' }), {
        status: 404, // Not found
      });
    }

    // Eliminar el servicio
    await prisma.service.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: 'Servicio eliminado con éxito' }), {
      status: 200, // OK
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al eliminar el servicio:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar el servicio' }), {
      status: 500, // Error en el servidor
    });
  }
}
