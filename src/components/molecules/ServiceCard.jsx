import { useState } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import { toast } from "sonner";
import api from "@/lib/axios";

const defaultValues = {
  name: "",
  description: "",
  price: "",
};

const ServiceCard = ({ service, handleAddService, setIsModalOpen, handleCancel }) => {
  const [newService, setNewService] = useState(service ? service : defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addService = async () => {
    const response = await api.post("/api/services", newService);
    handleAddService(response.data); // Actualiza la lista global de servicios
    setNewService(defaultValues); // Resetea el formulario
    toast.success("Servicio agregado con éxito", {
      className: "dark:border-none dark:bg-primary-dark",
    });
  }
  
  const editService = async () => {
    const response = await api.put("/api/services", newService);
    handleAddService(response.data); // Actualiza la lista global de servicios

    toast.success('Cambios guardados correctamente.', { className: 'dark:border-none dark:bg-primary-dark' })
    handleCancel() // Cerramos modal y vaciomos la variable 'order'
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newService.name || !newService.description || !newService.price) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    setIsSubmitting(true);

    try {
      { service ? editService() : addService() }
    } catch (error) {
      toast.error("Hubo un problema al agregar el servicio", {
        description: error.response?.data?.error || error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = newService.name && newService.description && newService.price;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <form onSubmit={handleSubmit} className="min-w-96 bg-background-light dark:bg-text-dark text-text-light p-6 rounded-lg shadow-lg max-w-sm">
        <h3 className="text-lg font-semibold mb-4">{service ? 'Modificar Servicio' : 'Agregar Nuevo Servicio'}</h3>

        <Input
          type="text"
          value={newService.name}
          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
          placeholder="Nombre"
          className="mb-4"
        />

        <Input
          type="text"
          value={newService.description}
          onChange={(e) => setNewService({ ...newService, description: e.target.value })}
          placeholder="Descripción"
          className="mb-4"
        />

        <Input
          type="number"
          value={newService.price}
          onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
          placeholder="Precio"
          className="mb-4"
        />

        <div className="flex justify-end space-x-2">
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button
            type="submit"
            className="hover:bg-primary dark:hover:bg-primary-dark dark:hover:text-background-dark"
            disabled={!isFormValid || isSubmitting}
          >
            {service ? (isSubmitting ? "Guardando..." : "Guardar") : (isSubmitting ? "Agregando..." : "Agregar")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ServiceCard;
