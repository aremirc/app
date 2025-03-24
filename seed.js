const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // // Eliminar registros dependientes primero, respetando las relaciones
  // await prisma.conformity.deleteMany({}); // Conformidades de órdenes
  // await prisma.visit.deleteMany({});      // Visitas realizadas
  // await prisma.orderWorker.deleteMany({}); // Relación muchos a muchos entre Ordenes y Trabajadores

  // // Eliminar las tablas principales
  // await prisma.order.deleteMany({});      // Ordenes de servicio
  // await prisma.availability.deleteMany({}); // Disponibilidad de los usuarios
  // await prisma.worker.deleteMany({});     // Trabajadores
  // await prisma.service.deleteMany({});    // Servicios
  // await prisma.client.deleteMany({});     // Clientes
  // await prisma.user.deleteMany({});       // Usuarios (finalmente, para evitar relaciones rotas)
  // await prisma.role.deleteMany({});       // Roles de usuario

  // Usando transacciones para garantizar que todo se elimine correctamente
  await prisma.$transaction([
    prisma.conformity.deleteMany({}),
    prisma.visit.deleteMany({}),
    prisma.orderWorker.deleteMany({}),
    prisma.order.deleteMany({}),
    prisma.availability.deleteMany({}),
    prisma.worker.deleteMany({}),
    prisma.service.deleteMany({}),
    prisma.client.deleteMany({}),
    prisma.user.deleteMany({}),
    prisma.role.deleteMany({})
  ]);

  console.log('Base de datos vaciada con éxito!');

  // Crear roles solo si no existen
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},  // Si ya existe, no hace nada
    create: {
      name: 'Admin',
      permissions: [
        'create_user', 'edit_user', 'delete_user', 'view_user',
        'create_client', 'edit_client', 'delete_client', 'view_client',
        'create_order', 'edit_order', 'delete_order', 'view_order',
        'assign_order', 'create_service', 'edit_service', 'delete_service', 'view_service'
      ],
    },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'Moderador' },
    update: {},  // Si ya existe, no hace nada
    create: {
      name: 'Moderador',
      permissions: ['view_order', 'update_order_status', 'create_visit'],
    },
  });

  const workerRole = await prisma.role.upsert({
    where: { name: 'Worker' },
    update: {},  // Si ya existe, no hace nada
    create: {
      name: 'Worker',
      permissions: ['view_order'],
    },
  });

  // Crear usuarios
  const user1 = await prisma.user.create({
    data: {
      dni: '12345678',
      username: 'adminuser',
      email: 'admin@empresa.com',
      password: 'adminpassword', // ¡Recuerda encriptar la contraseña en producción!
      roleId: adminRole.id,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      dni: '23456789',
      username: 'moderatoruser',
      email: 'moderator@empresa.com',
      password: 'moderatorpassword',
      roleId: moderatorRole.id,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      dni: '34567891',
      username: 'workeruser',
      email: 'worker@empresa.com',
      password: 'workerpassword',
      roleId: workerRole.id,
    },
  });

  // Crear trabajadores (conectando usuarios con trabajadores)
  const worker1 = await prisma.worker.create({
    data: {
      dni: user2.dni,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: user2.email,
      phone: '5552345678',
    },
  });

  const worker2 = await prisma.worker.create({
    data: {
      dni: user3.dni,
      firstName: 'Carlos',
      lastName: 'Sanchez',
      email: user3.email,
      phone: '5682345346',
    },
  });

  // Crear clientes
  const client1 = await prisma.client.create({
    data: {
      dni: '99999999',
      name: 'Mónica Campos',
      email: 'monica@empresa.com',
      phone: '555123456',
      address: 'Calle Ficticia 123',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      dni: '88888888',
      name: 'Fernando Torres',
      email: 'fernando@empresa.com',
      phone: '555987654',
      address: 'Avenida Imaginaria 456',
    },
  });

  // Crear servicios
  const service1 = await prisma.service.create({
    data: {
      name: 'Instalación Eléctrica',
      description: 'Instalación de sistemas eléctricos para hogares y empresas.',
      price: 150.00,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      name: 'Mantenimiento HVAC',
      description: 'Mantenimiento preventivo y correctivo de sistemas HVAC.',
      price: 200.00,
    },
  });

  // Crear órdenes de servicio
  const order1 = await prisma.order.create({
    data: {
      description: 'Instalación de sistema eléctrico en una casa.',
      status: 'PENDING',
      clientId: client1.dni,
      workers: {
        create: [
          {
            workerId: worker1.dni,
            status: 'in-progress',
            duration: 120, // Duración de la tarea en minutos
          },
          {
            workerId: worker2.dni,
            status: 'in-progress',
            duration: 120, // Duración de la tarea en minutos
          },
        ],
      },
      services: {
        connect: [{ id: service1.id }],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      description: 'Mantenimiento preventivo de aire acondicionado.',
      status: 'PENDING',
      clientId: client2.dni,
      workers: {
        create: [
          {
            workerId: worker1.dni,
            status: 'in-progress',
            duration: 60, // Duración de la tarea en minutos
          },
          {
            workerId: worker2.dni,
            status: 'in-progress',
            duration: 60, // Duración de la tarea en minutos
          },
        ],
      },
      services: {
        connect: [{ id: service1.id }, { id: service2.id }],
      },
    },
  });

  // Crear visitas (detalles de las órdenes)
  const visit1 = await prisma.visit.create({
    data: {
      date: new Date(),
      description: 'Se realizó la instalación de todo el sistema eléctrico.',
      orderId: order1.id,
      workerId: worker1.dni,
      clientId: client1.dni,
      duration: 120, // Duración de la visita en minutos
      evaluation: 5, // Evaluación de la visita
    },
  });

  const visit2 = await prisma.visit.create({
    data: {
      date: new Date(),
      description: 'Se realizó el mantenimiento preventivo del sistema HVAC.',
      orderId: order2.id,
      workerId: worker1.dni,
      clientId: client2.dni,
      duration: 60, // Duración de la visita en minutos
      evaluation: 4, // Evaluación de la visita
    },
  });

  // Crear disponibilidad de los trabajadores
  const availability1 = await prisma.availability.create({
    data: {
      dni: worker1.dni,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      type: 'full-time', // Tipo de disponibilidad
    },
  });

  const availability2 = await prisma.availability.create({
    data: {
      dni: worker2.dni,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      type: 'part-time', // Tipo de disponibilidad
    },
  });

  console.log('Base de datos inicializada con éxito!');
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
