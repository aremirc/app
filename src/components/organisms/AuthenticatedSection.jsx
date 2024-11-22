import { useAuth } from "@/context/AuthContext"
import LogoutButton from "../atoms/LogoutButton"
import Link from "next/link"

const AuthenticatedSection = () => {
  const { user } = useAuth()

  return (
    <section className="flex-1 flex flex-col items-center justify-center backdrop-brightness-50">
      <img src={user.avatar} alt="Foto de perfil" className="w-24 h-24 rounded-full" />
      <p className="text-text-light dark:text-text-dark text-xl font-semibold">¡Bienvenido de nuevo, {user.name}!</p>
      {/* <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg">
        Tienes un mensaje nuevo de nuestro equipo.
      </div> */}
      <div className="flex gap-4 mt-2">
        <Link href="/profile" className="text-secondary-light dark:text-primary-dark hover:underline">Ver mi perfil</Link>
        <Link href="/orders" className="text-secondary-light dark:text-primary-dark hover:underline">Mis órdenes</Link>
        <Link href="/dashboard" className="text-secondary-light dark:text-primary-dark hover:underline">Inicio</Link>
      </div>
      <LogoutButton />
    </section>
  )
}

export default AuthenticatedSection