import { useState } from "react"
import { useUsers } from "@/hooks/useUsers"  // Importamos el hook
import Button from "../atoms/Button"
import Table from "../molecules/Table"
import Card from "../molecules/Card"
import DashboardGrid from "./DashboardGrid"
import UserCard from "../molecules/UserCard"
import useRealTimeUpdates from "@/hooks/useRealTimeUpdates"  // Hook para WebSocket
import SearchBar from "../molecules/SearchBar"

const headers = [
  { key: "dni", label: "DNI" },
  { key: "fullName", label: "Nombre de Usuario" },
  { key: "email", label: "Correo Electrónico" },
  { key: "roleName", label: "Rol de Usuario" },
  { key: "createdAt", label: "Fecha de Creación" }
]

const UserPanel = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const { users, error, isLoading, deleteUserMutation } = useUsers()

  // Llamar al hook de WebSocket para recibir actualizaciones en tiempo real
  useRealTimeUpdates()  // Aquí es donde se maneja la lógica WebSocket

  const handleDelete = (dni) => {
    const userToDelete = users.find((user) => user.dni === dni)
    setSelectedUser(userToDelete)
    setIsDeleteConfirmationOpen(true)
  }

  const confirmDelete = () => {
    deleteUserMutation.mutate(selectedUser.dni)
    setSelectedUser(null)
    setIsDeleteConfirmationOpen(false)
  }

  const cancelDelete = () => {
    setIsDeleteConfirmationOpen(false)
    setSelectedUser(null)
  }

  const handleEdit = (dni) => {
    const userToEdit = users.find((user) => user.dni === dni)
    setSelectedUser(userToEdit)
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setSelectedUser(null)
    setIsModalOpen(false)
  }

  const filteredUsers = users.filter((user) =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardGrid>
      <Card>
        <div className="flex flex-col gap-4 mb-3">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Panel de Usuarios</h2>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/75 dark:hover:bg-primary-dark text-white hover:text-white tracking-wide py-3 px-5 rounded-xl"
            >
              AGREGAR USUARIO
            </Button>
          </div>
          <SearchBar
            placeholder="Buscar usuario"
            onSearch={setSearchTerm}
          />
        </div>

        {isLoading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>{error.message}</p>
        ) : (
          <Table
            headers={headers}
            data={filteredUsers.map(user => ({
              ...user,
              fullName: user.firstName + ' ' + user.lastName,
              roleName: user.role?.name
            }))}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Card>

      {isModalOpen && (
        <UserCard
          user={selectedUser}
          handleCancel={handleCancel}
        />
      )}

      {isDeleteConfirmationOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white dark:bg-background-dark p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              ¿Estás seguro de que deseas eliminar este usuario: <strong>{selectedUser.username}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button onClick={cancelDelete} className="w-full sm:max-w-28 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-500">
                Cancelar
              </Button>
              <Button onClick={confirmDelete} className="w-full sm:max-w-28 bg-red-500 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800">
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardGrid>
  )
}

export default UserPanel
