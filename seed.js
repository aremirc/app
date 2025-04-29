const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Resetear base de datos
  await prisma.$transaction([
    prisma.conformity.deleteMany({}),
    prisma.visit.deleteMany({}),
    prisma.orderWorker.deleteMany({}),
    prisma.order.deleteMany({}),
    prisma.availability.deleteMany({}),
    prisma.service.deleteMany({}),
    prisma.client.deleteMany({}),
    prisma.user.deleteMany({}),
    prisma.role.deleteMany({}),
    prisma.permission.deleteMany({})
  ]);

  console.log('Base de datos vaciada con éxito!');

  // Crear todos los permisos necesarios
  const permissions = [
    'create_user', 'edit_user', 'delete_user', 'view_user',
    'create_client', 'edit_client', 'delete_client', 'view_client',
    'create_order', 'edit_order', 'delete_order', 'view_order',
    'assign_order', 'update_order_status', 'complete_order',
    'create_service', 'edit_service', 'delete_service', 'view_service',
    'create_visit', 'edit_visit', 'delete_visit', 'view_visit',
    'manage_availability', 'approve_conformity', 'reject_conformity',
    'assign_worker', 'evaluate_visit', 'manage_orders'
  ];

  const createdPermissions = await prisma.$transaction(
    permissions.map(name => prisma.permission.create({ data: { name } }))
  );

  // Crear roles y asignar permisos
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      permissions: {
        connect: createdPermissions.map(p => ({ id: p.id }))
      }
    },
  });

  const supervisorRole = await prisma.role.create({
    data: {
      name: 'SUPERVISOR',
      permissions: {
        connect: createdPermissions.filter(p =>
          ['view_order', 'assign_worker', 'update_order_status', 'manage_orders', 'create_visit'].includes(p.name)
        ).map(p => ({ id: p.id }))
      }
    },
  });

  const technicianRole = await prisma.role.create({
    data: {
      name: 'TECHNICIAN',
      permissions: {
        connect: createdPermissions.filter(p =>
          ['view_order', 'complete_order', 'evaluate_visit', 'view_visit'].includes(p.name)
        ).map(p => ({ id: p.id }))
      }
    },
  });

  // Crear usuarios
  const users = [
    {
      dni: '12345678',
      username: 'adminuser',
      email: 'admin@empresa.com',
      password: 'adminpassword',
      firstName: 'Ana',
      lastName: 'Gómez',
      phone: '555123456',
      roleId: adminRole.id
    },
    {
      dni: '23456789',
      username: 'supervisoruser',
      email: 'supervisor@empresa.com',
      password: 'supervisorpassword',
      firstName: 'Luis',
      lastName: 'Martínez',
      phone: '555234567',
      roleId: supervisorRole.id
    },
    {
      dni: '34567891',
      username: 'techuser',
      email: 'tech@empresa.com',
      password: 'techpassword',
      firstName: 'Carlos',
      lastName: 'Pérez',
      phone: '555345678',
      roleId: technicianRole.id
    }
  ];

  const createdUsers = await prisma.$transaction(
    users.map(user => prisma.user.create({ data: user }))
  );

  const techUser = createdUsers.find(u => u.roleId === technicianRole.id);
  const adminUser = createdUsers.find(u => u.roleId === adminRole.id);

  // Asignar disponibilidad a técnicos
  if (techUser) {
    await prisma.availability.createMany({
      data: [
        {
          userId: techUser.dni,
          startDate: new Date('2025-05-01T08:00:00Z'),
          endDate: new Date('2025-05-01T17:00:00Z'),
          type: 'full-time'
        },
        {
          userId: techUser.dni,
          startDate: new Date('2025-05-02T08:00:00Z'),
          endDate: new Date('2025-05-02T17:00:00Z'),
          type: 'full-time'
        }
      ]
    });
  }

  // Crear clientes
  const clients = [
    {
      dni: '99999999',
      name: 'Mónica Campos',
      email: 'monica@empresa.com',
      phone: '555123456',
      address: 'Calle Ficticia 123'
    },
    {
      dni: '88888888',
      name: 'Fernando Torres',
      email: 'fernando@empresa.com',
      phone: '555987654',
      address: 'Avenida Imaginaria 456'
    }
  ];
  await prisma.client.createMany({ data: clients });

  // Crear servicios
  const services = [
    {
      name: 'Instalación Eléctrica',
      description: 'Instalación de sistemas eléctricos.',
      price: 150.00,
      status: 'ACTIVE'
    },
    // Seguridad electrónica
    {
      name: 'Instalación de Cámaras de Seguridad',
      description: 'Colocación y configuración de cámaras de vigilancia.',
      price: 300.00,
      status: 'ACTIVE'
    },
    {
      name: 'Monitoreo Remoto',
      description: 'Supervisión en tiempo real desde central de seguridad.',
      price: 250.00,
      status: 'ACTIVE'
    },
    {
      name: 'Control de Accesos',
      description: 'Instalación de sistemas biométricos o tarjetas.',
      price: 400.00,
      status: 'ACTIVE'
    },
    // Telecomunicaciones
    {
      name: 'Instalación de Red LAN',
      description: 'Diseño y montaje de red de datos estructurada.',
      price: 350.00,
      status: 'ACTIVE'
    },
    {
      name: 'Configuración de Router y WiFi',
      description: 'Optimización y seguridad de redes inalámbricas.',
      price: 150.00,
      status: 'ACTIVE'
    },
    {
      name: 'Mantenimiento de Redes',
      description: 'Chequeo, limpieza y pruebas de rendimiento.',
      price: 180.00,
      status: 'ACTIVE'
    }
  ];
  await prisma.service.createMany({ data: services });

  // Crear una orden de prueba
  const testOrder = await prisma.order.create({
    data: {
      description: 'Instalación completa de red LAN y sistema de cámaras.',
      status: 'IN_PROGRESS',
      clientId: '99999999',
      userId: adminUser.dni, // gestionada por el admin
      services: {
        connect: [
          { id: 1 }, // Cámaras
          { id: 4 }  // Red LAN
        ]
      }
    }
  });

  // Asignar técnico a la orden
  await prisma.orderWorker.create({
    data: {
      orderId: testOrder.id,
      userId: techUser.dni,
      status: 'IN_PROGRESS'
    }
  });

  // Crear una visita asociada a la orden
  const visit = await prisma.visit.create({
    data: {
      date: new Date('2025-05-01T09:00:00Z'),
      endTime: new Date('2025-05-01T13:00:00Z'),
      description: 'Instalación inicial y pruebas de red.',
      orderId: testOrder.id,
      userId: techUser.dni,
      clientId: '99999999',
      evaluation: 4.7
    }
  });

  // Crear conformidad asociada
  await prisma.conformity.create({
    data: {
      orderId: testOrder.id,
      userId: techUser.dni,
      description: 'Todo instalado y verificado por el cliente.'
    }
  });

  console.log('Base de datos inicializada con éxito!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
