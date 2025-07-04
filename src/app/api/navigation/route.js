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
  manual: "/manual",
  settings: "/settings",
}

const baseRoutes = {
  dashboard: { title: "Inicio", href: ROUTES.dashboard, icon: "home", showInMenu: true },
  services: { title: "Servicios", href: ROUTES.services, icon: "service", showInMenu: true },
  clients: { title: "Clientes", href: ROUTES.clients, icon: "client", showInMenu: true },
  users: { title: "Usuarios", href: ROUTES.users, icon: "user", showInMenu: true },
  orders: { title: "Órdenes", href: ROUTES.orders, icon: "order", showInMenu: true },
  visits: { title: "Visitas", href: ROUTES.visits, icon: "visit", showInMenu: true },
  profile: { title: "Perfil", href: ROUTES.profile, icon: "profile", showInMenu: false },
  manual: { title: "Manual", href: ROUTES.manual, icon: "manual", showInMenu: false },
  settings: { title: "Configuración", href: ROUTES.settings, icon: "settings", showInMenu: false },
}

const Roles = {
  ADMIN: [
    baseRoutes.manual,
    baseRoutes.profile,
    baseRoutes.dashboard,
    baseRoutes.services,
    baseRoutes.clients,
    baseRoutes.users,
    baseRoutes.orders,
    baseRoutes.visits,
  ],
  SUPERVISOR: [
    baseRoutes.manual,
    baseRoutes.profile,
    baseRoutes.dashboard,
    baseRoutes.clients,
    baseRoutes.users,
    baseRoutes.orders,
    baseRoutes.visits,
  ],
  TECHNICIAN: [
    baseRoutes.profile,
    baseRoutes.dashboard,
    baseRoutes.orders,
    baseRoutes.visits,
    { ...baseRoutes.manual, showInMenu: true },
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
