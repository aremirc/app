import jwt from 'jsonwebtoken';
import { parseCookies } from 'nookies';  // Para obtener las cookies
import { NextResponse } from 'next/server'; // Importar NextResponse
import dotenv from 'dotenv';

dotenv.config(); // Cargar las variables de entorno

export async function verifyJWT(req) {
  try {
    // Obtener cookies desde el servidor
    const cookies = parseCookies({ req });
    const token = cookies.token;  // Suponiendo que el JWT se guarda en una cookie llamada 'token'

    if (!token) {
      return NextResponse.json(
        { error: 'No se proporcionó token de autenticación' },
        { status: 401 }
      );
    }

    // Verificar y decodificar el JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Retorna los datos decodificados del JWT (puedes usar estos datos en la ruta protegida)
  } catch (error) {
    console.error('Error en la verificación del token:', error);
    return NextResponse.json(
      { error: 'Token inválido o expirado' },
      { status: 401 } // Unauthorized
    );
  }
}
