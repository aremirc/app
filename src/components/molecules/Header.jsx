import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import useNavigationItems from "@/hooks/useNavigationItems"
import Navbar from "../organisms/NavBar"
import UserList from "../organisms/UserList"
import Countdown from "../atoms/Countdown"
import ThemeToggleIcon from "../atoms/ThemeToggle"

const Header = ({ title: propTitle }) => {
  const { user } = useAuth()
  const { itemNav } = useNavigationItems()
  const pathname = usePathname()

  // Buscar la primera sección de la ruta
  const basePath = pathname ? `/${pathname.split('/').filter(Boolean)[0]}` : ''

  // Buscar itemNav que coincida con basePath o ruta exacta
  const currentNavItem = itemNav.find(item =>
    item.href === pathname || item.href === basePath
  )
  const navTitle = currentNavItem?.title

  // Si no viene como prop ni está en itemNav, usar el fallback para mostrar título amigable
  const formattedPathname = basePath ? basePath.replace('/', '').replace(/-/g, ' ') : '' // reemplaza guiones por espacios si existen

  // Capitaliza la primera letra
  const fallbackTitle = formattedPathname
    ? formattedPathname.charAt(0).toUpperCase() + formattedPathname.slice(1)
    : 'Dashboard'

  const finalTitle = propTitle || navTitle || fallbackTitle

  return (
    <header className="sticky top-0 bg-linear-to-r from-background-light dark:from-primary-dark via-primary to-background-dark dark:to-background-dark p-6 shadow-md z-10">
      <div className="container lg:max-w-full mx-auto flex justify-between items-center">
        {user?.role?.name && (
          <Countdown className="fixed top-0 sm:top-auto text-red-500 font-bold" visible={false} />
        )}

        <div className={`relative flex items-center justify-center gap-3 transform ${user?.role?.name ? "sm:translate-x-64" : ""}`}>
          <div className="col-span-full flex items-center justify-center">
            <button
              className="flex items-center justify-center text-black text-4xl transition duration-200 ease-in-out"
              onClick={() => window.history.back()}
              aria-label="Volver"
            >
              &#8249;
            </button>
          </div>
          <h1 className="text-background-dark text-3xl font-bold">{finalTitle}</h1>
        </div>

        {/* <Navbar /> */}

        {user?.role?.name && <UserList />}
      </div>

      <ThemeToggleIcon />
    </header>
  )
}

export default Header
