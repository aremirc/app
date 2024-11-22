import { useState, useEffect } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import Table from "../molecules/Table";
import Card from "../molecules/Card";
import DashboardGrid from "../templates/DashboardGrid";
import OrderCard from "../molecules/OrderCard"; // Componente para agregar orden
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const OrderPanel = () => {
  const { logout } = useAuth()
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/api/orders");
        setOrders(response.data);
        setError(null);
      } catch (error) {
        console.error('Error al obtener las órdenes:', error);
        setError('Hubo un error al cargar las órdenes.');
        if (error.response && error.response.status === 401) {
          logout()
        }
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await api.delete('/api/orders', { data: { id } });
      setOrders(orders.filter((order) => order.id !== id));
      toast.error('¡Eliminado correctamente!', { className: 'dark:border-none dark:bg-background-dark dark:text-danger-dark' });
    } catch (error) {
      toast.error('Error al eliminar la orden.', { className: 'dark:border-none dark:bg-background-dark dark:text-danger-dark' });
    }
  };

  const handleEdit = (id) => {
    const orderToEdit = orders.find((order) => order.id === id);
    setSelectedOrder(orderToEdit);
    console.log(orderToEdit);
    setIsModalOpen(true)
  };

  const handleAddOrder = (newOrder) => {
    if (newOrder.description && newOrder.status) {
      setOrders([...orders, newOrder]);
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  const filteredOrders = orders.filter((order) => order.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardGrid>
      <Card>
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Panel de Órdenes</h2>
            <Button onClick={() => setIsModalOpen(true)} className="hover:bg-primary dark:hover:bg-primary-dark">Agregar Orden</Button>
          </div>
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar orden"
            className="w-1/3"
          />
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <Table headers={["Id", "Description", "ClientId", "Status", "CreatedAt"]} data={filteredOrders} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </Card>

      {/* Modal para agregar una nueva orden */}
      {isModalOpen && (
        <OrderCard order={selectedOrder} handleAddOrder={handleAddOrder} setIsModalOpen={setIsModalOpen} handleCancel={handleCancel} />
      )}
    </DashboardGrid>
  );
};

export default OrderPanel;
