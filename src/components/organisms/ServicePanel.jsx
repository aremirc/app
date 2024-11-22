import { useState, useEffect } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import ServiceCard from "../molecules/ServiceCard";
import Table from "../molecules/Table";
import Card from "../molecules/Card";
import DashboardGrid from "../templates/DashboardGrid";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const ServicePanel = () => {
  const { logout } = useAuth()
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get("/api/services")
        setServices(response.data)
        setError(null)
      } catch (error) {
        console.error('Error al obtener los servicios:', error);
        setError('Hubo un error al cargar los servicios.');
        if (error.response && error.response.status === 401) {
          logout()
        }
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await api.delete('/api/services', { data: { id } });
      setServices((prevServices) => prevServices.filter((service) => service.id !== id));
      toast.error('¡Eliminado correctamente!', { className: 'dark:border-none dark:bg-background-dark dark:text-danger-dark' });
    } catch (error) {
      toast.error('Error al eliminar el servicio.', { className: 'dark:border-none dark:bg-background-dark dark:text-danger-dark' });
    }
  };

  const handleEdit = (id) => {
    const serviceToEdit = services.find((service) => service.id === id);
    setSelectedService(serviceToEdit);
    console.log(serviceToEdit);
    setIsModalOpen(true)
  };

  const handleAddService = (newService) => {
    if (newService.name && newService.description) {
      setServices([...services, newService]);
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false)
    setSelectedService(null)
  }

  const filteredServices = services.filter((service) => service.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardGrid>
      <Card>
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Panel de Servicios</h2>
            <Button onClick={() => setIsModalOpen(true)} className="hover:bg-primary dark:hover:bg-primary-dark">Agregar Servicio</Button>
          </div>
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar servicio"
            className="w-1/3"
          />
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <Table headers={["Id", "Name", "Description", "Price"]} data={filteredServices} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </Card>

      {/* Modal para agregar un nuevo servicio */}
      {isModalOpen && (
        <ServiceCard service={selectedService} handleAddService={handleAddService} setIsModalOpen={setIsModalOpen} handleCancel={handleCancel} />
      )}
    </DashboardGrid>
  );
};

export default ServicePanel;