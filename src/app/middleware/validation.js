import { NextResponse } from 'next/server';

export function middleware(req) {
    if (req.method === 'POST') {
        const { username, email } = req.body;
        if (!username || !email) {
            return new NextResponse('Bad Request', { status: 400 });
        }
    }
    return NextResponse.next();
}
