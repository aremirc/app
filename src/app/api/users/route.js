
// import connectToDatabase from '../../../lib/db';

// export async function GET(req) {
//   try {
//     const client = await connectToDatabase();

//     // Realiza la consulta SQL
//     const result = await client.query('SELECT * FROM usuarios');
//     client.release();  // Libera el cliente del pool después de la consulta

//     // Devuelve los datos en formato JSON
//     return new Response(JSON.stringify(result.rows), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('Error al obtener usuarios:', error);
//     return new Response(JSON.stringify({ error: 'Error en la base de datos' }), {
//       status: 500,
//     });
//   }
// }

// Next steps:
// 1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started
// 2. Set the provider of the datasource block in schema.prisma to match your database: postgresql, mysql, sqlite, sqlserver, mongodb or cockroachdb.
// 3. Run prisma db pull to turn your database schema into a Prisma schema.
// 4. Run prisma generate to generate the Prisma Client. You can then start querying your database.
// 5. Tip: Explore how you can extend the ORM with scalable connection pooling, global caching, and real-time database events. Read: https://pris.ly/cli/beyond-orm   

import { NextResponse } from 'next/server'
import { verifyAndLimit } from '@/lib/permissions'
import { verifyCsrfToken } from '@/lib/csrf'
import { verifyJWT } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function GET(req) {
  const authResponse = await verifyAndLimit(req, 'ADMIN')
  if (authResponse) return authResponse

  try {
    const searchParams = req.nextUrl.searchParams

    const roleParam = searchParams.get('role') // 'TECHNICIAN', 'ADMIN', etc.
    const statusParam = searchParams.get('status') // 'ACTIVE', 'INACTIVE', etc.

    const whereClause = {
      deletedAt: null,
      ...(roleParam && {
        role: {
          name: roleParam.toUpperCase(),
        },
      }),
      ...(statusParam && {
        status: statusParam.toUpperCase(),
      }),
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        dni: true,
        firstName: true,
        lastName: true,
        gender: true,
        birthDate: true,
        email: true,
        phone: true,
        country: true,
        address: true,
        status: true,
        username: true,
        roleId: true,
        avatar: true,
        socialLinks: true,
        isVerified: true,
        createdAt: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    verifyCsrfToken(req)
    const authResponse = await verifyAndLimit(req, 'ADMIN')
    if (authResponse) return authResponse

    const { dni, status, username, email, password, roleId, firstName, lastName, gender, avatar, phone, address, country, birthDate, socialLinks } = await req.json()

    if (!dni || !username || !email || !password || !roleId || !firstName || !lastName || !gender) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    if (!/^\d{8}$/.test(dni)) {
      return NextResponse.json({ error: 'DNI no válido. Debe contener 8 dígitos' }, { status: 400 })
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Correo electrónico no válido' }, { status: 400 })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }, { dni }],
      },
    })

    if (existingUser) {
      const errors = []
      if (existingUser.email === email) errors.push('Correo electrónico ya registrado')
      if (existingUser.username === username) errors.push('Nombre de usuario ya registrado')
      if (existingUser.dni === dni) errors.push('DNI ya registrado')

      return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } })
    if (!role) return NextResponse.json({ error: 'Rol no válido' }, { status: 400 })

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        dni,
        username,
        email,
        password: hashedPassword,
        roleId,
        firstName,
        lastName,
        gender,
        avatar: avatar || null,
        phone: phone || null,
        address: address || null,
        country: country || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        socialLinks: socialLinks || null,
        status,
      },
    })

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    if (error.message?.includes('CSRF')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error al crear el usuario:', error)
    return NextResponse.json({ error: 'Error al crear el usuario' }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    verifyCsrfToken(req)
    const authResponse = await verifyAndLimit(req, 'ADMIN')
    if (authResponse) return authResponse

    const { dni, status, isVerified, username, email, password, roleId, firstName, lastName, gender, avatar, phone, address, country, birthDate, socialLinks } = await req.json()

    if (!dni || !username || !email || !roleId || !firstName || !lastName || !gender || !status) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'].includes(status)) {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 })
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Correo electrónico no válido' }, { status: 400 })
    }

    if (password && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres, con letras y números' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { dni } })
    if (!existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const duplicateUser = await prisma.user.findFirst({
      where: {
        AND: [
          { dni: { not: dni } },
          {
            OR: [{ email }, { username }],
          },
        ],
      },
    })

    if (duplicateUser) {
      const errors = []
      if (duplicateUser.email === email) errors.push('Correo ya registrado')
      if (duplicateUser.username === username) errors.push('Usuario ya registrado')
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } })
    if (!role) return NextResponse.json({ error: 'Rol no válido' }, { status: 400 })

    const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined

    const updatedUser = await prisma.user.update({
      where: { dni },
      data: {
        username,
        email,
        password: hashedPassword || existingUser.password,
        roleId,
        firstName,
        lastName,
        gender,
        avatar: avatar ?? null,
        phone: phone ?? null,
        address: address ?? null,
        country: country ?? null,
        birthDate: birthDate ? new Date(birthDate) : null,
        socialLinks: socialLinks ?? null,
        status,
        isVerified,
        deletedAt: ['INACTIVE', 'SUSPENDED'].includes(status) ? new Date() : null
      },
    })

    const { password: _, ...userWithoutPassword } = updatedUser
    return NextResponse.json(userWithoutPassword, { status: 200 })
  } catch (error) {
    if (error.message?.includes('CSRF')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error al actualizar el usuario:', error)
    return NextResponse.json({ error: 'Error al actualizar el usuario' }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    verifyCsrfToken(req)
    const authResponse = await verifyAndLimit(req, 'ADMIN')
    if (authResponse) return authResponse

    const currentUser = await verifyJWT(req)
    const { dni } = await req.json()

    if (!dni || typeof dni !== 'string') {
      return NextResponse.json({ error: 'DNI es requerido y debe ser válido' }, { status: 400 })
    }

    const userToDelete = await prisma.user.findUnique({
      where: { dni },
      include: { role: true },
    })

    if (!userToDelete || userToDelete.deletedAt !== null) {
      return NextResponse.json({ error: 'Usuario no encontrado o ya eliminado' }, {
        status: 404,
      })
    }

    // ❌ Evitar que un admin se desactive a sí mismo
    if (dni === currentUser?.dni) {
      return NextResponse.json({ error: 'No puedes desactivarte a ti mismo' }, { status: 403 })
    }

    const isAdmin = userToDelete.role.name === 'ADMIN'

    if (isAdmin) {
      const activeAdminsCount = await prisma.user.count({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          role: {
            name: 'ADMIN',
          },
        },
      })

      if (activeAdminsCount <= 1) {
        return NextResponse.json(
          { error: 'No se puede desactivar al único administrador activo' },
          { status: 403 }
        )
      }
    }

    await prisma.user.update({
      where: { dni },
      data: {
        status: 'INACTIVE', // Soft delete
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({ message: 'Usuario eliminado correctamente' }, { status: 200 })
  } catch (error) {
    if (error.message?.includes('CSRF')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error('Error al desactivar el usuario:', error)
    return NextResponse.json({ error: 'Error al eliminar el usuario' }, { status: 500 })
  }
}
