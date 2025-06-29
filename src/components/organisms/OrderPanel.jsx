import { useState } from "react"
import { useOrders } from "@/hooks/useOrders" // Importamos el hook
import Button from "../atoms/Button"
import Table from "../molecules/Table"
import Card from "../molecules/Card"
import DashboardGrid from "./DashboardGrid"
import OrderCard from "../molecules/OrderCard"
import useRealTimeUpdates from "@/hooks/useRealTimeUpdates" // Hook para WebSocket
import SearchBar from "../molecules/SearchBar"
import { useAuth } from "@/context/AuthContext"

const headers = [
  { key: "client", label: "Cliente" },
  { key: "id", label: "ID de Orden" },
  { key: "status", label: "Estado" },
  { key: "description", label: "Descripción" },
  // { key: "createdAt", label: "Fecha de Creación" }
  { key: "isResponsible", label: "Técnico Asignado" }
]

const OrderPanel = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const { orders, error, isLoading, deleteOrderMutation } = useOrders()

  // Llamar al hook de WebSocket para recibir actualizaciones en tiempo real
  useRealTimeUpdates() // Aquí es donde se maneja la lógica WebSocket

  const handleDelete = (id) => {
    const orderToDelete = orders.find((order) => order.id === id)
    setSelectedOrder(orderToDelete)
    setIsDeleteConfirmationOpen(true)
  }

  const confirmDelete = () => {
    deleteOrderMutation.mutate(selectedOrder.id)
    setSelectedOrder(null)
    setIsDeleteConfirmationOpen(false)
  }

  const cancelDelete = () => {
    setIsDeleteConfirmationOpen(false)
    setSelectedOrder(null)
  }

  const handleEdit = (id) => {
    const orderToEdit = orders.find((order) => order.id === id)
    setSelectedOrder(orderToEdit)
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setSelectedOrder(null)
    setIsModalOpen(false)
  }

  // Filtrar las órdenes por la descripción con el debounce
  const filteredOrders = orders.filter(order =>
    [
      order.id,
      order.status,
      order.description,
      order.createdAt,
      order.client?.name // para acceder al nombre del cliente directamente
    ].some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <DashboardGrid className="flex-1">
      <Card>
        <div className="flex flex-col gap-4 mb-3">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Panel de Órdenes</h2>
            {user.role.name === 'ADMIN' &&
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary/75 dark:hover:bg-primary-dark text-white hover:text-white tracking-wide py-3 px-5 rounded-xl"
              >
                AGREGAR ORDEN
              </Button>
            }
          </div>
          <SearchBar
            placeholder="Buscar orden"
            onSearch={setSearchTerm}
            total={filteredOrders.length}
          />
        </div>

        {isLoading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>{error.message}</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center text-text-light dark:text-text-dark">No hay órdenes registradas.</p>
        ) : (
          <Table
            headers={headers}
            data={filteredOrders.map(order => {
              const responsable = order.workers.find(w => w.isResponsible)?.user

              return {
                ...order,
                client: order.client?.name,
                isResponsible: `${responsable?.firstName?.split(" ")[0] ?? "-"} ${responsable?.lastName?.split(" ")[0] ?? "-"}`
              }
            })}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showActions={user.role.name === 'ADMIN'}
            searchTerm={searchTerm}
          />
        )}
      </Card>

      {isModalOpen && (
        <OrderCard
          order={selectedOrder}
          handleCancel={handleCancel}
        />
      )}

      {isDeleteConfirmationOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-white dark:bg-background-dark p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              ¿Estás seguro de que deseas eliminar esta orden: <strong>{selectedOrder.description}</strong>?
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

export default OrderPanel
