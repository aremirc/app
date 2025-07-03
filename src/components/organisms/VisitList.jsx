import { useState } from 'react'
import { ChevronDown, MessageSquare, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Card from '../molecules/Card'
import Button from '../atoms/Button'
import VisitCard from '../molecules/VisitCard'

const ITEMS_PER_PAGE = 6

const VisitList = ({ visits = [], userID, clientID, orderID, onEdit, onDelete, onComment, emptyMessage = "No hay visitas registradas." }) => {
  const [page, setPage] = useState(0)
  const [openItems, setOpenItems] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState(null)
  const totalPages = Math.max(1, Math.ceil(visits.length / ITEMS_PER_PAGE))
  const currentVisits = visits.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  const toggleItem = (id) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleEdit = (id) => {
    const visitToEdit = visits.find((visit) => visit.id === id)
    if (!visitToEdit) return

    // Si se pasó onEdit como prop, lo ejecutamos
    if (typeof onEdit === "function") {
      onEdit(visitToEdit)
    }

    // Luego abrimos el modal para editar
    setSelectedVisit(visitToEdit)
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setSelectedVisit(null)
    setIsModalOpen(false)
  }

  return (
    <Card title="Visitas Realizadas" className="col-span-1 xl:col-span-3 p-6 rounded-2xl">
      <Button
        size="sm"
        variant="outline"
        className="absolute top-4 right-4 border border-border-light dark:border-border-dark text-primary dark:text-primary-dark hover:bg-primary-light"
        onClick={() => setIsModalOpen(true)}
      >
        +
      </Button>

      {isModalOpen && (
        <VisitCard
          visit={selectedVisit}
          userID={userID}
          clientID={clientID}
          orderID={orderID}
          handleCancel={handleCancel}
        />
      )}

      <div className="space-y-4 mt-4">
        {visits.length === 0 ? (
          <div className="text-center text-sm text-gray-500 dark:text-text-dark py-8">
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
                    <div className={`flex justify-between items-center ${isOpen ? "mb-2" : ""}`}>
                      <Link href={`/visits/${visit.id}`}>
                        <h4 className="font-semibold text-primary dark:text-primary-dark">
                          Visita N° {String(visit.id).padStart(3, '0')}
                        </h4>
                      </Link>
                      <span
                        className="text-sm text-gray-500 dark:text-gray-400 p-1 rounded-md hover:bg-primary-dark/35 cursor-pointer"
                        onClick={() => toggleItem(visit.id)}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform text-text-light dark:text-text-dark ${isOpen ? "rotate-180" : ""}`}
                        />
                      </span>
                    </div>

                    {isOpen && (
                      <>
                        <div className="flex justify-start gap-2 mb-2">
                          {/* <Button size="icon" variant="ghost" onClick={() => onComment?.(visit)}>
                            <MessageSquare className="w-4 h-4" />
                          </Button> */}
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(visit.id)} className='border border-border-light dark:border-border-dark'>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {/* <Button
                            size="icon"
                            variant="ghost"
                            className="text-danger-light dark:text-danger-dark hover:text-danger-dark"
                            onClick={() => onDelete?.(visit)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button> */}
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
                          <strong>N° Orden:</strong> {String(visit.orderId).padStart(3, '0')}
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
    </Card >
  )
}

export default VisitList
