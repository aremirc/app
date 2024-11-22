import bcrypt from 'bcrypt';
import { verifyJWT } from '../login/route';
import { rateLimit } from '@/lib/rateLimiter';
import prisma from '@/lib/prisma';

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

// Obtener todos los trabajadores
export async function GET(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Obtener todos los trabajadores
    const workers = await prisma.worker.findMany({
      include: {
        orders: true,  // Incluir las órdenes asignadas a cada trabajador
        visits: true,  // Incluir las visitas realizadas por el trabajador
      },
    });
    console.log(workers);

    return new Response(JSON.stringify(workers), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener trabajadores:', error);
    return new Response(JSON.stringify({ error: 'Error en la base de datos' }), {
      status: 500,
    });
  }
}

// Crear un nuevo trabajador
export async function POST(req) {
  const rateLimitResponse = await rateLimit(req);
  if (rateLimitResponse) {
    return rateLimitResponse; // Si el límite se excede, devolver la respuesta 429
  }

  try {
    // Verificar el token JWT antes de proceder
    const user = await verifyJWT(req);
    if (user instanceof Response) {
      return user; // Si el token es inválido, retornar error 401
    }

    // Leer el cuerpo de la solicitud
    const { dni, firstName, lastName, email, phone } = await req.json();

    // Validaciones básicas
    if (!dni || !firstName || !lastName || !email) {
      return new Response(JSON.stringify({ error: 'Todos los campos son requeridos' }), {
        status: 400, // Bad request
      });
    }

    // Verificar si el trabajador ya existe por DNI
    const existingWorker = await prisma.worker.findUnique({
      where: { dni },
    });
    if (existingWorker) {
      return new Response(JSON.stringify({ error: 'El trabajador ya existe' }), {
        status: 400,
      });
    }

    // Crear un nuevo trabajador
    const newWorker = await prisma.worker.create({
      data: {
        dni,
        firstName,
        lastName,
        email,
        phone,
      },
    });

    // Responder con el trabajador creado
    return new Response(JSON.stringify(newWorker), {
      status: 201, // Creado con éxito
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al crear el trabajador:', error);
    return new Response(JSON.stringify({ error: 'Error al crear el trabajador' }), {
      status: 500, // Error en el servidor
    });
  }
}

// Actualizar un trabajador existente
export async function PUT(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { dni, firstName, lastName, email, phone } = await req.json();

    // Validar que el DNI esté presente
    if (!dni) {
      return new Response(JSON.stringify({ error: 'DNI es requerido' }), {
        status: 400, // Bad request
      });
    }

    // Verificar si el trabajador existe
    const existingWorker = await prisma.worker.findUnique({
      where: { dni },
    });
    if (!existingWorker) {
      return new Response(JSON.stringify({ error: 'Trabajador no encontrado' }), {
        status: 404, // Not found
      });
    }

    // Actualizar el trabajador
    const updatedWorker = await prisma.worker.update({
      where: { dni },
      data: {
        firstName,
        lastName,
        email,
        phone,
      },
    });

    return new Response(JSON.stringify(updatedWorker), {
      status: 200, // OK
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al actualizar el trabajador:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar el trabajador' }), {
      status: 500, // Error en el servidor
    });
  }
}

// Eliminar un trabajador
export async function DELETE(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { dni } = await req.json();

    // Validar que el DNI esté presente
    if (!dni) {
      return new Response(JSON.stringify({ error: 'DNI es requerido' }), {
        status: 400, // Bad request
      });
    }

    // Verificar si el trabajador existe
    const existingWorker = await prisma.worker.findUnique({
      where: { dni },
    });
    if (!existingWorker) {
      return new Response(JSON.stringify({ error: 'Trabajador no encontrado' }), {
        status: 404, // Not found
      });
    }

    // Eliminar el trabajador
    await prisma.worker.delete({
      where: { dni },
    });

    return new Response(JSON.stringify({ message: 'Trabajador eliminado' }), {
      status: 200, // OK
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al eliminar el trabajador:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar el trabajador' }), {
      status: 500, // Error en el servidor
    });
  }
}
