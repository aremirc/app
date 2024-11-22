import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from '@/lib/prisma';

dotenv.config(); // Cargar las variables de entorno

export async function POST(req) {
  try {
    const { usernameOrEmail, password } = await req.json();

    // Validar que ambos campos están presentes
    if (!usernameOrEmail || !password) {
      return new Response(
        JSON.stringify({ error: 'Nombre de usuario o correo electrónico y contraseña son requeridos' }),
        { status: 400 }
      );
    }

    // Buscar el usuario por nombre de usuario o correo electrónico
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: usernameOrEmail },
          { username: usernameOrEmail },
        ],
      },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Credenciales incorrectas' }),
        { status: 401 }
      );
    }

    // Verificar la contraseña
    const isPasswordValid = await (password === user.password || bcrypt.compare(password, user.password));
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ error: 'Credenciales incorrectas' }),
        { status: 401 }
      );
    }

    // Verificar si las variables de entorno están definidas
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiration = process.env.JWT_EXPIRATION;

    if (!jwtSecret || !jwtExpiration) {
      return new Response(
        JSON.stringify({ error: 'Falta configuración en las variables de entorno' }),
        { status: 500 }
      );
    }

    // Generar un JWT
    const token = jwt.sign(
      { dni: user.dni, username: user.username, roleId: user.roleId },
      jwtSecret,
      { expiresIn: jwtExpiration }
    );

    const role = await prisma.role.findUnique({ where: { id: user.roleId } });

    const userData = {
      id: user.dni,
      name: user.username,
      roleId: user.roleId,
      role: role.name,
      avatar: 'https://cdn.pixabay.com/photo/2024/07/22/17/11/elegance-in-profile-8913207_640.png',
      notifications: 3,
    }

    return new Response(
      JSON.stringify({
        message: 'Inicio de sesión exitoso',
        token, // El token JWT para autenticación futura
        userData,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error en el proceso de login:', error);
    return new Response(
      JSON.stringify({ error: 'Ocurrió un error en el proceso de inicio de sesión' }),
      { status: 500 }
    );
  }
}

// Middleware para validar el JWT en rutas protegidas
export async function verifyJWT(req) {
  try {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No se proporcionó token de autenticación' }),
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verificar y decodificar el JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Retornamos los datos decodificados del JWT (puedes usar estos datos en la ruta protegida)
  } catch (error) {
    console.error('Error en la verificación del token:', error);
    return new Response(
      JSON.stringify({ error: 'Token inválido o expirado' }),
      { status: 401 } // Unauthorized
    );
  }
}
