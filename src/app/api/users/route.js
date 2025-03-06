
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

import bcrypt from 'bcrypt';
import { verifyJWT } from '../login/route';
import { rateLimit } from '@/lib/rateLimiter';
import prisma from '@/lib/prisma';

// Función para verificar JWT, el rol y aplicar Rate Limiting
async function verifyAndLimit(req, requiredRole = null) {
  // Verificar el token JWT
  const user = await verifyJWT(req);
  if (user instanceof Response) {
    return user; // Si hay un error con el token, devolver respuesta de error // Si el token es inválido, retornar error 401
  }

  // Aplicar Rate Limiting
  const rateLimitResponse = await rateLimit(req);
  if (rateLimitResponse) {
    return rateLimitResponse; // Si el límite se excede, devolver la respuesta 429
  }

  // Verificar rol si se requiere un rol específico
  if (requiredRole) {
    const userRole = await prisma.role.findUnique({
      where: { id: user.roleId },
    });
    if (!userRole || userRole.name !== requiredRole) {
      return new Response(JSON.stringify({ error: `No tienes permisos para realizar esta acción` }), {
        status: 403, // Forbidden
      });
    }
  }

  return null; // Si todo es correcto, no se retorna nada
}

// Obtener todos los usuarios
export async function GET(req) {
  const authResponse = await verifyAndLimit(req, 'Admin');
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o rate limit, devolver respuesta correspondiente
  }

  try {
    // Obtener todos los usuarios
    const users = await prisma.user.findMany();
    console.log(users);

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return new Response(JSON.stringify({ error: 'Error en la base de datos' }), {
      status: 500,
    });
  }
}

// Crear un nuevo usuario (requiere rol "Admin")
export async function POST(req) {
  const authResponse = await verifyAndLimit(req, 'Admin');
  if (authResponse) {
    return authResponse; // Si hay un error de autenticación o limitación, devolver respuesta correspondiente
  }

  try {    
    // Leer el cuerpo de la solicitud
    const { dni, username, email, password, roleId } = await req.json();

    // Validaciones básicas
    if (!dni || !username || !email || !password || !roleId) {
      return new Response(JSON.stringify({ error: 'Todos los campos son requeridos' }), {
        status: 400, // Bad request
      });
    }

    // Validación del formato del correo electrónico
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Correo electrónico no válido' }), {
        status: 400,
      });
    }

    // Validación del formato del DNI (Ejemplo simple, depende del formato de tu país)
    if (!/^\d{8}$/.test(dni)) {
      return new Response(JSON.stringify({ error: 'DNI no válido. Debe contener 8 dígitos' }), {
        status: 400,
      });
    }

    // Validación de la contraseña (al menos 8 caracteres, con letras y números)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return new Response(JSON.stringify({ error: 'La contraseña debe tener al menos 8 caracteres, con letras y números' }), {
        status: 400,
      });
    }

    // Verificar si el rol existe en la base de datos
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return new Response(
        JSON.stringify({ message: 'Invalid roleId' }),
        { status: 400 }
      );
    }

    // Verificar si el correo electrónico o el nombre de usuario ya están registrados
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username },
          { dni: dni }, // Verificar si el DNI ya está en la base de datos
        ],
      },
    });

    if (existingUser) {
      const errorMessages = [];
      if (existingUser.email === email) errorMessages.push('El correo electrónico ya está registrado');
      if (existingUser.username === username) errorMessages.push('El nombre de usuario ya está registrado');
      if (existingUser.dni === dni) errorMessages.push('El DNI ya está registrado');

      return new Response(JSON.stringify({ error: errorMessages.join(', ') }), {
        status: 400,
      });
    }

    // Hashear la contraseña antes de almacenarla
    const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

    // Crear el nuevo usuario
    const userData = await prisma.user.create({
      data: {
        dni,
        username,
        email,
        password: hashedPassword, // Guardamos la contraseña hasheada
        roleId, // Asegúrate de que el roleId es válido (ver más abajo)
      },
    });

    // Responder con los datos del nuevo usuario (sin la contraseña)
    // const { password: _, ...userData } = userData;
    return new Response(JSON.stringify(userData), {
      status: 201, // Creado con éxito
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    return new Response(JSON.stringify({ error: 'Error al crear el usuario' }), {
      status: 500, // Error en el servidor
    });
  }
}

// Actualizar un usuario (requiere rol "Admin")
export async function PUT(req) {
  const authResponse = await verifyAndLimit(req, 'Admin');
  if (authResponse) {
    return authResponse; // Si no tiene permisos, devolver error 403
  }

  try {
    // Leer el cuerpo de la solicitud
    const { dni, username, email, password, roleId } = await req.json();

    // Validar que el ID esté presente
    if (!dni) {
      return new Response(JSON.stringify({ error: 'ID es requerido' }), {
        status: 400, // Bad request
      });
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { dni },
    });
    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), {
        status: 404, // Not found
      });
    }

    // Validaciones básicas
    if (!dni || !username || !email || !roleId) {
      return new Response(JSON.stringify({ error: 'Todos los campos son requeridos' }), {
        status: 400, // Bad request
      });
    }

    // Validación del formato del correo electrónico
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Correo electrónico no válido' }), {
        status: 400,
      });
    }

    // Validación del formato del DNI
    if (!/^\d{8}$/.test(dni)) {
      return new Response(JSON.stringify({ error: 'DNI no válido. Debe contener 8 dígitos' }), {
        status: 400,
      });
    }

    // Validación de la contraseña
    if (password && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
      return new Response(JSON.stringify({ error: 'La contraseña debe tener al menos 8 caracteres, con letras y números' }), {
        status: 400,
      });
    }

    // Verificar si el rol existe
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return new Response(
        JSON.stringify({ error: 'Rol no válido' }),
        { status: 400 }
      );
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
    // const { password: _, ...userData } = updatedUser;
    return new Response(JSON.stringify(updatedUser), {
      status: 200, // OK
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar el usuario' }), {
      status: 500, // Error en el servidor
    });
  }
}

// Eliminar un usuario (requiere rol "Admin")
export async function DELETE(req) {
  const authResponse = await verifyAndLimit(req, 'Admin');
  if (authResponse) {
    return authResponse; // Si no tiene permisos, devolver error 403
  }

  try {
    // Leer el cuerpo de la solicitud
    const { dni } = await req.json();

    // Validar que el ID esté presente
    if (!dni) {
      return new Response(JSON.stringify({ error: 'ID es requerido' }), {
        status: 400, // Bad request
      });
    }

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { dni },
    });
    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), {
        status: 404, // Not found
      });
    }

    // Eliminar el usuario
    await prisma.user.delete({
      where: { dni },
    });

    return new Response(JSON.stringify({ message: 'Usuario eliminado' }), {
      status: 200, // OK
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar el usuario' }), {
      status: 500, // Error en el servidor
    });
  }
}
