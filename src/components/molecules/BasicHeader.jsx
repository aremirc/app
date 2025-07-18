import { usePathname } from "next/navigation"
import ThemeToggleIcon from "../atoms/ThemeToggle"

const BasicHeader = ({ title: propTitle }) => {
  const pathname = usePathname()

  // Obtener primera parte del pathname (ej: '/login' → 'login')
  const basePath = pathname ? `/${pathname.split('/').filter(Boolean)[0]}` : ''

  // Formatear fallbackTitle desde la ruta
  const formattedPathname = basePath ? basePath.replace('/', '').replace(/-/g, ' ') : ''
  const fallbackTitle = formattedPathname
    ? formattedPathname.charAt(0).toUpperCase() + formattedPathname.slice(1)
    : 'Dashboard'

  const finalTitle = propTitle || fallbackTitle

  return (
    <header className="sticky top-0 bg-linear-to-r from-background-light dark:from-primary-dark via-primary to-background-dark dark:to-background-dark p-6 shadow-md z-20">
      <div className="container lg:max-w-full mx-auto flex justify-between items-center">
        <div className="relative flex items-center justify-center gap-3">
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
      </div>

      <ThemeToggleIcon />
    </header>
  )
}

export default BasicHeader
