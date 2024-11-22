import { useState, useEffect } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import Table from "../molecules/Table";
import Card from "../molecules/Card";
import DashboardGrid from "../templates/DashboardGrid";
import ClientCard from "../molecules/ClientCard"; // Componente para agregar cliente
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const ClientPanel = () => {
  const { logout } = useAuth()
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get("/api/clients");
        setClients(response.data);
        setError(null);
      } catch (error) {
        console.error('Error al obtener los clientes:', error);
        setError('Hubo un error al cargar los clientes.');
        if (error.response && error.response.status === 401) {
          logout()
        }
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  const handleDelete = async (dni) => {
    try {
      const response = await api.delete('/api/clients', { data: { dni } });
      setClients(clients.filter((client) => client.dni !== dni));
      toast.error('¡Eliminado correctamente!', { className: 'dark:border-none dark:bg-background-dark dark:text-danger-dark' });
    } catch (error) {
      toast.error('Error al eliminar el cliente.', { className: 'dark:border-none dark:bg-background-dark dark:text-danger-dark' });
    }
  };

  const handleEdit = (dni) => {
    const clientToEdit = clients.find((client) => client.dni === dni);
    setSelectedClient(clientToEdit);
    console.log(clientToEdit);
    setIsModalOpen(true)
  };

  const handleAddClient = (newClient) => {
    if (newClient.name && newClient.email) {
      setClients([...clients, newClient]);
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false)
    setSelectedClient(null)
  }

  const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardGrid>
      <Card>
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Panel de Clientes</h2>
            <Button onClick={() => setIsModalOpen(true)} className="hover:bg-primary dark:hover:bg-primary-dark">Agregar Cliente</Button>
          </div>
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente"
            className="w-1/3"
          />
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <Table headers={["DNI", "Name", "Email", "Phone", "Address"]} data={filteredClients} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </Card>

      {/* Modal para agregar un nuevo cliente */}
      {isModalOpen && (
        <ClientCard client={selectedClient} handleAddClient={handleAddClient} setIsModalOpen={setIsModalOpen} handleCancel={handleCancel} />
      )}
    </DashboardGrid>
  );
};

export default ClientPanel;
