import { useState, useEffect } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import { toast } from "sonner";
import api from "@/lib/axios";

const orderStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const defaultValues = {
  description: "",
  status: orderStatuses[0],
  clientId: "",
  workerId: "",
  services: [],
};

const OrderCard = ({ order, handleAddOrder, setIsModalOpen, handleCancel }) => {
  const [newOrder, setNewOrder] = useState(order ? order : defaultValues);
  const [clients, setClients] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchClientsWorkersAndServices = async () => {
      setLoading(true);
      try {
        const [clientsRes, workersRes, servicesRes] = await Promise.all([
          api.get("/api/clients"),
          api.get("/api/workers"),
          api.get("/api/services"),
        ]);
        setClients(clientsRes.data);
        setWorkers(workersRes.data);
        setServices(servicesRes.data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        toast.error("Hubo un problema al cargar los datos.", { description: error.response?.data?.error || error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchClientsWorkersAndServices();
  }, []);

  const addOrder = async () => {
    const response = await api.post("/api/orders", newOrder);
    handleAddOrder(response.data);
    setNewOrder(defaultValues);
    toast.success("¡Orden agregada correctamente!");
  }

  const editOrder = async () => {
    const response = await api.put("/api/orders", newOrder);
    handleAddOrder(response.data);
    
    toast.success('Cambios guardados correctamente.', { className: 'dark:border-none dark:bg-primary-dark' })
    handleCancel() // Cerramos modal y vaciomos la variable 'order'
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      { order ? editOrder() : addOrder() }
    } catch (error) {
      toast.error("Error al agregar la orden", { description: error.response?.data?.error || error.message });
    } finally {
      setIsSubmitting(false);  // Asegurarse de que el botón vuelva a su estado original
    }
  };

  const isFormValid =
    newOrder.description.trim() !== "" &&
    newOrder.clientId !== "" &&
    newOrder.workerId !== "" &&
    newOrder.status !== "" &&
    newOrder.services.length > 0;

  const handleServiceChange = (serviceId) => {
    setNewOrder((prevOrder) => {
      const updatedServices = prevOrder.services.includes(serviceId)
        ? prevOrder.services.filter((id) => id !== serviceId)
        : [...prevOrder.services, serviceId];
      return { ...prevOrder, services: updatedServices };
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <form onSubmit={handleSubmit} className="min-w-96 bg-background-light dark:bg-text-dark text-text-light p-6 rounded-lg shadow-lg max-w-sm">
        <h3 className="text-lg font-semibold mb-4">{order ? 'Modificar Orden' : 'Agregar Nueva Orden'}</h3>

        <Input
          type="text"
          value={newOrder.description}
          onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
          placeholder="Descripción de la orden"
          className="mb-4"
        />

        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Estado de la Orden
          </label>
          <select
            id="status"
            value={newOrder.status}
            onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark"
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
            Selecciona un Cliente
          </label>
          <select
            id="clientId"
            value={newOrder.clientId}
            onChange={(e) => setNewOrder({ ...newOrder, clientId: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark"
            disabled={loading}
          >
            <option value="" disabled>Selecciona un cliente</option>
            {loading ? (
              <option value="" disabled>
                Cargando clientes...
              </option>
            ) : (
              clients.map((client) => (
                <option key={client.dni} value={client.dni}>
                  {client.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="workerId" className="block text-sm font-medium text-gray-700">
            Selecciona un Trabajador
          </label>
          <select
            id="workerId"
            value={newOrder.workerId}
            onChange={(e) => setNewOrder({ ...newOrder, workerId: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark"
            disabled={loading}
          >
            <option value="" disabled>Selecciona un trabajador</option>
            {loading ? (
              <option value="" disabled>
                Cargando trabajadores...
              </option>
            ) : (
              workers.map((worker) => (
                <option key={worker.dni} value={worker.dni}>
                  {worker.firstName} {worker.lastName}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="services" className="block text-sm font-medium text-gray-700">
            {order ? "Servicios" : "Selecciona Servicios"}
          </label>
          <div className="space-y-2">
            {loading ? (
              <p>Cargando servicios...</p>
            ) : (
              services.map((service) => (
                <div key={service.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`service-${service.id}`}
                    value={service.id}
                    checked={newOrder.services.find((serv) => serv.id === service.id)}
                    onChange={() => handleServiceChange(service.id)}
                    className="mr-2"
                    disabled={order}
                  />
                  <label htmlFor={`service-${service.id}`} className="text-sm text-gray-700">
                    {service.name} - ${service.price}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className="hover:bg-primary dark:hover:bg-primary-dark dark:hover:text-background-dark"
            disabled={!isFormValid || loading || isSubmitting}
          >
            {order ? (isSubmitting ? "Guardando..." : "Guardar") : (isSubmitting ? "Agregando..." : "Agregar")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderCard;
