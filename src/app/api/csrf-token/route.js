import { NextResponse } from 'next/server'
import csrf from 'csrf'

const tokens = new csrf()

export async function GET(req) {
  // Generar un token CSRF
  const csrfToken = tokens.create(process.env.CSRF_SECRET)

  // Devolver el token CSRF en la respuesta
  return NextResponse.json({ csrfToken }, { status: 200 })
}
