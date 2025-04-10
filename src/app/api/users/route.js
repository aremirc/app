
// import connectToDatabase from '../../../lib/db';

// export async function GET(req) {
//   try {
//     const client = await connectToDatabase();

//     // Realiza la consulta SQL
//     const result = await client.query('SELECT * FROM usuarios');
//     client.release();  // Libera el cliente del pool después de la consulta

//     // Devuelve los datos en formato JSON
//     return new Response(JSON.stringify(result.rows), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('Error al obtener usuarios:', error);
//     return new Response(JSON.stringify({ error: 'Error en la base de datos' }), {
//       status: 500,
//     });
//   }
// }

// Next steps:
// 1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started
// 2. Set the provider of the datasource block in schema.prisma to match your database: postgresql, mysql, sqlite, sqlserver, mongodb or cockroachdb.
// 3. Run prisma db pull to turn your database schema into a Prisma schema.
// 4. Run prisma generate to generate the Prisma Client. You can then start querying your database.
// 5. Tip: Explore how you can extend the ORM with scalable connection pooling, global caching, and real-time database events. Read: https://pris.ly/cli/beyond-orm   

import { NextResponse } from 'next/server'; // Importar NextResponse
import { verifyAndLimit } from '@/lib/permissions'; // Importar la función para verificar permisos
import { verifyCsrfToken } from '@/lib/csrf';
import prisma from '@/lib/prisma';  // Importar la instancia de Prisma
import bcrypt from 'bcrypt';

// Obtener todos los usuarios con roles
export async function GET(req) {
  const authResponse = await verifyAndLimit(req, 'Admin');
  if (authResponse) {
    return authResponse;  // Si no tiene permisos, devolver respuesta con error 403
  }

  try {
    // Obtener los usuarios con los datos mínimos
    const users = await prisma.user.findMany({
      select: {
        dni: true,
        username: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 });
  }
}

// Crear un nuevo usuario con validación optimizada
export async function POST(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req);

  const authResponse = await verifyAndLimit(req, 'Admin');
  if (authResponse) {
    return authResponse;  // Si no tiene permisos, devolver respuesta con error 403
  }

  try {
    const { dni, username, email, password, roleId } = await req.json();

    // Validaciones de campos
    if (!dni || !username || !email || !password || !roleId) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    // Verificar formato del correo electrónico
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Correo electrónico no válido' }, { status: 400 });
    }

    // Verificar existencia de usuario
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }, { dni }],
      },
    });

    if (existingUser) {
      const errorMessages = [];
      if (existingUser.email === email) errorMessages.push('El correo electrónico ya está registrado');
      if (existingUser.username === username) errorMessages.push('El nombre de usuario ya está registrado');
      if (existingUser.dni === dni) errorMessages.push('El DNI ya está registrado');

      return NextResponse.json({ error: errorMessages.join(', ') }, { status: 400 });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar rol
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return NextResponse.json({ error: 'Rol no válido' }, { status: 400 });
    }

    // Crear usuario
    const userData = await prisma.user.create({
      data: {
        dni,
        username,
        email,
        password: hashedPassword,
        roleId,
      },
    });

    // Responder con los datos del nuevo usuario (sin la contraseña)
    // const { password: _, ...userData } = userData;
    return NextResponse.json(userData, { status: 201 });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    return NextResponse.json({ error: 'Error al crear el usuario' }, { status: 500 });
  }
}

// Actualizar un usuario (requiere rol "Admin")
export async function PUT(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req);

  const authResponse = await verifyAndLimit(req, 'Admin');
  if (authResponse) {
    return authResponse; // Si no tiene permisos, devolver error 403
  }

  try {
    // Leer el cuerpo de la solicitud
    const { dni, username, email, password, roleId } = await req.json();

    // Validar que el ID esté presente
    if (!dni) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { dni },
    });
    if (!existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Validaciones básicas
    if (!dni || !username || !email || !roleId) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    // Validación del formato del correo electrónico
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Correo electrónico no válido' }, { status: 400 });
    }

    // Validación del formato del DNI
    if (!/^\d{8}$/.test(dni)) {
      return NextResponse.json({ error: 'DNI no válido. Debe contener 8 dígitos' }, { status: 400 });
    }

    // Validación de la contraseña
    if (password && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres, con letras y números' }, { status: 400 });
    }

    // Verificar si el rol existe
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return NextResponse.json({ error: 'Rol no válido' }, { status: 400 });
    }

    // Hashear la nueva contraseña si se proporciona
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { dni },
      data: {
        username,
        email,
        password: hashedPassword || existingUser.password, // Si no hay nueva contraseña, mantenemos la existente
        roleId,
      },
    });

    // Excluir la contraseña del resultado
    // const { password: _, ...updatedUser } = updatedUser;
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    return NextResponse.json({ error: 'Error al actualizar el usuario' }, { status: 500 });
  }
}

// Eliminar un usuario (requiere rol "Admin")
export async function DELETE(req) {
  // Verificar el token CSRF
  verifyCsrfToken(req);

  const authResponse = await verifyAndLimit(req, 'Admin');
  if (authResponse) {
    return authResponse; // Si no tiene permisos, devolver error 403
  }

  try {
    // Leer el cuerpo de la solicitud
    const { dni } = await req.json();

    // Validar que el ID esté presente
    if (!dni) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { dni },
    });
    if (!existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Eliminar el usuario
    await prisma.user.delete({
      where: { dni },
    });

    return NextResponse.json({ message: 'Usuario eliminado' }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    return NextResponse.json({ error: 'Error al eliminar el usuario' }, { status: 500 });
  }
}
