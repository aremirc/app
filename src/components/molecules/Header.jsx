import { useAuth } from "@/context/AuthContext"
import Navbar from "../organisms/NavBar"
import UserList from "../organisms/UserList"
import useDarkMode from "@/hooks/useDarkMode"
import Countdown from "../atoms/Countdown"
import { usePathname } from "next/navigation"

const Header = ({ title = "Dashboard" }) => {
  const { user } = useAuth()
  const { isDark, toggleDarkMode } = useDarkMode()
  const pathname = usePathname()

  // Verificación de pathname para evitar errores con rutas vacías
  const camelCasePathname = (pathname && typeof pathname === 'string' && pathname.trim()) // Verifica que pathname sea una cadena válida
    ? pathname
      .split('/')[1]
      .charAt(0).toUpperCase() + pathname.slice(1).split('/')[0].slice(1) // Capitaliza la primera letra de la primera sección
    : title // Si pathname está vacío o no es válido, usa el título por defecto

  return (
    <header className="sticky top-0 bg-gradient-to-r from-background-light dark:from-primary-dark via-primary to-background-dark dark:to-background-dark p-6 shadow-md z-10">
      <div className="container lg:max-w-full mx-auto flex justify-between items-center">
        {user?.role?.name && (
          <Countdown className="fixed top-0 sm:top-auto text-red-500 font-bold" />
        )}

        <div className={`relative flex items-center justify-center gap-3 transform ${user?.role?.name ? "sm:translate-x-64" : ""}`}>
          <div className="col-span-full flex items-center justify-center">
            <button className="flex items-center justify-center text-black text-4xl transition duration-200 ease-in-out" onClick={() => window.history.back()}>&#8249;</button>
          </div>
          <h1 className="text-background-dark text-3xl font-bold">{camelCasePathname}</h1>
        </div>

        {/* <Navbar /> */}

        {user?.role?.name && <UserList />}
      </div>

      <button
        onClick={toggleDarkMode}
        type="button"
        title="toggleTheme"
        className="fixed bottom-0 right-0 m-2 backdrop-brightness-90 w-7 h-7 dark:bg-background-dark rounded-full"
      >
        {isDark ? '🌙' : '🌞'}
      </button>
    </header>
  )
}

export default Header
