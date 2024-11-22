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

// Obtener todas las visitas
export async function GET(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Obtener todas las visitas
    const visits = await prisma.visit.findMany();
    console.log(visits);

    return new Response(JSON.stringify(visits), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener visitas:', error);
    return new Response(JSON.stringify({ error: 'Error en la base de datos' }), {
      status: 500,
    });
  }
}

// Crear una nueva visita
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
    const { orderId, workerId, date, description } = await req.json();

    // Validaciones básicas
    if (!orderId || !workerId || !date || !description) {
      return new Response(JSON.stringify({ error: 'Todos los campos son requeridos' }), {
        status: 400, // Bad request
      });
    }

    // Validar el formato de la fecha
    const visitDate = new Date(date);
    if (isNaN(visitDate.getTime())) {
      return new Response(JSON.stringify({ error: 'Fecha inválida' }), {
        status: 400,
      });
    }

    // Verificar que la fecha no sea en el futuro
    const currentDate = new Date();
    if (visitDate > currentDate) {
      return new Response(JSON.stringify({ error: 'La fecha de la visita no puede ser en el futuro' }), {
        status: 400,
      });
    }

    // Verificar si la orden existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      return new Response(JSON.stringify({ error: 'Orden no encontrada' }), {
        status: 400,
      });
    }

    // Verificar el estado de la orden (la visita solo se puede registrar si la orden está "PENDING" o "IN_PROGRESS")
    if (![ "PENDING", "IN_PROGRESS" ].includes(order.status)) {
      return new Response(JSON.stringify({ error: 'La orden no está en un estado válido para registrar una visita' }), {
        status: 400,
      });
    }

    // Verificar si el trabajador está asignado a la orden
    if (order.workerId && order.workerId !== workerId) {
      return new Response(
        JSON.stringify({ error: 'El trabajador no está asignado a esta orden' }),
        { status: 400 }
      );
    }

    // Verificar si el trabajador existe
    const worker = await prisma.worker.findUnique({
      where: { dni: workerId },
    });
    if (!worker) {
      return new Response(JSON.stringify({ error: 'Trabajador no encontrado' }), {
        status: 400,
      });
    }

    // Verificar la disponibilidad del trabajador en la fecha de la visita
    // const workerAvailability = await prisma.availability.findFirst({
    //   where: {
    //     dni: workerId,
    //     startDate: { lte: visitDate },
    //     endDate: { gte: visitDate },
    //   },
    // });
    // if (!workerAvailability) {
    //   return new Response(
    //     JSON.stringify({ error: 'El trabajador no está disponible en esta fecha' }),
    //     { status: 400 }
    //   );
    // }

    // Crear la nueva visita
    const newVisit = await prisma.visit.create({
      data: {
        orderId,
        workerId,
        date: visitDate,
        description,
        clientId: order.clientId, // Asociar al cliente de la orden
      },
      include: {
        order: true,
        worker: true,
        client: true,
      },
    });

    // Responder con la visita creada
    return new Response(JSON.stringify(newVisit), {
      status: 201, // Creado con éxito
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al crear la visita:', error);
    return new Response(JSON.stringify({ error: 'Error al crear la visita' }), {
      status: 500, // Error en el servidor
    });
  }
}

// Actualizar una visita existente
export async function PUT(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { id, orderId, workerId, date, description } = await req.json();

    // Validar que el ID esté presente
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID es requerido' }), {
        status: 400, // Bad request
      });
    }

    // Verificar si la visita existe
    const existingVisit = await prisma.visit.findUnique({
      where: { id },
    });
    if (!existingVisit) {
      return new Response(JSON.stringify({ error: 'Visita no encontrada' }), {
        status: 404, // Not found
      });
    }

    // Validaciones
    if (!orderId || !workerId || !date || !description) {
      return new Response(JSON.stringify({ error: 'Todos los campos son requeridos' }), {
        status: 400, // Bad request
      });
    }

    // Validar el formato de la fecha
    const visitDate = new Date(date);
    if (isNaN(visitDate.getTime())) {
      return new Response(JSON.stringify({ error: 'Fecha inválida' }), {
        status: 400,
      });
    }

    // Verificar que la fecha no sea en el futuro
    const currentDate = new Date();
    if (visitDate > currentDate) {
      return new Response(JSON.stringify({ error: 'La fecha de la visita no puede ser en el futuro' }), {
        status: 400,
      });
    }

    // Verificar si la orden existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      return new Response(JSON.stringify({ error: 'Orden no encontrada' }), {
        status: 400,
      });
    }

    // Verificar si el trabajador existe
    const worker = await prisma.worker.findUnique({
      where: { dni: workerId },
    });
    if (!worker) {
      return new Response(JSON.stringify({ error: 'Trabajador no encontrado' }), {
        status: 400,
      });
    }

    // Actualizar la visita
    const updatedVisit = await prisma.visit.update({
      where: { id },
      data: {
        orderId,
        workerId,
        date: visitDate,
        description,
      },
    });

    return new Response(JSON.stringify(updatedVisit), {
      status: 200, // OK
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al actualizar la visita:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar la visita' }), {
      status: 500, // Error en el servidor
    });
  }
}

// Eliminar una visita
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

    // Verificar si la visita existe
    const existingVisit = await prisma.visit.findUnique({
      where: { id },
    });
    if (!existingVisit) {
      return new Response(JSON.stringify({ error: 'Visita no encontrada' }), {
        status: 404, // Not found
      });
    }

    // Eliminar la visita
    await prisma.visit.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: 'Visita eliminada' }), {
      status: 200, // OK
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al eliminar la visita:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar la visita' }), {
      status: 500, // Error en el servidor
    });
  }
}
