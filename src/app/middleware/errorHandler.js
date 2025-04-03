import { NextResponse } from 'next/server';

export function middleware(req) {
    try {
        // Aquí iría tu lógica principal del middleware
        return NextResponse.next();
    } catch (error) {
        console.error(error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
