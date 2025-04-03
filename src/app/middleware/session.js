import { NextResponse } from 'next/server';

export function middleware(req) {
    const sessionCookie = req.cookies.get('sessionId');

    if (!sessionCookie) {
        return NextResponse.redirect('/login');
    }

    return NextResponse.next();
}
