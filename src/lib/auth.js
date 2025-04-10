import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { parse } from 'cookie';

// Función para obtener el token desde las cookies
const getTokenFromCookies = (req) => {
  const cookies = parse(req.headers.get('Cookie') || '');
  return cookies.token;
};

// Función para generar una respuesta estándar de error
const createErrorResponse = (message, status = 401) => {
  return NextResponse.json({ error: message }, { status });
};

// Función para verificar el JWT
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

// Función principal de verificación de JWT
export async function verifyJWT(req) {
  const token = getTokenFromCookies(req);

  if (!token) {
    return createErrorResponse('No se proporcionó token de autenticación');
  }

  try {
    // Intentar verificar el token de acceso
    const decoded = verifyAccessToken(token);
    return decoded;  // Retorna los datos decodificados del JWT si la verificación es exitosa
  } catch (error) {
    // Si el token ha expirado o ha fallado la verificación
    if (error.name === 'TokenExpiredError') {
      return createErrorResponse('Token expirado', 401); // Error específico por expiración del token
    }
    return createErrorResponse('Error en la verificación del token', 401);  // Otros errores de verificación
  }
}
