"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import AdminDashboard from "../organisms/AdminDashboard"
import TechnicianDashboard from "../organisms/TechnicianDashboard"
import SupervisorDashboard from "../organisms/SupervisorDashboard"
import MainContent from "../organisms/MainContent"
import UserPanel from "../organisms/UserPanel"
import ClientPanel from "../organisms/ClientPanel"
import OrderPanel from "../organisms/OrderPanel"
import VisitPanel from "../organisms/VisitPanel"
import ServicePanel from "../organisms/ServicePanel"
import UserProfile from "../organisms/UserProfile"
import LoadingSpinner from "../atoms/LoadingSpinner"
import Link from "next/link"

const DashboardByRole = () => {
  const panels = {
    '/dashboard': <MainContent />,
    '/users': <UserPanel />,
    '/clients': <ClientPanel />,
    '/orders': <OrderPanel />,
    '/visits': <VisitPanel />,
    '/services': <ServicePanel />,
    '/profile': <UserProfile />,
  }

  const { user } = useAuth()
  const pathname = usePathname()

  // Si el usuario no está autenticado, redirigirlo al login desde el layout
  if (!user) {
    return <LoadingSpinner />
  }

  // Mapeo de roles a componentes de dashboard
  const rolePanels = {
    ADMIN: <AdminDashboard>{panels[pathname]}</AdminDashboard>,
    SUPERVISOR: <SupervisorDashboard>{panels[pathname]}</SupervisorDashboard>,
    TECHNICIAN: <TechnicianDashboard>{panels[pathname]}</TechnicianDashboard>,
  }

  // Si no hay un rol válido, mostrar mensaje de "Rol desconocido" con un enlace
  const PanelForRole = rolePanels[user?.role?.name] || (
    <div className="flex-1 flex justify-center items-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-red-500 dark:text-red-400 mb-4">
          Rol desconocido
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          No tienes acceso a ningún panel.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Si crees que esto es un error, por favor contacta con el soporte o vuelve al inicio.
        </p>
        <div className="mt-4">
          <Link href="/">
            <span className="inline-flex items-center bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300 cursor-pointer mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7M4 10v10h16V10" />
              </svg>
              Volver al inicio
            </span>
          </Link>
        </div>
      </div>
    </div>
  )

  return PanelForRole
}

export default DashboardByRole
