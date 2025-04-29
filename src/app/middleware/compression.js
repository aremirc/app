import compression from 'compression'
import { NextResponse } from 'next/server'

export function middleware(req) {
    const res = NextResponse.next()
    compression()(req, res, () => {})
    return res
}
