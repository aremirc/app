import prisma from '@/lib/prisma'
import { verifyAndLimit } from '@/lib/permissions'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const authResponse = await verifyAndLimit(req, "ADMIN")
  if (authResponse) return authResponse

  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
    })

    return NextResponse.json(roles, { status: 200 })
  } catch (error) {
    console.error("Error al obtener roles:", error)
    return NextResponse.json({ error: "Error al obtener roles" }, { status: 500 })
  }
}
