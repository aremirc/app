import { useState } from 'react'
import { useAuth } from "@/context/AuthContext"
import { isBirthday } from '@/lib/utils'
import { Cake, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Icon from '../atoms/Icon'
import Button from '../atoms/Button'

const ITEMS_PER_PAGE = 6

const TechnicianMetrics = ({ metrics }) => {
  const { user } = useAuth()
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(metrics.length / ITEMS_PER_PAGE))
  const currentMetrics = metrics.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  if (metrics.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-text-dark">
        No se encontraron métricas para mostrar.
      </p>
    )
  }

  const Wrapper = user?.role?.name === 'TECHNICIAN' ? 'div' : Link

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 ${user?.role?.name === 'TECHNICIAN' && "xl:grid-cols-4"} gap-4`}>
        {currentMetrics.map((item) => (
          <Wrapper
            key={item.dni}
            {...(user?.role?.name !== 'TECHNICIAN' && { href: `/users/${item.dni}` })}
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

            <div className="text-xs text-end text-gray-700 dark:text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span className="font-medium truncate">Visitas:</span>
                <span className="font-semibold">{item.totalVisits}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium truncate">Tiempo visitas:</span>
                <span className="font-semibold">{item.totalTime} min</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium truncate">Satisfacción:</span>
                <span className="font-semibold">{item.averageSatisfaction} ★</span>
              </div>
              {/* Puedes habilitar esto si decides mostrar órdenes */}
              {/* <div className="flex justify-between">
              <span className="font-medium">Órdenes completadas:</span>
              <span className="font-semibold">{item.completedOrders}</span>
            </div> */}
            </div>
          </Wrapper>
        ))}
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center pt-2">
        <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
          <ChevronLeft />
        </Button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          <span className='hidden sm:inline'>Página </span>{page + 1} de {totalPages}
        </span>
        <Button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}

export default TechnicianMetrics