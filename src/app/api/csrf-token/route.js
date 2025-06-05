import { NextResponse } from 'next/server'
import csrf from 'csrf'

const tokens = new csrf()

export async function GET(req) {
  const csrfSecret = process.env.CSRF_SECRET

  if (!csrfSecret) {
    return NextResponse.json({ message: 'CSRF_SECRET no configurado' }, { status: 500 })
  }

  const csrfToken = tokens.create(csrfSecret)

  return NextResponse.json({ csrfToken }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}