import { useState } from "react";
import { useOrders } from "@/hooks/useOrders"; // Importamos el hook
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import Table from "../molecules/Table";
import Card from "../molecules/Card";
import DashboardGrid from "../templates/DashboardGrid";
import OrderCard from "../molecules/OrderCard";
import { useDebounce } from "@/hooks/useDebounce";
import useRealTimeUpdates from "@/hooks/useRealTimeUpdates"; // Hook para WebSocket

const OrderPanel = () => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { orders, error, isLoading, deleteOrderMutation } = useOrders();

  // Llamar al hook de WebSocket para recibir actualizaciones en tiempo real
  useRealTimeUpdates(); // Aquí es donde se maneja la lógica WebSocket

  const handleDelete = (id) => {
    const orderToDelete = orders.find((order) => order.id === id);
    setSelectedOrder(orderToDelete);
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDelete = () => {
    deleteOrderMutation.mutate(selectedOrder.id);
    setSelectedOrder(null);
    setIsDeleteConfirmationOpen(false);
  };

  const cancelDelete = () => {
    setIsDeleteConfirmationOpen(false);
    setSelectedOrder(null);
  };

  const handleEdit = (id) => {
    const orderToEdit = orders.find((order) => order.id === id);
    setSelectedOrder(orderToEdit);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const debouncedSearch = useDebounce(search, 500);

  // Filtrar las órdenes por la descripción con el debounce
  const filteredOrders = orders.filter((order) =>
    order.description.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <DashboardGrid>
      <Card>
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Panel de Órdenes</h2>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="hover:bg-primary dark:hover:bg-primary-dark"
            >
              Agregar Orden
            </Button>
          </div>
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar orden"
            className="w-1/3"
          />
        </div>

        {isLoading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>{error.message}</p>
        ) : (
          <Table
            headers={["Id", "Description", "ClientId", "Status", "CreatedAt"]}
            data={filteredOrders}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
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
  );
};

export default OrderPanel;
