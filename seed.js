const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Eliminar todos los registros de las tablas en el orden correcto (de las tablas con relaciones a las tablas dependientes)
  await prisma.conformity.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.availability.deleteMany({});
  await prisma.worker.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  // Eliminar registros de la tabla intermedia (OrderWorker) para evitar relaciones duplicadas
  await prisma.orderWorker.deleteMany({});

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
      password: 'adminpassword', // ¡No olvides encriptar la contraseña en producción!
      role: {
        connect: { id: adminRole.id },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      dni: '23456789',
      username: 'moderatoruser',
      email: 'moderator@empresa.com',
      password: 'moderatorpassword',
      role: {
        connect: { id: moderatorRole.id },
      },
    },
  });

  const user3 = await prisma.user.create({
    data: {
      dni: '34567891',
      username: 'workeruser',
      email: 'worker@empresa.com',
      password: 'workerpassword',
      role: {
        connect: { id: workerRole.id },
      },
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
      client: {
        connect: { dni: client1.dni },
      },
      workers: {
        create: [
          {
            worker: {
              connect: { dni: worker1.dni } // Usando dni o id del trabajador
            }
          },
          {
            worker: {
              connect: { dni: worker2.dni } // Usando dni o id del trabajador
            }
          }
        ]
      },
      services: {
        connect: [{ id: service1.id }], // Conectar servicios si es necesario
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      description: 'Mantenimiento preventivo de aire acondicionado.',
      status: 'PENDING',
      client: {
        connect: { dni: client2.dni },
      },
      workers: {
        create: [
          {
            worker: {
              connect: { dni: worker1.dni } // Usando dni o id del trabajador
            }
          },
          {
            worker: {
              connect: { dni: worker2.dni } // Usando dni o id del trabajador
            }
          }
        ]
      },
      services: {
        connect: [{ id: service1.id }, { id: service2.id }], // Conectar servicios si es necesario
      },
    },
  });

  // Crear visitas (detalles de las órdenes)
  const visit1 = await prisma.visit.create({
    data: {
      date: new Date(),
      description: 'Se realizó la instalación de todo el sistema eléctrico.',
      order: {
        connect: { id: order1.id },
      },
      worker: {
        connect: { dni: worker1.dni },
      },
      client: {
        connect: { dni: client1.dni },
      },
    },
  });

  const visit2 = await prisma.visit.create({
    data: {
      date: new Date(),
      description: 'Se realizó el mantenimiento preventivo del sistema HVAC.',
      order: {
        connect: { id: order2.id },
      },
      worker: {
        connect: { dni: worker1.dni }, // Asignar al trabajador correcto
      },
      client: {
        connect: { dni: client2.dni },
      },
    },
  });

  // Crear disponibilidad de los trabajadores
  const availability1 = await prisma.availability.create({
    data: {
      dni: worker1.dni,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Disponible durante los próximos 7 días
    },
  });

  const availability2 = await prisma.availability.create({
    data: {
      dni: worker2.dni,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Disponible durante los próximos 7 días
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
