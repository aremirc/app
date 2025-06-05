import bcrypt from 'bcrypt'
import prisma from './src/lib/prisma.js'

async function main() {
  // 1. Limpieza de base de datos (en orden correcto para respetar relaciones)
  await prisma.$transaction([
    prisma.notification.deleteMany({}),
    prisma.evidence.deleteMany({}),
    prisma.visit.deleteMany({}),
    prisma.orderWorker.deleteMany({}),
    prisma.conformity.deleteMany({}),
    prisma.availability.deleteMany({}),
    prisma.toolAssignment.deleteMany({}),
    prisma.tool.deleteMany({}),
    prisma.location.deleteMany({}),
    prisma.service.deleteMany({}),
    prisma.order.deleteMany({}),
    prisma.client.deleteMany({}),
    prisma.user.deleteMany({}),
    prisma.role.deleteMany({}),
    prisma.permission.deleteMany({}),
  ])
  console.log('Base de datos vaciada con éxito!')

  // 2. Permisos
  const permissions = [
    // 👤 Usuarios
    'create_user', 'edit_user', 'delete_user', 'view_user', 'verify_user',

    // 👥 Clientes
    'create_client', 'edit_client', 'delete_client', 'view_client',

    // 🧾 Órdenes
    'create_order', 'edit_order', 'delete_order', 'view_order',
    'assign_order', 'update_order_status', 'complete_order', 'manage_orders',

    // 💼 Servicios
    'create_service', 'edit_service', 'delete_service', 'view_service',

    // 📅 Visitas
    'create_visit', 'edit_visit', 'delete_visit', 'view_visit', 'evaluate_visit',

    // 🛠️ Herramientas
    'create_tool', 'edit_tool', 'delete_tool', 'view_tool', 'assign_tool',

    // 🧰 Asignación de herramientas
    'create_tool_assignment', 'delete_tool_assignment', 'view_tool_assignment',

    // 📍 Ubicaciones
    'create_location', 'edit_location', 'delete_location', 'view_location',

    // 📸 Evidencias
    'upload_evidence', 'delete_evidence', 'view_evidence',

    // 🗓️ Disponibilidad
    'manage_availability',

    // ✅ Conformidades
    'approve_conformity', 'reject_conformity', 'view_conformity',

    // 👷 Trabajadores en órdenes
    'assign_worker', 'remove_worker', 'update_worker_status', 'view_worker',

    // 🔔 Notificaciones
    'view_notifications', 'send_notification',

    // 📊 Reportes y análisis
    'view_reports', 'generate_reports', 'export_reports', 'view_statistics', 'view_dashboard',

    // ⚙️ Sistema
    'reset_database', 'view_logs', 'manage_settings'
  ]

  const createdPermissions = await prisma.$transaction(
    permissions.map(name => prisma.permission.create({ data: { name } }))
  )

  // 3. Roles
  const [adminRole, supervisorRole, technicianRole] = await Promise.all([
    // 👑 ADMIN: Acceso total
    prisma.role.create({
      data: {
        name: 'ADMIN',
        description: "Administrator with full access",
        permissions: {
          connect: createdPermissions.map(p => ({ id: p.id }))
        }
      }
    }),

    // 🧭 SUPERVISOR: Gestión de órdenes, trabajadores, visitas
    prisma.role.create({
      data: {
        name: 'SUPERVISOR',
        permissions: {
          connect: createdPermissions.filter(p =>
            [
              'view_user', 'view_client',
              'create_order', 'edit_order', 'delete_order', 'view_order',
              'assign_order', 'update_order_status', 'manage_orders',
              'assign_worker', 'remove_worker', 'update_worker_status', 'view_worker',
              'create_visit', 'edit_visit', 'delete_visit', 'view_visit',
              'view_conformity',
              'view_notifications', 'send_notification'
            ].includes(p.name)
          ).map(p => ({ id: p.id }))
        }
      }
    }),

    // 🧑‍🔧 TECHNICIAN: Ejecución de órdenes y evidencias
    prisma.role.create({
      data: {
        name: 'TECHNICIAN',
        description: "Technician with limited access",
        permissions: {
          connect: createdPermissions.filter(p =>
            [
              'view_order', 'complete_order',
              'view_visit', 'evaluate_visit',
              'upload_evidence', 'view_evidence',
              'view_tool', 'assign_tool', 'view_tool_assignment',
              'view_conformity',
              'view_worker',
              'manage_availability',
              'view_notifications'
            ].includes(p.name)
          ).map(p => ({ id: p.id }))
        }
      }
    })
  ])

  // 4. Usuarios
  const users = [
    {
      dni: '12345678',
      firstName: 'Ana',
      lastName: 'Gómez',
      username: 'adminuser',
      email: 'admin@empresa.com',
      password: await bcrypt.hash('adminpassword', 12),
      phone: '555123456',
      gender: 'FEMALE',
      status: 'ACTIVE',
      roleId: adminRole.id,
      isVerified: true,
      country: 'Perú',
      avatar: 'https://example.com/avatar.png'
    },
    {
      dni: '23456789',
      firstName: 'Luis',
      lastName: 'Martínez',
      username: 'supervisoruser',
      email: 'supervisor@empresa.com',
      password: await bcrypt.hash('supervisorpassword', 12),
      phone: '555234567',
      gender: 'MALE',
      status: 'ACTIVE',
      roleId: supervisorRole.id,
      isVerified: true,
      country: 'Perú',
      avatar: 'https://example.com/avatar.png'
    },
    {
      dni: '34567891',
      firstName: 'Carlos',
      lastName: 'Pérez',
      username: 'techuser',
      email: 'tech@empresa.com',
      password: await bcrypt.hash('techpassword', 12),
      phone: '555345678',
      gender: 'MALE',
      status: 'ACTIVE',
      roleId: technicianRole.id,
      isVerified: true,
      country: 'Perú',
      avatar: 'https://img.freepik.com/premium-photo/beautiful-realistic-portrait-young-construction-worker-white-background-panoramic-banner_908985-7725.jpg'
    },
    {
      dni: '45678912',
      firstName: 'Jane',
      lastName: 'Suárez',
      username: 'jane.tech',
      email: 'jane.tech@empresa.com',
      password: await bcrypt.hash('techpassword', 12),
      phone: '555456789',
      gender: 'FEMALE',
      status: 'ACTIVE',
      roleId: technicianRole.id,
      isVerified: true,
      country: 'Perú',
      avatar: 'https://www.unimechgroup.com/image/catalog/images/profile_img.jpg'
    }
  ]

  const createdUsers = await prisma.$transaction(
    users.map(user => prisma.user.create({ data: user }))
  )

  const techUsers = createdUsers.filter(u => u.roleId === technicianRole.id)
  const supervisorUser = createdUsers.find(u => u.roleId === supervisorRole.id)
  const adminUser = createdUsers.find(u => u.roleId === adminRole.id)

  const [techUser1, techUser2] = techUsers

  // 5. Disponibilidad
  await prisma.availability.create({
    data: {
      userId: techUser1.dni,
      startDate: new Date('2025-05-01T08:00:00Z'),
      endDate: new Date('2025-12-31T17:00:00Z'),
      type: 'FULL_TIME'
    }
  })

  await prisma.availability.create({
    data: {
      userId: techUser2.dni,
      startDate: new Date('2025-05-01T08:00:00Z'),
      endDate: new Date('2025-12-31T17:00:00Z'),
      type: 'FULL_TIME'
    }
  })

  // 6. Clientes
  await prisma.client.createMany({
    data: [
      {
        id: '99999999',
        name: 'Mónica Campos',
        email: 'monica@example.com',
        type: "INDIVIDUAL",
        phone: '555123456',
        address: 'Calle Ficticia 123',
        isActive: true,
      },
      {
        id: '88888888',
        name: 'John Torres',
        email: 'john@example.com',
        type: "INDIVIDUAL",
        phone: '555987654',
        address: 'Avenida Imaginaria 456',
        isActive: true,
      },
      {
        id: '77777777777',
        name: 'ACME Corporation',
        email: 'contact@acme.com',
        type: "COMPANY",
        phone: '555765432',
        address: 'Avenida Imaginaria 456',
        contactPersonName: "Alice Manager",
        contactPersonPhone: "555-333-444",
        isActive: true,
      }
    ]
  })

  // 7. Servicios
  const services = await prisma.$transaction([
    prisma.service.create({ data: { name: 'Instalación Eléctrica', description: 'Instalación de sistemas eléctricos.', price: 150, status: 'ACTIVE' } }),
    prisma.service.create({ data: { name: 'Instalación de Cámaras de Seguridad', description: 'Configuración de cámaras.', price: 300, status: 'ACTIVE' } }),
    prisma.service.create({ data: { name: 'Monitoreo Remoto', description: 'Supervisión remota.', price: 250, status: 'ACTIVE' } }),
    prisma.service.create({ data: { name: 'Control de Accesos', description: 'Sistemas biométricos.', price: 400, status: 'ACTIVE' } }),
    prisma.service.create({ data: { name: 'Instalación de Red LAN', description: 'Red de datos estructurada.', price: 350, status: 'ACTIVE' } }),
    prisma.service.create({ data: { name: 'Configuración de Router y WiFi', description: 'Redes inalámbricas.', price: 150, status: 'ACTIVE' } }),
    prisma.service.create({ data: { name: 'Mantenimiento de Redes', description: 'Chequeo y pruebas.', price: 180, status: 'ACTIVE' } }),
    prisma.service.create({ data: { name: 'Instalación de Sistema de Seguridad Electrónica', description: 'Configuración de panel y sensores.', price: 450, status: 'ACTIVE' } })
  ])

  // 8. Herramientas
  const [drill, tester] = await prisma.$transaction([
    prisma.tool.create({ data: { name: 'Taladro', description: 'Taladro percutor inalámbrico', status: 'AVAILABLE' } }),
    prisma.tool.create({ data: { name: 'Tester de Red', description: 'Probador de cables LAN', status: 'AVAILABLE' } })
  ])

  // 9. Orden
  const testOrder = await prisma.order.create({
    data: {
      description: 'Instalación de red LAN y cámaras en ACME HQ.',
      scheduledDate: new Date('2025-05-20T08:00:00Z'),
      status: 'PENDING',
      clientId: '77777777777',
      createdBy: adminUser.dni,
      services: {
        connect: services.filter(s =>
          ['Instalación de Cámaras de Seguridad', 'Instalación de Red LAN'].includes(s.name)
        ).map(s => ({ id: s.id }))
      },
      locations: {
        create: [
          {
            latitude: 40.7128,
            longitude: -74.006,
            label: "ACME HQ",
            createdBy: adminUser.dni,
          },
        ],
      }
    }
  })

  // 10. Asignación de técnico
  await prisma.orderWorker.create({
    data: {
      orderId: testOrder.id,
      userId: techUser1.dni,
      status: 'ASSIGNED',
      isResponsible: true
    }
  })

  await prisma.orderWorker.create({
    data: {
      orderId: testOrder.id,
      userId: techUser2.dni,
      status: 'ASSIGNED'
    }
  })

  // 11. Asignación de herramientas
  await prisma.toolAssignment.createMany({
    data: [
      { toolId: drill.id, orderId: testOrder.id, usedAt: new Date('2025-05-21T09:00:00Z'), createdBy: adminUser.dni },
      { toolId: tester.id, orderId: testOrder.id, usedAt: new Date('2025-05-21T09:00:00Z'), createdBy: adminUser.dni }
    ]
  })

  // 12. Ubicación
  await prisma.location.create({
    data: {
      latitude: -34.6037,
      longitude: -58.3816,
      label: 'Tech Solutions HQ',
      orderId: testOrder.id,
      createdBy: adminUser.dni
    }
  })

  // 13. Visita
  const visit = await prisma.visit.create({
    data: {
      date: new Date('2025-05-21T09:00:00Z'),
      endTime: new Date('2025-05-21T13:00:00Z'),
      description: 'Instalación y pruebas de red en Tech Solutions HQ.',
      orderId: testOrder.id,
      userId: techUser1.dni,
      clientId: '77777777777',
      evaluation: 4.5,
      createdBy: adminUser.dni,
    }
  })

  // 14. Evidencias
  await prisma.evidence.createMany({
    data: [
      {
        visitId: visit.id,
        type: 'PHOTO',
        url: 'https://example.com/foto1.jpg',
        comment: 'Rack de red instalado',
        createdBy: adminUser.dni
      },
      {
        visitId: visit.id,
        type: 'PHOTO',
        url: 'https://example.com/foto2.jpg',
        comment: 'Cámara en entrada principal',
        createdBy: adminUser.dni
      }
    ]
  })

  // 15. Conformidad
  await prisma.conformity.create({
    data: {
      orderId: testOrder.id,
      userId: supervisorUser.dni,
      description: 'Todo instalado y verificado por el cliente.',
      accepted: true,
      rating: 4.5,
      feedback: '',
      conformityDate: new Date("2025-06-02T15:00:00Z"),
      createdBy: adminUser.dni
    }
  })

  // 16. Notificaciones
  await prisma.notification.createMany({
    data: [
      {
        userId: techUser1.dni,
        type: 'PENDING_TASK',
        title: 'Tarea asignada',
        message: 'Tienes una nueva orden asignada.'
      },
      {
        userId: techUser2.dni,
        type: 'PENDING_TASK',
        title: 'Tarea asignada',
        message: 'Tienes una nueva orden asignada.'
      },
      {
        userId: adminUser.dni,
        type: 'SYSTEM_ALERT',
        title: 'Sistema reiniciado',
        message: 'El sistema fue reiniciado correctamente.'
      }
    ]
  })

  console.log('✅ Base de datos inicializada con éxito!')
}

main()
  .catch(e => {
    console.error('❌ Error al inicializar la base de datos:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })