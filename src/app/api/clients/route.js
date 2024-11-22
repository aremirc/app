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

// Obtener todos los clientes
export async function GET(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Obtener todos los clientes
    const clients = await prisma.client.findMany();
    console.log(clients);

    return new Response(JSON.stringify(clients), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return new Response(JSON.stringify({ error: 'Error en la base de datos' }), {
      status: 500,
    });
  }
}

// Crear un nuevo cliente
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
      return new Response(JSON.stringify({ error: 'No tienes permisos para crear un cliente' }), {
        status: 403, // Forbidden
      });
    }

    // Leer el cuerpo de la solicitud
    const { dni, name, email, phone, address } = await req.json();

    // Validaciones básicas
    if (!dni || !name || !email) {
      return new Response(JSON.stringify({ error: 'Todos los campos son requeridos' }), {
        status: 400, // Bad request
      });
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Correo electrónico no válido' }), {
        status: 400,
      });
    }

    // Validación del formato del DNI (Ejemplo simple, depende del formato de tu país)
    if (!/^\d{8}$/.test(dni)) {
      return new Response(JSON.stringify({ error: 'DNI no válido. Debe contener 8 dígitos' }), {
        status: 400,
      });
    }

    // Verificar si el correo electrónico ya está registrado
    const existingClientEmail = await prisma.client.findUnique({
      where: { email },
    });
    if (existingClientEmail) {
      return new Response(JSON.stringify({ error: 'El correo electrónico ya está registrado' }), {
        status: 400,
      });
    }

    // Verificar si el DNI ya está registrado
    const existingClientDNI = await prisma.client.findUnique({
      where: { dni },
    });
    if (existingClientDNI) {
      return new Response(JSON.stringify({ error: 'El DNI ya está registrado' }), {
        status: 400,
      });
    }

    // Crear el nuevo cliente
    const newClient = await prisma.client.create({
      data: {
        dni,
        name,
        email,
        phone,  // Opcional
        address, // Opcional
      },
    });

    // Responder con los datos del nuevo cliente (sin el DNI, por razones de privacidad)
    // const { dni: _, ...clientData } = newClient;
    return new Response(JSON.stringify(clientData), {
      status: 201, // Creado con éxito
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al crear el cliente:', error);
    return new Response(JSON.stringify({ error: 'Error al crear el cliente' }), {
      status: 500, // Error en el servidor
    });
  }
}

// Actualizar un cliente existente
export async function PUT(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { dni, name, email, phone, address } = await req.json();

    // Validar que el DNI esté presente
    if (!dni) {
      return new Response(JSON.stringify({ error: 'DNI es requerido' }), {
        status: 400, // Bad request
      });
    }

    // Verificar si el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { dni },
    });
    if (!existingClient) {
      return new Response(JSON.stringify({ error: 'Cliente no encontrado' }), {
        status: 404, // Not found
      });
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (email && !emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Correo electrónico no válido' }), {
        status: 400,
      });
    }

    // Actualizar el cliente
    const updatedClient = await prisma.client.update({
      where: { dni },
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    return new Response(JSON.stringify(updatedClient), {
      status: 200, // OK
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al actualizar el cliente:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar el cliente' }), {
      status: 500, // Error en el servidor
    });
  }
}

// Eliminar un cliente
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

    // Verificar si el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { dni },
    });
    if (!existingClient) {
      return new Response(JSON.stringify({ error: 'Cliente no encontrado' }), {
        status: 404, // Not found
      });
    }

    // Eliminar el cliente
    await prisma.client.delete({
      where: { dni },
    });

    return new Response(JSON.stringify({ message: 'Cliente eliminado con éxito' }), {
      status: 200, // OK
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al eliminar el cliente:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar el cliente' }), {
      status: 500, // Error en el servidor
    });
  }
}
