import { Pencil, Cake, ShieldCheck } from "lucide-react"
import { isBirthday } from '@/lib/utils'
import Card from "./Card"
import Button from "../atoms/Button"

const WorkerCard = ({ worker }) => {
  const user = worker?.user

  return (
    <Card className="relative flex items-center justify-center">
      <Button size="sm" variant="outline" className="absolute top-2 right-2">
        <Pencil className="w-4 h-4" />
      </Button>

      {isBirthday(user?.birthDate) && (
        <Cake
          className="absolute top-2 left-2 w-5 h-5 text-pink-500 animate-bounce"
          title="¡Feliz cumpleaños!"
        />
      )}

      {worker?.isResponsible && (
        <ShieldCheck
          className="absolute bottom-2 left-2 w-5 h-5 text-green-600"
          title="Responsable asignado"
        />
      )}

      {user ? (
        <div className="flex flex-col items-center gap-1">
          <img
            src={user.avatar || '/default-avatar.webp'}
            className="w-16 h-16 object-cover rounded-full border"
            alt={`${user.firstName} ${user.lastName}`}
            onError={(e) => { e.target.src = "/default-avatar.webp" }}
          />
          <p className="text-primary dark:text-primary-dark font-medium text-center">
            {user.firstName?.split(" ")[0]} {user.lastName?.split(" ")[0]}
          </p>
          <p className="text-sm text-text-light dark:text-text-dark">Empleado</p>
        </div>
      ) : (
        <div className="w-16 h-16 rounded-full border bg-gray-100" />
      )}
    </Card>
  )
}

export default WorkerCard
