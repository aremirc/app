import { setCookie, destroyCookie } from 'nookies';

export function setAuthCookies(ctx, token, role) {
  setCookie(ctx, 'token', token, {
    maxAge: 30 * 24 * 60 * 60,  // 30 días
    path: '/',
    secure: process.env.NODE_ENV === 'production', // Solo en producción
    sameSite: 'lax',  // O 'strict' si no necesitas compartir entre sitios
    httpOnly: true,   // No accesible desde JavaScript
  });

  setCookie(ctx, 'user_role', role, {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true,
  });
}

export function removeAuthCookies(ctx) {
  destroyCookie(ctx, 'token', { path: '/' });
  destroyCookie(ctx, 'user_role', { path: '/' });
  destroyCookie(ctx, 'refresh_token', { path: '/' });
}

export function setRefreshTokenCookies(ctx, refreshToken) {
  setCookie(ctx, 'refresh_token', refreshToken, {
    maxAge: 60 * 60 * 24 * 30,  // 30 días
    path: '/',
    secure: process.env.NODE_ENV === 'production', // Solo en producción
    sameSite: 'lax',  // O 'strict' si no necesitas compartir entre sitios
    httpOnly: true,   // No accesible desde JavaScript
  });
}

export function removeRefreshTokenCookies(ctx) {
  destroyCookie(ctx, 'refresh_token', { path: '/' });
}
