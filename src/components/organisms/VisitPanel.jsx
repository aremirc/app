import { useState } from "react"
import { useVisits } from "@/hooks/useVisits"  // Importamos el hook
import Button from "../atoms/Button"
import Table from "../molecules/Table"
import Card from "../molecules/Card"
import DashboardGrid from "./DashboardGrid"
import VisitCard from "../molecules/VisitCard"
import useRealTimeUpdates from "@/hooks/useRealTimeUpdates"  // Hook para WebSocket
import SearchBar from "../molecules/SearchBar"

const headers = [
  { key: "date", label: "Fecha de Visita" },
  { key: "id", label: "ID de Visita" },
  { key: "description", label: "Descripción" },
  // { key: "orderId", label: "ID de Orden" },
  { key: "client", label: "Cliente" },
  { key: "user", label: "Trabajador" },
]

const VisitPanel = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState(null)
  const { visits, error, isLoading, deleteVisitMutation } = useVisits()

  // Llamar al hook de WebSocket para recibir actualizaciones en tiempo real
  useRealTimeUpdates()  // Aquí es donde se maneja la lógica WebSocket

  const handleDelete = (id) => {
    const visitToDelete = visits.find((visit) => visit.id === id)
    setSelectedVisit(visitToDelete)
    setIsDeleteConfirmationOpen(true)
  }

  const confirmDelete = () => {
    deleteVisitMutation.mutate(selectedVisit.id)
    setSelectedVisit(null)
    setIsDeleteConfirmationOpen(false)
  }

  const cancelDelete = () => {
    setIsDeleteConfirmationOpen(false)
    setSelectedVisit(null)
  }

  const handleEdit = (id) => {
    const visitToEdit = visits.find((visit) => visit.id === id)
    setSelectedVisit(visitToEdit)
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setSelectedVisit(null)
    setIsModalOpen(false)
  }

  // Filtrar las visitas por la fecha con el debounce
  const filteredVisits = visits.filter(visit =>
    [
      visit.id,
      visit.date,
      visit.description,
      visit.orderId,
      visit.client?.name,
      `${visit.user?.firstName} ${visit.user?.lastName}`
    ].some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <DashboardGrid className="flex-1">
      <Card>
        <div className="flex flex-col gap-4 mb-3">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Panel de Visitas</h2>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/75 dark:hover:bg-primary-dark text-white hover:text-white tracking-wide py-3 px-5 rounded-xl"
            >
              AGREGAR VISITA
            </Button>
          </div>
          <SearchBar
            placeholder="Buscar visita"
            onSearch={setSearchTerm}
            total={filteredVisits.length}
          />
        </div>

        {isLoading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>{error.message}</p>
        ) : filteredVisits.length === 0 ? (
          <p className="text-center text-text-light dark:text-text-dark">No hay visitas registradas.</p>
        ) : (
          <Table
            headers={headers}
            data={filteredVisits.map(visit => ({
              ...visit,
              client: visit.client?.name,
              user: visit.user?.firstName?.split(" ")[0] + ' ' + visit.user?.lastName?.split(" ")[0]
            }))}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchTerm={searchTerm}
          />
        )}
      </Card>

      {isModalOpen && (
        <VisitCard
          visit={selectedVisit}
          handleCancel={handleCancel}
        />
      )}

      {isDeleteConfirmationOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white dark:bg-background-dark p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              ¿Estás seguro de que deseas eliminar esta visita: <strong>{selectedVisit.description}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={cancelDelete}
                className="w-full sm:max-w-28 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className="w-full sm:max-w-28 bg-red-500 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardGrid>
  )
}

export default VisitPanel
