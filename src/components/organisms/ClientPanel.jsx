import { useState } from "react";
import { useClients } from "@/hooks/useClients"; // Importamos el hook
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import Table from "../molecules/Table";
import Card from "../molecules/Card";
import DashboardGrid from "../templates/DashboardGrid";
import ClientCard from "../molecules/ClientCard"; // Componente para agregar/editar cliente
import { useDebounce } from "@/hooks/useDebounce";
import useRealTimeUpdates from "@/hooks/useRealTimeUpdates"; // Hook para WebSocket

const ClientPanel = () => {
  const [search, setSearch] = useState("");  // Estado para la búsqueda
  const [isModalOpen, setIsModalOpen] = useState(false);  // Control del modal para agregar/editar cliente
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);  // Control del modal de confirmación de eliminación
  const [selectedClient, setSelectedClient] = useState(null);  // Cliente seleccionado
  const { clients, error, isLoading, deleteClientMutation } = useClients();

  // Llamamos al hook de WebSocket para recibir actualizaciones en tiempo real
  useRealTimeUpdates(); 

  // Funciones para manejo de eliminación de cliente
  const handleDelete = (dni) => {
    const clientToDelete = clients.find((client) => client.dni === dni);
    setSelectedClient(clientToDelete);  // Guardar el cliente seleccionado
    setIsDeleteConfirmationOpen(true);  // Abrir el modal de confirmación
  };

  const confirmDelete = () => {
    deleteClientMutation.mutate(selectedClient.dni);  // Llamamos a la mutación para eliminar el cliente
    setSelectedClient(null);
    setIsDeleteConfirmationOpen(false);  // Cerrar el modal de confirmación
  };

  const cancelDelete = () => {
    setIsDeleteConfirmationOpen(false);  // Cerrar el modal sin eliminar
    setSelectedClient(null);
  };

  // Función para editar un cliente
  const handleEdit = (dni) => {
    const clientToEdit = clients.find((client) => client.dni === dni);
    setSelectedClient(clientToEdit);
    setIsModalOpen(true);  // Abrir el modal para editar cliente
  };

  // Función para cancelar la edición
  const handleCancel = () => {
    setSelectedClient(null);
    setIsModalOpen(false);  // Cerrar el modal de edición
  };

  // Configuración de búsqueda con debounce
  const debouncedSearch = useDebounce(search, 500);

  // Filtrar los clientes según la búsqueda con debounce
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <DashboardGrid>
      <Card>
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Panel de Clientes</h2>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="hover:bg-primary dark:hover:bg-primary-dark"
            >
              Agregar Cliente
            </Button>
          </div>
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}  // Actualiza la búsqueda
            placeholder="Buscar cliente"
            className="w-1/3"
          />
        </div>

        {isLoading ? (
          <p>Cargando...</p>  // Si está cargando, mostramos este mensaje
        ) : error ? (
          <p>{error.message}</p>  // Si hay un error, mostramos el mensaje de error
        ) : (
          <Table
            headers={["DNI", "Name", "Email", "Phone", "Address"]}  // Encabezados de la tabla
            data={filteredClients}  // Datos filtrados
            onEdit={handleEdit}  // Función para editar
            onDelete={handleDelete}  // Función para eliminar
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
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
  );
};

export default ClientPanel;
