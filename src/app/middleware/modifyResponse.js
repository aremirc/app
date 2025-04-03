import { NextResponse } from 'next/server';

export function middleware(req) {
    const res = NextResponse.next();
    res.locals.timestamp = new Date().toISOString();
    return res;
}
