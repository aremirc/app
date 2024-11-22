import { useEffect, useState } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import { toast } from "sonner";
import api from "@/lib/axios";

// Recuperamos el usuario almacenado en la sesión
// const storedUser = JSON.parse(sessionStorage.getItem('user')) || {};

const defaultValues = {
  date: "",
  description: "",
  orderId: "",
  workerId: "",
  clientId: "",
};

const VisitCard = ({ visit, handleAddVisit, setIsModalOpen, handleCancel }) => {
  const [newVisit, setNewVisit] = useState(visit ? visit : defaultValues);
  const [orders, setOrders] = useState([]); // Lista de órdenes
  const [clients, setClients] = useState([]); // Lista de clientes
  const [workers, setWorkers] = useState([]); // Lista de trabajadores
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrdersAndClients = async () => {
      setLoading(true);
      try {
        const [ordersRes, clientsRes, workersRes] = await Promise.all([
          api.get("/api/orders"),
          api.get("/api/clients"),
          api.get("/api/workers"),
        ]);
        setOrders(ordersRes.data);
        setClients(clientsRes.data);
        setWorkers(workersRes.data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        toast.error("Hubo un problema al cargar los datos.", { description: error.response?.data?.error || error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndClients();
  }, []);

  const addVisit = async () => {
    const response = await api.post("/api/visits", newVisit);
    handleAddVisit(response.data);
    setNewVisit(defaultValues);
    toast.success("Visita agregada correctamente", {
      className: "dark:bg-primary-dark",
    });
  }
  
  const editVisit = async () => {
    const response = await api.put("/api/visits", newVisit);
    handleAddVisit(response.data);

    toast.success('Cambios guardados correctamente.', { className: 'dark:border-none dark:bg-primary-dark' })
    handleCancel() // Cerramos modal y vaciomos la variable 'order'
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newVisit.date || !newVisit.description || !newVisit.orderId || !newVisit.workerId || !newVisit.clientId) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    setIsSubmitting(true);

    try {
      { visit ? editVisit() : addVisit() }
    } catch (error) {
      toast.error("Hubo un problema al agregar la visita", { description: error.response?.data?.error || error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = newVisit.date && newVisit.description && newVisit.orderId && newVisit.workerId && newVisit.clientId;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <form onSubmit={handleSubmit} className="min-w-96 bg-background-light dark:bg-text-dark text-text-light p-6 rounded-lg shadow-lg max-w-sm">
        <h3 className="text-lg font-semibold mb-4">{visit ? 'Modificar Visita' : 'Agregar Nueva Visita'}</h3>

        <Input
          type="date"
          value={newVisit.date}
          onChange={(e) => setNewVisit({ ...newVisit, date: e.target.value })}
          placeholder="Fecha"
          className="mb-4"
        />

        <Input
          type="text"
          value={newVisit.description}
          onChange={(e) => setNewVisit({ ...newVisit, description: e.target.value })}
          placeholder="Descripción"
          className="mb-4"
        />

        <div className="mb-4">
          <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">
            Selecciona una Orden
          </label>
          <select
            id="orderId"
            value={newVisit.orderId}
            onChange={(e) => setNewVisit({ ...newVisit, orderId: Number(e.target.value) })}
            className="shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark"
            disabled={loading}
          >
            <option value="" disabled>
              Selecciona una orden
            </option>
            {loading ? (
              <option value="" disabled>
                Cargando órdenes...
              </option>
            ) : (
              orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.description} - {order.status}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
            Selecciona un Cliente
          </label>
          <select
            id="clientId"
            value={newVisit.clientId}
            onChange={(e) => setNewVisit({ ...newVisit, clientId: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark"
            disabled={loading}
          >
            <option value="" disabled>
              Selecciona un cliente
            </option>
            {loading ? (
              <option value="" disabled>
                Cargando clientes...
              </option>
            ) : (
              clients.map((client) => (
                <option key={client.dni} value={client.dni}>
                  {client.name} - {client.email}
                </option>
              ))
            )}
          </select>
        </div>

        {/* (opcional) */}
        <div className="mb-4">
          <label htmlFor="workerId" className="block text-sm font-medium text-gray-700">
            Selecciona un Trabajador
          </label>
          <select
            id="workerId"
            value={newVisit.workerId}
            onChange={(e) => setNewVisit({ ...newVisit, workerId: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark"
            disabled={loading}
          >
            <option value="" disabled>
              Selecciona un trabajador
            </option>
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

        <div className="flex justify-end space-x-2">
          <Button onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className="hover:bg-primary dark:hover:bg-primary-dark dark:hover:text-background-dark"
            disabled={!isFormValid || loading || isSubmitting}
          >
            {visit ? (isSubmitting ? "Guardando..." : "Guardar") : (isSubmitting ? "Agregando..." : "Agregar")}
          </Button>
        </div>
      </form >
    </div >
  );
};

export default VisitCard;
