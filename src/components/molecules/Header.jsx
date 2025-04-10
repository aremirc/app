import { useAuth } from "@/context/AuthContext"
import Title from "../atoms/Title"
import Navbar from "../organisms/NavBar"
import UserList from "../organisms/UserList"
import useDarkMode from "@/hooks/useDarkMode"
import Countdown from "../atoms/Countdown"
import { usePathname } from "next/navigation"

const Header = ({ title = "Dashboard" }) => {
  const { user } = useAuth()
  const { isDark, toggleDarkMode } = useDarkMode();
  const pathname = usePathname();

  // Verificación de pathname para evitar errores con rutas vacías
  const camelCasePathname = pathname && pathname
    .split('/')
    .filter(Boolean) // Elimina los elementos vacíos
    .map((segment, index) =>
      index === 1 ? segment : segment.charAt(0).toUpperCase() + segment.slice(1)
    )
    .join('') || title; // Si pathname está vacío o es falsy, usa el título por defecto

  return (
    <header className="sticky top-0 bg-gradient-to-r from-background-light dark:from-primary-dark via-primary to-background-dark dark:to-background-dark p-6 shadow-md z-10">
      <div className="container lg:max-w-full mx-auto flex justify-between items-center">
        <div className="relative">
          <Title text={camelCasePathname} />
          <Countdown className="fixed text-red-500 font-bold" />
        </div>
        {/* <Navbar /> */}
        {user && <UserList />}
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
