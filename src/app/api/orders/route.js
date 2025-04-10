import prisma from '@/lib/prisma';
import { verifyCsrfToken } from '@/lib/csrf';
import { verifyAndLimit } from '@/lib/permissions';  // Asegúrate de importar la función correctamente
import { NextResponse } from 'next/server'; // Importar NextResponse

// Obtener todas las órdenes
export async function GET(req) {
  const authResponse = await verifyAndLimit(req);
  if (authResponse) return authResponse;

  try {
    const orders = await prisma.order.findMany({
      include: {
        services: true,
        workers: true,
        client: true,
        visits: true,
      },
    });

    return NextResponse.json(orders, { status: 200 }); // Usar NextResponse.json()
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 });
  }
}

// Crear una nueva orden
export async function POST(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req);

  const authResponse = await verifyAndLimit(req, "Admin");
  if (authResponse) return authResponse;

  try {
    const { clientId, description, status, workerIds = [], services = [] } = await req.json();

    if (!clientId || !description || !status) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    if (!['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Estado de orden no válido' }, { status: 400 });
    }

    // Validar cliente, trabajadores y servicios
    const client = await prisma.client.findUnique({ where: { dni: clientId } });
    if (!client) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 400 });

    const workers = await prisma.worker.findMany({ where: { dni: { in: workerIds } } });
    if (workers.length !== workerIds.length) {
      return NextResponse.json({ error: 'Algunos trabajadores no son válidos' }, { status: 400 });
    }

    const validServices = await prisma.service.findMany({ where: { id: { in: services } } });
    if (validServices.length !== services.length) {
      return NextResponse.json({ error: 'Algunos servicios no son válidos' }, { status: 400 });
    }

    const newOrder = await prisma.order.create({
      data: {
        description,
        status,
        clientId,
        services: { connect: services.map(id => ({ id })) },
        workers: { connect: workerIds.map(dni => ({ dni })) },
      },
      include: { client: true, workers: true, services: true },
    });

    return NextResponse.json(newOrder, { status: 201 }); // Respuesta creada con estado 201
  } catch (error) {
    console.error('Error al crear la orden:', error);
    return NextResponse.json({ error: 'Error al crear la orden' }, { status: 500 });
  }
}

// Editar una orden existente
export async function PUT(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req);

  const authResponse = await verifyAndLimit(req, "Admin");
  if (authResponse) return authResponse;

  try {
    const { id, description, status, clientId, workerIds = [], services = [] } = await req.json();
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { workers: true, services: true },
    });

    if (!currentOrder) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });

    const workersToDisconnect = currentOrder.workers.filter(worker => !workerIds.includes(worker.dni)).map(worker => ({ dni: worker.dni }));
    const servicesToDisconnect = currentOrder.services.filter(service => !services.includes(service.id)).map(service => ({ id: service.id }));

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        description,
        status,
        client: { connect: { dni: clientId } },
        workers: { connect: workerIds.map(dni => ({ dni })), disconnect: workersToDisconnect },
        services: { connect: services.map(id => ({ id })), disconnect: servicesToDisconnect },
      },
      include: { client: true, workers: true, services: true },
    });

    return NextResponse.json(updatedOrder, { status: 200 }); // Respuesta OK
  } catch (error) {
    console.error('Error al actualizar la orden:', error);
    return NextResponse.json({ error: 'Error al actualizar la orden' }, { status: 500 });
  }
}

// Eliminar una orden
export async function DELETE(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req);

  const authResponse = await verifyAndLimit(req, "Admin");
  if (authResponse) return authResponse;

  try {
    const { id } = await req.json();
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });

    const deletedOrder = await prisma.order.delete({ where: { id } });

    return NextResponse.json({ message: 'Orden eliminada con éxito', deletedOrder }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar la orden:', error);
    return NextResponse.json({ error: 'Error al eliminar la orden' }, { status: 500 });
  }
}
