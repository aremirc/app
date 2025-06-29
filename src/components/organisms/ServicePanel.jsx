import { useState } from "react"
import { useServices } from "@/hooks/useServices"  // Importamos el hook
import Button from "../atoms/Button"
import Table from "../molecules/Table"
import Card from "../molecules/Card"
import DashboardGrid from "./DashboardGrid"
import ServiceCard from "../molecules/ServiceCard" // Usamos ServiceCard para el modal de agregar/editar
import useRealTimeUpdates from "@/hooks/useRealTimeUpdates"  // Hook para WebSocket
import SearchBar from "../molecules/SearchBar"

const headers = [
  { key: "id", label: "ID" },
  { key: "name", label: "Nombre" },
  { key: "price", label: "Precio" },
  { key: "description", label: "Descripción" },
  { key: "status", label: "Estado" }
]

const ServicePanel = () => {
  const [searchTerm, setSearchTerm] = useState("")  // Estado de búsqueda
  const [isModalOpen, setIsModalOpen] = useState(false)  // Controla la apertura del modal
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)  // Controla la apertura de la confirmación de eliminación
  const [selectedService, setSelectedService] = useState(null)  // Servicio seleccionado
  const { services, error, isLoading, deleteServiceMutation } = useServices()  // Obtenemos los servicios del hook

  // Llamar al hook de WebSocket para recibir actualizaciones en tiempo real
  useRealTimeUpdates()  // Maneja la lógica WebSocket para actualizaciones en tiempo real

  // Función para manejar la eliminación de un servicio
  const handleDelete = (id) => {
    const serviceToDelete = services.find((service) => service.id === id)
    setSelectedService(serviceToDelete)
    setIsDeleteConfirmationOpen(true)  // Abrir modal de confirmación
  }

  // Función para confirmar la eliminación
  const confirmDelete = () => {
    deleteServiceMutation.mutate(selectedService.id)  // Eliminar servicio
    setSelectedService(null)  // Limpiar servicio seleccionado
    setIsDeleteConfirmationOpen(false)  // Cerrar modal de confirmación
  }

  // Función para cancelar la eliminación
  const cancelDelete = () => {
    setIsDeleteConfirmationOpen(false)  // Cerrar modal de confirmación
    setSelectedService(null)  // Limpiar servicio seleccionado
  }

  // Función para editar un servicio
  const handleEdit = (id) => {
    const serviceToEdit = services.find((service) => service.id === id)
    setSelectedService(serviceToEdit)
    setIsModalOpen(true)  // Abrir modal para editar
  }

  // Función para cancelar la edición
  const handleCancel = () => {
    setSelectedService(null)  // Limpiar servicio seleccionado
    setIsModalOpen(false)  // Cerrar modal de edición
  }

  // Filtrar los servicios con la búsqueda aplicada
  const filteredServices = services.filter(service =>
    [
      service.id,
      service.name,
      service.description,
      service.price,
      service.status ? "activo" : "inactivo"
    ].some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <DashboardGrid className="flex-1">
      <Card>
        <div className="flex flex-col gap-4 mb-3">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Panel de Servicios</h2>
            <Button
              onClick={() => setIsModalOpen(true)}  // Abre el modal de agregar
              className="bg-primary hover:bg-primary/75 dark:hover:bg-primary-dark text-white hover:text-white tracking-wide py-3 px-5 rounded-xl"
            >
              AGREGAR SERVICIO
            </Button>
          </div>
          <SearchBar
            placeholder="Buscar servicio"
            onSearch={setSearchTerm}
            total={filteredServices.length}
          />
        </div>

        {isLoading ? (
          <p>Cargando...</p>  // Si está cargando, muestra este mensaje
        ) : error ? (
          <p>{error.message}</p>  // Si hay un error, muestra el mensaje de error
        ) : filteredServices.length === 0 ? (
          <p className="text-center text-text-light dark:text-text-dark">No hay servicios registrados.</p>
        ) : (
          <Table
            headers={headers}  // Encabezados de la tabla
            data={filteredServices}  // Datos de los servicios filtrados
            onEdit={handleEdit}  // Función para editar
            onDelete={handleDelete}  // Función para eliminar
            searchTerm={searchTerm}
          />
        )}
      </Card>

      {/* Modal para agregar o editar un servicio */}
      {isModalOpen && (
        <ServiceCard
          service={selectedService}
          handleCancel={handleCancel}  // Función para cancelar la edición
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {isDeleteConfirmationOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white dark:bg-background-dark p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              ¿Estás seguro de que deseas eliminar este servicio: <strong>{selectedService.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={cancelDelete}  // Cancela la eliminación
                className="w-full sm:max-w-28 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}  // Confirma la eliminación
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

export default ServicePanel
