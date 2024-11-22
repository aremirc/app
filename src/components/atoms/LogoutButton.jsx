import { useAuth } from "@/context/AuthContext"

const LogoutButton = () => {
  const { logout } = useAuth()

  const onLogout = () => {
    logout()
  }

  return <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg" onClick={onLogout}>Cerrar sesión</button>
}

export default LogoutButton