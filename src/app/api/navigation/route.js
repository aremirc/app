import { NextResponse } from 'next/server'
import { verifyAndLimit } from '@/lib/permissions'
import { verifyJWT } from '@/lib/auth'

const ROUTES = {
  dashboard: "/dashboard",
  users: "/users",
  clients: "/clients",
  orders: "/orders",
  visits: "/visits",
  services: "/services",
  profile: "/profile",
}

const baseRoutes = {
  dashboard: { title: "Inicio", href: ROUTES.dashboard, icon: "home" },
  services: { title: "Servicios", href: ROUTES.services, icon: "service" },
  clients: { title: "Clientes", href: ROUTES.clients, icon: "client" },
  users: { title: "Usuarios", href: ROUTES.users, icon: "user" },
  orders: { title: "Órdenes", href: ROUTES.orders, icon: "order" },
  visits: { title: "Visitas", href: ROUTES.visits, icon: "visit" },
  profile: { title: "Perfil", href: ROUTES.profile, icon: "profile" },
}

const Roles = {
  ADMIN: [
    baseRoutes.dashboard,
    baseRoutes.services,
    baseRoutes.clients,
    baseRoutes.users,
    baseRoutes.orders,
    baseRoutes.visits,
  ],
  SUPERVISOR: [
    baseRoutes.dashboard,
    baseRoutes.clients,
    baseRoutes.orders,
    baseRoutes.visits,
  ],
  TECHNICIAN: [
    baseRoutes.dashboard,
    baseRoutes.orders,
    baseRoutes.visits,
  ],
}

export async function GET(req) {
  const authResponse = await verifyAndLimit(req)
  if (authResponse) return authResponse

  try {
    const decoded = await verifyJWT(req)
    if (!decoded || decoded?.error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const userRole = decoded.role
    const allowedRoutes = Roles[userRole] || []

    return NextResponse.json(allowedRoutes, { status: 200 })
  } catch (error) {
    console.error('Error al obtener rutas:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
