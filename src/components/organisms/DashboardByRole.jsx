"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import ModeratorDashboard from "./ModeratorDashboard";
import MainContent from "./MainContent";
import UserPanel from "./UserPanel";
import ClientPanel from "./ClientPanel";
import OrderPanel from "./OrderPanel";
import VisitPanel from "./VisitPanel";
import ServicePanel from "./ServicePanel";
import UserProfile from "./UserProfile";
import LoadingSpinner from "../atoms/LoadingSpinner";

const DashboardByRole = () => {
  const panels = {
    '/dashboard': <MainContent />,
    '/users': <UserPanel />,
    '/clients': <ClientPanel />,
    '/orders': <OrderPanel />,
    '/visits': <VisitPanel />,
    '/services': <ServicePanel />,
    '/profile': <UserProfile />,
  };

  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      // Si el usuario no está autenticado, redirigir al login con el parámetro 'next'
      const redirectTo = encodeURIComponent(pathname);  // Codificar la URL actual para el parámetro 'next'
      router.push(`/login?next=${redirectTo}`);
    }
  }, [user, pathname, router]); // Dependencies: user, pathname, router

  if (!user) {
    return <LoadingSpinner />
  }

  // Renderiza el dashboard dependiendo del rol del usuario
  switch (user.role) {
    case "Admin":
      return <AdminDashboard>{panels[pathname]}</AdminDashboard>;
    case "Worker":
      return <UserDashboard>{panels[pathname]}</UserDashboard>;
    case "Moderador":
      return <ModeratorDashboard>{panels[pathname]}</ModeratorDashboard>;
    default:
      return (
        <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-red-500 dark:text-red-400 mb-4">
              Rol desconocido
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              No tienes acceso a ningún panel.
            </p>
          </div>
        </div>
      );
  }
};

export default DashboardByRole;
