import { NextResponse } from 'next/server';

export function middleware(req) {
    const url = req.nextUrl.clone()
    const token = req.cookies.get('token');

    // Verificar si el token existe y es válido
    if (!token) {
        url.pathname = '/login'
        return NextResponse.redirect(url); // Redirigir si no está autenticado
    }

    // Aquí puedes agregar lógica adicional de validación del token
    return NextResponse.next(); // Continuar con la solicitud si está autenticado
}
