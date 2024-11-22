import prisma from '@/lib/prisma';
import { verifyJWT } from '../login/route';
import { rateLimit } from '@/lib/rateLimiter';

// Función para verificar el JWT y aplicar Rate Limiting
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

// Obtener todas las órdenes
export async function GET(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        services: true,
        // client: true,
        workers: true,
        // visits: true,
      },
    });
    console.log(orders);

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    return new Response(JSON.stringify({ error: 'Error en la base de datos' }), {
      status: 500,
    });
  }
}

// Crear una nueva orden
export async function POST(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) {
    return authResponse;
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
      return new Response(JSON.stringify({ error: 'No tienes permisos para crear una orden' }), {
        status: 403, // Forbidden
      });
    }

    const { clientId, description, status, workerIds, services } = await req.json();

    if (!clientId || !description || !status) {
      return new Response(JSON.stringify({ error: 'Todos los campos son requeridos' }), {
        status: 400,
      });
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: 'Estado de orden no válido' }), {
        status: 400,
      });
    }

    const client = await prisma.client.findUnique({ where: { dni: clientId } });
    if (!client) {
      return new Response(JSON.stringify({ error: 'Cliente no encontrado' }), { status: 400 });
    }

    // Validar que los trabajadores existan (si se proporcionan)
    if (workerIds && workerIds.length > 0) {
      const workers = await prisma.worker.findMany({
        where: { dni: { in: workerIds } },
      });
      if (workers.length !== workerIds.length) {
        return new Response(JSON.stringify({ error: 'Algunos trabajadores no son válidos' }), {
          status: 400,
        });
      }
    }

    // Validar que los servicios existan (si se proporcionan)
    if (services && services.length > 0) {
      const validServices = await prisma.service.findMany({ where: { id: { in: services } } });
      if (validServices.length !== services.length) {
        return new Response(JSON.stringify({ error: 'Algunos servicios no son válidos' }), {
          status: 400,
        });
      }
    }

    const newOrder = await prisma.order.create({
      data: {
        description,
        status,
        clientId,
        services: {
          connect: services ? services.map((id) => ({ id })) : [], // Conectar servicios
        },
        workers: {
          connect: workerIds ? workerIds.map((dni) => ({ dni })) : [], // Usamos connect para asociar trabajadores a la orden
        },
      },
      include: {
        client: true,
        workers: true,
        services: true,
      },
    });

    return new Response(JSON.stringify(newOrder), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al crear la orden:', error);
    return new Response(JSON.stringify({ error: 'Error al crear la orden' }), { status: 500 });
  }
}

// Editar una orden existente
export async function PUT(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { id, description, status, clientId, workerIds, services } = await req.json();

    // Obtener la orden actual para poder actualizar las relaciones
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        workers: true,
        services: true,
      },
    });

    if (!currentOrder) {
      return new Response(JSON.stringify({ error: 'Orden no encontrada' }), { status: 404 });
    }

    // Desconectar los trabajadores y servicios que ya no estén en el arreglo recibido
    const workersToDisconnect = currentOrder.workers
      .filter(worker => !workerIds.includes(worker.dni))
      .map(worker => ({ dni: worker.dni }));

    const servicesToDisconnect = currentOrder.services
      .filter(service => !services.includes(service.id))
      .map(service => ({ id: service.id }));

    // Actualizar la orden con nuevos datos y relaciones
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        description,
        status,
        client: { connect: { dni: clientId } },
        workers: {
          connect: workerIds ? workerIds.map((dni) => ({ dni })) : [], // Conectar nuevos trabajadores
          // disconnect: workersToDisconnect, // Desconectar trabajadores que no están en el array
        },
        services: {
          connect: services ? services.map((service) => ({ id: service.id })) : [], // Conectar nuevos servicios
          // disconnect: servicesToDisconnect, // Desconectar servicios que no están en el array
        },
      },
      include: {
        client: true,
        workers: true,
        services: true,
      },
    });

    return new Response(JSON.stringify(updatedOrder), { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la orden:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar la orden' }), { status: 500 });
  }
}

// Eliminar una orden
export async function DELETE(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { id } = await req.json();

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return new Response(JSON.stringify({ error: 'Orden no encontrada' }), { status: 404 });
    }

    // Eliminar la orden
    const deletedOrder = await prisma.order.delete({ where: { id } });

    return new Response(JSON.stringify({ message: 'Orden eliminada con éxito', deletedOrder }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al eliminar la orden:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar la orden' }), { status: 500 });
  }
}
