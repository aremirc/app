import { ROUTES } from "./routes"

const baseRoutes = {
  dashboard: { title: "Inicio", href: ROUTES.dashboard, icon: "home" },
  users: { title: "Usuarios", href: ROUTES.users, icon: "user" },
  clients: { title: "Clientes", href: ROUTES.clients, icon: "client" },
  orders: { title: "Órdenes", href: ROUTES.orders, icon: "order" },
  visits: { title: "Visitas", href: ROUTES.visits, icon: "visit" },
  services: { title: "Servicios", href: ROUTES.services, icon: "service" },
}

export const Roles = {
  ADMIN: [
    baseRoutes.dashboard,
    baseRoutes.users,
    baseRoutes.clients,
    baseRoutes.orders,
    baseRoutes.visits,
    baseRoutes.services,
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
