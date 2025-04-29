import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import Badge from "../atoms/Badge"
import Link from "next/link"

const UserList = () => {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Ref para detectar clics fuera del menú
  const menuRef = useRef(null)

  // Función para cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    // Añadir un evento de clic fuera del menú
    document.addEventListener('mousedown', handleClickOutside)

    // Limpiar el evento cuando el componente se desmonta
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      className="text-text-dark flex items-center gap-2 cursor-pointer"
      onClick={() => setIsMenuOpen(!isMenuOpen)}
    >
      <div className="relative">
        <img
          className="w-10 h-10 rounded-full"
          src={user.avatar}
          alt="Avatar"
        />
        <Badge count={user.notifications} />
      </div>
      <div className="flex flex-col justify-center">
        <h4 className="text-md">{user.name}</h4>
        <p className="text-xs text-text-dark">{user.role}</p>
      </div>

      {/* Menú desplegable */}
      {isMenuOpen && (
        <div
          ref={menuRef} // Usar ref para detectar clics fuera del menú
          className="absolute top-3/4 right-0 mt-2 w-48 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark rounded-lg shadow-lg shadow-shadow-light dark:shadow-shadow-dark overflow-hidden"
        >
          <div>
            <Link
              href="/profile"
              className="block px-4 py-2 hover:bg-border-light dark:hover:bg-border-dark hover:text-primary-dark"
            >
              Ver mi perfil
            </Link>
            <div
              className="block px-4 py-2 hover:bg-border-light dark:hover:bg-border-dark hover:text-primary-dark cursor-pointer"
            >
              Configuración
            </div>
            <div
              onClick={logout}
              className="block px-4 py-2 hover:bg-border-light dark:hover:bg-border-dark hover:text-primary-dark cursor-pointer"
            >
              Cerrar sesión
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserList