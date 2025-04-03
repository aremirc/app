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
    prisma.worker.deleteMany({}),
    prisma.service.deleteMany({}),
    prisma.client.deleteMany({}),
    prisma.user.deleteMany({}),
    prisma.role.deleteMany({}),
    prisma.permission.deleteMany({})
  ]);

  console.log('Base de datos vaciada con éxito!');

  // Crear permisos
  const permissions = [
    'create_user', 'edit_user', 'delete_user', 'view_user',
    'create_client', 'edit_client', 'delete_client', 'view_client',
    'create_order', 'edit_order', 'delete_order', 'view_order',
    'assign_order', 'update_order_status', 'complete_order',
    'create_service', 'edit_service', 'delete_service', 'view_service',
    'create_visit', 'edit_visit', 'delete_visit', 'view_visit',
    'create_worker', 'edit_worker', 'delete_worker', 'view_worker',
    'manage_availability', 'approve_conformity', 'reject_conformity'
  ];

  const createdPermissions = await prisma.$transaction(
    permissions.map(name => prisma.permission.create({ data: { name } }))
  );

  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      permissions: { connect: createdPermissions.map(p => ({ id: p.id })) }
    },
  });

  const moderatorRole = await prisma.role.create({
    data: {
      name: 'Moderador',
      permissions: { connect: createdPermissions.filter(p => ['view_order', 'update_order_status', 'create_visit'].includes(p.name)).map(p => ({ id: p.id })) }
    },
  });

  const workerRole = await prisma.role.create({
    data: {
      name: 'Worker',
      permissions: { connect: createdPermissions.filter(p => ['view_order', 'complete_order'].includes(p.name)).map(p => ({ id: p.id })) }
    },
  });

  // Crear usuarios
  const users = [
    { dni: '12345678', username: 'adminuser', email: 'admin@empresa.com', password: 'adminpassword', roleId: adminRole.id },
    { dni: '23456789', username: 'moderatoruser', email: 'moderator@empresa.com', password: 'moderatorpassword', roleId: moderatorRole.id },
    { dni: '34567891', username: 'workeruser', email: 'worker@empresa.com', password: 'workerpassword', roleId: workerRole.id }
  ];

  const createdUsers = await prisma.$transaction(users.map(user => prisma.user.create({ data: user })));

  // Crear trabajadores solo para usuarios que no sean admins
  const createdWorkers = await prisma.$transaction(
    createdUsers.filter(user => user.roleId !== adminRole.id).map(user =>
      prisma.worker.create({
        data: {
          dni: user.dni,
          firstName: 'Nombre' + user.username,
          lastName: 'Apellido' + user.username,
          email: user.email,
          phone: '555' + user.dni,
        },
      })
    )
  );

  // Crear clientes
  const clients = [
    { dni: '99999999', name: 'Mónica Campos', email: 'monica@empresa.com', phone: '555123456', address: 'Calle Ficticia 123' },
    { dni: '88888888', name: 'Fernando Torres', email: 'fernando@empresa.com', phone: '555987654', address: 'Avenida Imaginaria 456' }
  ];
  await prisma.client.createMany({ data: clients });

  // Crear servicios incluyendo seguridad electrónica
  const services = [
    { name: 'Instalación Eléctrica', description: 'Instalación de sistemas eléctricos.', price: 150.00 },
    { name: 'Mantenimiento HVAC', description: 'Mantenimiento de sistemas HVAC.', price: 200.00 },
    { name: 'Instalación de Cámaras de Seguridad', description: 'Colocación y configuración de cámaras de seguridad.', price: 300.00 },
    { name: 'Monitoreo Remoto', description: 'Supervisión de seguridad en tiempo real.', price: 250.00 },
    { name: 'Control de Accesos', description: 'Instalación y configuración de sistemas de acceso biométrico.', price: 400.00 }
  ];
  await prisma.service.createMany({ data: services });

  console.log('Base de datos inicializada con éxito!');
}

main()
  .catch(e => { console.error(e); throw e; })
  .finally(async () => { await prisma.$disconnect(); });