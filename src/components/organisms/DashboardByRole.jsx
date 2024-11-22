import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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

  const pathname = usePathname()
  const { user } = useAuth();

  if (!user) {
    return <p>No estás autenticado. Por favor, inicia sesión.</p>;
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
      return <p className="text-text-light dark:text-text-dark">Rol desconocido. No tienes acceso a ningún panel.</p>;
  }
};

export default DashboardByRole;