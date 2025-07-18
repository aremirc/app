import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useClients } from "@/hooks/useClients" // Importamos el hook
import Button from "../atoms/Button"
import Table from "../molecules/Table"
import Card from "../molecules/Card"
import DashboardGrid from "./DashboardGrid"
import ClientCard from "../molecules/ClientCard" // Componente para agregar/editar cliente
import useRealTimeUpdates from "@/hooks/useRealTimeUpdates" // Hook para WebSocket
import SearchBar from "../molecules/SearchBar"

const headers = [
  { key: "id", label: "RUC/DNI" },
  { key: "name", label: "Nombre de Cliente" },
  { key: "phone", label: "Teléfono" },
  { key: "address", label: "Dirección" },
  { key: "email", label: "Correo Electrónico" },
  { key: "isActive", label: "Estado" }
]

const ClientPanel = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")  // Estado para la búsqueda
  const [isModalOpen, setIsModalOpen] = useState(false)  // Control del modal para agregar/editar cliente
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)  // Control del modal de confirmación de eliminación
  const [selectedClient, setSelectedClient] = useState(null)  // Cliente seleccionado
  const { clients, error, isLoading, deleteClientMutation } = useClients()

  // Llamamos al hook de WebSocket para recibir actualizaciones en tiempo real
  useRealTimeUpdates()

  // Funciones para manejo de eliminación de cliente
  const handleDelete = (id) => {
    const clientToDelete = clients.find((client) => client.id === id)
    setSelectedClient(clientToDelete)  // Guardar el cliente seleccionado
    setIsDeleteConfirmationOpen(true)  // Abrir el modal de confirmación
  }

  const confirmDelete = () => {
    deleteClientMutation.mutate(selectedClient.id)  // Llamamos a la mutación para eliminar el cliente
    setSelectedClient(null)
    setIsDeleteConfirmationOpen(false)  // Cerrar el modal de confirmación
  }

  const cancelDelete = () => {
    setIsDeleteConfirmationOpen(false)  // Cerrar el modal sin eliminar
    setSelectedClient(null)
  }

  // Función para editar un cliente
  const handleEdit = (id) => {
    const clientToEdit = clients.find((client) => client.id === id)
    setSelectedClient(clientToEdit)
    setIsModalOpen(true)  // Abrir el modal para editar cliente
  }

  // Función para cancelar la edición
  const handleCancel = () => {
    setSelectedClient(null)
    setIsModalOpen(false)  // Cerrar el modal de edición
  }

  // Filtrar los clientes según la búsqueda con debounce
  const filteredClients = clients.filter(client =>
    [
      client.id,
      client.name,
      client.email,
      client.phone,
      client.address,
      client.isActive ? "activo" : "inactivo" // Si quieres traducirlo para la búsqueda
    ].some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <DashboardGrid className="flex-1">
      <Card>
        <div className="flex flex-col gap-4 mb-3">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Panel de Clientes</h2>
            {user.role.name === 'ADMIN' &&
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary/75 dark:hover:bg-primary-dark text-white hover:text-white tracking-wide py-3 px-5 rounded-xl"
              >
                AGREGAR CLIENTE
              </Button>
            }
          </div>
          <SearchBar
            placeholder="Buscar cliente"
            onSearch={setSearchTerm}
            total={filteredClients.length}
          />
        </div>

        {isLoading ? (
          <p>Cargando...</p>  // Si está cargando, mostramos este mensaje
        ) : error ? (
          <p>{error.message}</p>  // Si hay un error, mostramos el mensaje de error
        ) : filteredClients.length === 0 ? (
          <p className="text-center text-text-light dark:text-text-dark">No hay clientes registrados.</p>
        ) : (
          <Table
            headers={headers}  // Encabezados de la tabla
            data={filteredClients}  // Datos filtrados
            onEdit={handleEdit}  // Función para editar
            onDelete={handleDelete}  // Función para eliminar
            showActions={user.role.name === 'ADMIN'}
            searchTerm={searchTerm}
          />
        )}
      </Card>

      {/* Modal para agregar o editar un cliente */}
      {isModalOpen && (
        <ClientCard
          client={selectedClient}
          handleCancel={handleCancel}  // Función para cancelar la edición/agregado
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {isDeleteConfirmationOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white dark:bg-background-dark p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              ¿Estás seguro de que deseas eliminar este cliente: <strong>{selectedClient.name}</strong>?
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

export default ClientPanel
