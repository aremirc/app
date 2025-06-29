import { useState } from 'react'
import { MessageSquare, Pencil, Trash2 } from 'lucide-react'
import Button from '../atoms/Button'

const ITEMS_PER_PAGE = 6

const VisitList = ({ visits = [], onEdit, onDelete, onComment, emptyMessage = "No hay visitas registradas." }) => {
  const [page, setPage] = useState(0)
  const [openItems, setOpenItems] = useState({})
  const totalPages = Math.max(1, Math.ceil(visits.length / ITEMS_PER_PAGE))
  const currentVisits = visits.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  const toggleItem = (id) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-4 mt-4">
      {visits.length === 0 ? (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
          {emptyMessage}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {currentVisits.map((visit, i) => {
              const index = i + page * ITEMS_PER_PAGE
              const isOpen = openItems[visit.id]

              return (
                <div
                  key={visit.id}
                  className="h-fit border border-border-light dark:border-border-dark p-4 rounded-lg shadow-xs bg-background-muted dark:bg-background-muted-dark"
                >
                  <div
                    className="flex justify-between items-center mb-2 cursor-pointer"
                    onClick={() => toggleItem(visit.id)}
                  >
                    <h4 className="font-semibold text-primary dark:text-primary-dark">
                      Visita N° {String(visit.id).padStart(3, '0')}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {isOpen ? 'Ocultar' : 'Mostrar'}
                    </span>
                  </div>

                  {isOpen && (
                    <>
                      <div className="flex justify-end gap-2 mb-2">
                        <Button size="icon" variant="ghost" onClick={() => onComment?.(visit)}>
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => onEdit?.(visit)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-danger-light dark:text-danger-dark hover:text-danger-dark"
                          onClick={() => onDelete?.(visit)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-text-light dark:text-text-dark">
                        <strong>Fecha:</strong> {new Date(visit.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-text-light dark:text-text-dark">
                        <strong>Hora de Inicio:</strong> {new Date(visit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-text-light dark:text-text-dark">
                        <strong>Hora de Finalización:</strong> {new Date(visit.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm text-text-light dark:text-text-dark">
                        <strong>N° Orden:</strong> {visit.orderId}
                      </p>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Paginación */}
          <div className="flex justify-between items-center pt-2">
            <Button disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <span className='hidden sm:inline'>Página </span>{page + 1} de {totalPages}
            </span>
            <Button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Siguiente</Button>
          </div>
        </>
      )}
    </div>
  )
}

export default VisitList
