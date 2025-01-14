import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSocket } from "@/context/SocketContext";
import api from "@/lib/axios";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import DashboardGrid from "../templates/DashboardGrid";
import VisitCard from "../molecules/VisitCard";
import Table from "../molecules/Table";
import Card from "../molecules/Card";

const VisitPanel = () => {
  const socket = useSocket();  // Acceder al socket desde el contexto
  const [visits, setVisits] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const response = await api.get("/api/visits")
        setVisits(response.data)
        setError(null)
      } catch (error) {
        console.error('Error al obtener las visitas:', error);
        setError('Hubo un error al cargar las visitas.');
      } finally {
        setLoading(false);
      }
    }

    fetchVisits();

    if (socket) {
      socket.on('connect', () => {
        console.log('Conectado al WebSocket');  // Intentar conectar al socket
      });

      socket.on('new-visit', (newVisit) => {
        setVisits((prevVisits) => [newVisit, ...prevVisits]);  // Escuchar eventos de WebSocket para nuevas visitas
      });

      socket.on('connect_error', (error) => {
        console.error('Error en la conexión WebSocket:', error);
      });

      return () => {
        socket.off('new-visit');  // Limpiar el socket al desmontar el componente
        socket.disconnect();  // Desconectar al desmontar
      };
    }
  }, [socket]);

  const handleDelete = async (id) => {
    try {
      const response = await api.delete('/api/visits', { data: { id } });
      setVisits((prevVisits) => prevVisits.filter((visit) => visit.id !== id));
      toast.error('¡Eliminado correctamente!', { className: 'dark:border-none dark:bg-background-dark dark:text-danger-dark' });
    } catch (error) {
      toast.error('Error al eliminar la visita.', { className: 'dark:border-none dark:bg-background-dark dark:text-danger-dark' });
    }
  };

  const handleEdit = (id) => {
    const visitToEdit = visits.find((visit) => visit.id === id);
    setSelectedVisit(visitToEdit);
    console.log(visitToEdit);
    setIsModalOpen(true)
  };

  const handleAddVisit = (newVisit) => {
    if (newVisit.date && newVisit.description) {
      setVisits([...visits, newVisit]);
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false)
    setSelectedVisit(null)
  }

  const filteredVisits = visits.filter((visit) => visit.date.toString().toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardGrid>
      <Card>
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Panel de Visitas</h2>
            <Button onClick={() => setIsModalOpen(true)} className="hover:bg-primary dark:hover:bg-primary-dark">Agregar Visita</Button>
          </div>
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar visita"
            className="w-1/3"
          />
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <Table headers={["Id", "Date", "Description", "OrderId", "WorkerId"]} data={filteredVisits} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </Card>

      {/* Modal para agregar una nueva visita */}
      {isModalOpen && (
        <VisitCard visit={selectedVisit} handleAddVisit={handleAddVisit} setIsModalOpen={setIsModalOpen} handleCancel={handleCancel} />
      )}
    </DashboardGrid>
  );
};

export default VisitPanel;