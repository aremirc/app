import Link from 'next/link'
import { Cake } from 'lucide-react'
import { useAuth } from "@/context/AuthContext"
import { isBirthday } from '@/lib/utils'
import Icon from '../atoms/Icon'

const TechnicianMetrics = ({ metrics }) => {
  const { user } = useAuth()

  if (metrics.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-text-dark">
        No se encontraron métricas para mostrar.
      </p>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${user?.role?.name === 'TECHNICIAN' && "xl:grid-cols-4"} gap-4`}>
      {metrics.map((item) => (
        <Link
          key={item.dni}
          href={`/users/${item.dni}`}
          className="relative p-3 rounded-md bg-primary/10 dark:bg-primary-dark/20 hover:bg-primary/20 dark:hover:bg-primary-dark/40 transition-colors shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-primary-dark dark:text-primary-light truncate">
              {item.firstName?.split(" ")[0]} {item.lastName?.split(" ")[0]}
            </h3>
            {item.icon && <Icon name={item.icon} size={20} />}
            {item.birthDate && isBirthday(item.birthDate) && (
              <Cake
                className="absolute top-0 left-0 w-4 h-4 text-pink-500 animate-bounce"
                title="¡Feliz cumpleaños!"
              />
            )}
          </div>

          <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
            <div className="flex justify-between">
              <span className="font-medium">Visitas:</span>
              <span className="font-semibold">{item.totalVisits}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tiempo visitas:</span>
              <span className="font-semibold">{item.totalTime} min</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Satisfacción:</span>
              <span className="font-semibold">{item.averageSatisfaction} ★</span>
            </div>
            {/* Puedes habilitar esto si decides mostrar órdenes */}
            {/* <div className="flex justify-between">
              <span className="font-medium">Órdenes completadas:</span>
              <span className="font-semibold">{item.completedOrders}</span>
            </div> */}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default TechnicianMetrics