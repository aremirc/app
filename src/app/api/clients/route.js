import prisma from '@/lib/prisma';
import { verifyCsrfToken } from '@/lib/csrf';
import { verifyAndLimit } from '@/lib/permissions'; // Importar la función de permisos
import { NextResponse } from 'next/server'; // Importar NextResponse

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

    return NextResponse.json(clients, { status: 200 }); // Usar NextResponse.json()
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 });
  }
}

// Crear un nuevo cliente
export async function POST(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req);

  const authResponse = await verifyAndLimit(req, "Admin");  // Asegurarse de que el usuario sea un Admin
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { dni, name, email, phone, address } = await req.json();

    // Validaciones básicas
    if (!dni || !name || !email) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, {
        status: 400, // Bad request
      });
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Correo electrónico no válido' }, {
        status: 400,
      });
    }

    // Validación del formato del DNI (Ejemplo simple, depende del formato de tu país)
    if (!/^\d{8}$/.test(dni)) {
      return NextResponse.json({ error: 'DNI no válido. Debe contener 8 dígitos' }, {
        status: 400,
      });
    }

    // Verificar si el correo electrónico ya está registrado
    const existingClientEmail = await prisma.client.findUnique({
      where: { email },
    });
    if (existingClientEmail) {
      return NextResponse.json({ error: 'El correo electrónico ya está registrado' }, {
        status: 400,
      });
    }

    // Verificar si el DNI ya está registrado
    const existingClientDNI = await prisma.client.findUnique({
      where: { dni },
    });
    if (existingClientDNI) {
      return NextResponse.json({ error: 'El DNI ya está registrado' }, {
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
    // const { dni: _, ...newClient } = newClient;
    return NextResponse.json(newClient, { status: 201 }); // Crear respuesta con estado 201
  } catch (error) {
    console.error('Error al crear el cliente:', error);
    return NextResponse.json({ error: 'Error al crear el cliente' }, {
      status: 500, // Error en el servidor
    });
  }
}

// Actualizar un cliente existente
export async function PUT(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req);

  const authResponse = await verifyAndLimit(req, "Admin");  // Asegurarse de que el usuario sea un Admin
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { dni, name, email, phone, address } = await req.json();

    // Validar que el DNI esté presente
    if (!dni) {
      return NextResponse.json({ error: 'DNI es requerido' }, {
        status: 400, // Bad request
      });
    }

    // Verificar si el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { dni },
    });
    if (!existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, {
        status: 404, // Not found
      });
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (email && !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Correo electrónico no válido' }, {
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

    return NextResponse.json(updatedClient, { status: 200 }); // Respuesta OK
  } catch (error) {
    console.error('Error al actualizar el cliente:', error);
    return NextResponse.json({ error: 'Error al actualizar el cliente' }, {
      status: 500, // Error en el servidor
    });
  }
}

// Eliminar un cliente
export async function DELETE(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req);

  const authResponse = await verifyAndLimit(req, "Admin");  // Asegurarse de que el usuario sea un Admin
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Leer el cuerpo de la solicitud
    const { dni } = await req.json();

    // Validar que el DNI esté presente
    if (!dni) {
      return NextResponse.json({ error: 'DNI es requerido' }, {
        status: 400, // Bad request
      });
    }

    // Verificar si el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { dni },
    });
    if (!existingClient) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, {
        status: 404, // Not found
      });
    }

    // Eliminar el cliente
    await prisma.client.delete({
      where: { dni },
    });

    return NextResponse.json({ message: 'Cliente eliminado con éxito' }, { status: 200 }); // Respuesta OK
  } catch (error) {
    console.error('Error al eliminar el cliente:', error);
    return NextResponse.json({ error: 'Error al eliminar el cliente' }, {
      status: 500, // Error en el servidor
    });
  }
}
