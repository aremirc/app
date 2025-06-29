import { PartyPopper, Cake } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { isBirthday } from '@/lib/utils'
import Link from "next/link"
import LogoutButton from "../atoms/LogoutButton"

const AuthenticatedSection = () => {
  const { user } = useAuth()
  const name = user.name || (user.firstName + ' ' + user.lastName)

  return (
    <section className="flex-1 flex flex-col items-center justify-center backdrop-brightness-50">
      <div className="relative">
        <img
          src={user.avatar || "/default-avatar.webp"}
          alt="Foto de perfil"
          className="w-24 h-24 object-cover rounded-full"
          onError={(e) => {
            e.target.src = "/default-avatar.webp";
          }}
        />

        {isBirthday(user.birthDate) && (
          <PartyPopper
            className="absolute -top-1 -right-1 w-8 h-8 text-pink-500 animate-bounce"
            title="¡Feliz cumpleaños!"
          />
        )}
      </div>

      <p className="text-text-light dark:text-text-dark text-xl font-semibold">
        {isBirthday(user.birthDate) ? (
          <span>🎉 ¡Feliz cumpleaños, {name}! 🎉</span>
        ) : (
          <span>
            {user.gender === 'FEMALE' ? '¡Bienvenida' : '¡Bienvenido'} de nuevo, {name}!
          </span>
        )}
      </p>

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