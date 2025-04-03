import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';  // Importar NextResponse
import dotenv from 'dotenv';

dotenv.config();

export async function GET(req) {
  try {
    const token = req.cookies.token; // Obtener token desde cookies
    const refreshToken = req.cookies.refresh_token; // Obtener refresh_token desde cookies

    // Verificar si el token de acceso es válido
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificar token

      // Retornar respuesta con NextResponse
      return NextResponse.json({ status: 'autenticado', user: decoded });
    }

    // Si no tenemos un token válido, intentamos refrescarlo con el refresh token
    if (refreshToken) {
      const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET); // Verificar refresh token

      // Generamos un nuevo token de acceso si el refresh token es válido
      const newAccessToken = jwt.sign(
        { dni: decodedRefresh.dni, username: decodedRefresh.username, roleId: decodedRefresh.roleId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );

      // Retornar el nuevo token
      return NextResponse.json({ status: 'refrescado', token: newAccessToken });
    }

    // Si no hay token y no se puede refrescar, devolver un error de no autenticado
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  } catch (error) {
    console.error('Error verificando el estado de la sesión:', error);
    return NextResponse.json({ error: 'Error al verificar la sesión' }, { status: 500 });
  }
}
