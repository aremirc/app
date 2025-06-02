import { ROUTES } from "./routes"

const baseRoutes = {
  dashboard: { title: "Inicio", href: ROUTES.dashboard, icon: "home" },
  services: { title: "Servicios", href: ROUTES.services, icon: "service" },
  clients: { title: "Clientes", href: ROUTES.clients, icon: "client" },
  users: { title: "Usuarios", href: ROUTES.users, icon: "user" },
  orders: { title: "Órdenes", href: ROUTES.orders, icon: "order" },
  visits: { title: "Visitas", href: ROUTES.visits, icon: "visit" },
}

export const Roles = {
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
  ]
}
