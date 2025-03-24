import { useState } from "react";
import { useVisits } from "@/hooks/useVisits";  // Importamos el hook
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import Table from "../molecules/Table";
import Card from "../molecules/Card";
import DashboardGrid from "../templates/DashboardGrid";
import VisitCard from "../molecules/VisitCard";
import { useDebounce } from "@/hooks/useDebounce";
import useRealTimeUpdates from "@/hooks/useRealTimeUpdates";  // Hook para WebSocket

const VisitPanel = () => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const { visits, error, isLoading, deleteVisitMutation } = useVisits();

  // Llamar al hook de WebSocket para recibir actualizaciones en tiempo real
  useRealTimeUpdates();  // Aquí es donde se maneja la lógica WebSocket

  const handleDelete = (id) => {
    const visitToDelete = visits.find((visit) => visit.id === id);
    setSelectedVisit(visitToDelete);
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDelete = () => {
    deleteVisitMutation.mutate(selectedVisit.id);
    setSelectedVisit(null);
    setIsDeleteConfirmationOpen(false);
  };

  const cancelDelete = () => {
    setIsDeleteConfirmationOpen(false);
    setSelectedVisit(null);
  };

  const handleEdit = (id) => {
    const visitToEdit = visits.find((visit) => visit.id === id);
    setSelectedVisit(visitToEdit);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setSelectedVisit(null);
    setIsModalOpen(false);
  };

  const debouncedSearch = useDebounce(search, 500);

  // Filtrar las visitas por la fecha con el debounce
  const filteredVisits = visits.filter((visit) =>
    visit.date.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <DashboardGrid>
      <Card>
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Panel de Visitas</h2>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="hover:bg-primary dark:hover:bg-primary-dark"
            >
              Agregar Visita
            </Button>
          </div>
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar visita"
            className="w-1/3"
          />
        </div>

        {isLoading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>{error.message}</p>
        ) : (
          <Table
            headers={["Id", "Date", "Description", "OrderId", "WorkerId"]}
            data={filteredVisits}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Card>

      {isModalOpen && (
        <VisitCard
          visit={selectedVisit}
          handleCancel={handleCancel}
        />
      )}

      {isDeleteConfirmationOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white dark:bg-background-dark p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              ¿Estás seguro de que deseas eliminar esta visita: <strong>{selectedVisit.description}</strong>?
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

export default VisitPanel;
