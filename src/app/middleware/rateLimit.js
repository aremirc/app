import rateLimit from 'express-rate-limit';
import { NextResponse } from 'next/server';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutos
    max: 100,  // Limitar a 100 solicitudes
    message: 'Too many requests, please try again later.'
});

export function middleware(req) {
    const res = NextResponse.next();
    limiter(req, res, () => {});
    return res;
}
