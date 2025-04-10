import { NextResponse } from 'next/server';
import { parse } from 'cookie'; // Para parsear las cookies

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const newUrl = req.nextUrl.clone();
  const cookies = parse(req.headers.get('cookie') || '');
  const refreshToken = cookies.refresh_token;
  const accessToken = cookies.token; // Asumimos que el token de acceso está almacenado en las cookies también

  try {
    // Si estamos en la página de login y hay tokens, redirigir a la página principal
    if (pathname === '/login' && (refreshToken || accessToken)) {
      newUrl.pathname = '/';
      return NextResponse.redirect(newUrl);
    }

    // Si no hay refresh token ni access token, redirigir a login
    if (!refreshToken || !accessToken) {
      newUrl.pathname = '/login';
      return NextResponse.redirect(newUrl);
    }

    return NextResponse.next();
  } catch (error) {
    // Si ocurre un error, redirigir al login
    console.error('Error al procesar el middleware:', error);
    newUrl.pathname = '/login';
    return NextResponse.redirect(newUrl);
  }
}
