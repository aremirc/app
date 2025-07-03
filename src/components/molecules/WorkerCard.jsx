import { Pencil, Cake, ShieldCheck } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { isBirthday } from '@/lib/utils'
import Link from "next/link"
import Card from "./Card"
import Button from "../atoms/Button"

const WorkerCard = ({ worker }) => {
  const { user } = useAuth()
  const userWorker = worker?.user

  return (
    <Card className="relative flex items-center justify-center">
      {/* <Button size="sm" variant="outline" className="absolute top-2 right-2">
        <Pencil className="w-4 h-4" />
      </Button> */}

      {isBirthday(userWorker?.birthDate) && (
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

      {userWorker ? (
        <div className="flex flex-col items-center gap-1">
          <img
            src={userWorker.avatar || '/default-avatar.webp'}
            className="w-16 h-16 object-cover rounded-full border"
            alt={`${userWorker.firstName} ${userWorker.lastName}`}
            onError={(e) => { e.target.src = "/default-avatar.webp" }}
          />
          {user?.role?.name === 'TECHNICIAN' ? (
            <p className="text-primary dark:text-primary-dark font-medium text-center">
              {userWorker.firstName?.split(" ")[0]} {userWorker.lastName?.split(" ")[0]}
            </p>
          ) : (
            <Link href={`/users/${userWorker.dni}`}>
              <p className="text-primary dark:text-primary-dark font-medium text-center">
                {userWorker.firstName?.split(" ")[0]} {userWorker.lastName?.split(" ")[0]}
              </p>
            </Link>
          )}
          <p className="text-sm text-text-light dark:text-text-dark">Empleado</p>
        </div>
      ) : (
        <div className="w-16 h-16 rounded-full border bg-gray-100" />
      )}
    </Card>
  )
}

export default WorkerCard
