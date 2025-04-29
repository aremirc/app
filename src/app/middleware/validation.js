import { NextResponse } from 'next/server'

const protectedRoutes = ['/dashboard', '/admin']

export function middleware(req) {
  const isProtected = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))
  const token = req.cookies.get('auth_token')?.value

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}
