import { useState } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import { toast } from "sonner";
import api from "@/lib/axios";  // Asegúrate de importar correctamente tu cliente API

const defaultValues = {
  dni: "",
  name: "",
  email: "",
  phone: "",
  address: "",
};

const ClientCard = ({ client, handleAddClient, setIsModalOpen, handleCancel }) => {
  const [newClient, setNewClient] = useState(client ? client : defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para validar el correo electrónico
  const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const isValidDNI = (dni) => /^\d{8}$/.test(dni);  // Validación simple para DNI (8 dígitos numéricos)

  const addClient = async () => {
    const response = await api.post("/api/clients", newClient);
    handleAddClient(response.data);  // Actualiza el estado global
    setNewClient(defaultValues);  // Limpiar el formulario
    toast.success("Cliente agregado con éxito", {
      className: "dark:border-none dark:bg-primary-dark",
    });
  }

  const editClient = async () => {
    const response = await api.put("/api/clients", newClient);
    handleAddClient(response.data);  // Actualiza el estado global

    toast.success('Cambios guardados correctamente.', { className: 'dark:border-none dark:bg-primary-dark' })
    handleCancel() // Cerramos modal y vaciomos la variable 'order'
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que todos los campos estén completos y que el email y DNI sean válidos
    if (!newClient.dni || !newClient.name || !newClient.email || !newClient.phone || !newClient.address) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    if (!isValidEmail(newClient.email)) {
      toast.error("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    if (!isValidDNI(newClient.dni)) {
      toast.error("Por favor, ingresa un DNI válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      { client ? editClient() : addClient() }
    } catch (error) {
      toast.error("Hubo un problema al agregar el cliente", {
        description: error.response?.data?.error || error.message || "Ocurrió un error inesperado.",
      });
    } finally {
      setIsSubmitting(false);  // Asegurarse de que el botón vuelva a su estado original
    }
  };

  const isFormValid =
    newClient.dni.trim() !== "" &&
    newClient.name.trim() !== "" &&
    newClient.email.trim() !== "" &&
    newClient.phone.trim() !== "" &&
    newClient.address.trim() !== "" &&
    isValidEmail(newClient.email) &&
    isValidDNI(newClient.dni);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <form onSubmit={handleSubmit} className="min-w-96 bg-background-light dark:bg-text-dark text-text-light p-6 rounded-lg shadow-lg max-w-sm">
        <h3 className="text-lg font-semibold mb-4">{client ? 'Modificar Cliente' : 'Agregar Nuevo Cliente'}</h3>

        <Input
          type="text"
          value={newClient.dni}
          onChange={(e) => setNewClient({ ...newClient, dni: e.target.value })}
          placeholder="DNI"
          className="mb-4"
          disabled={client}
        />

        <Input
          type="text"
          value={newClient.name}
          onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
          placeholder="Nombre"
          className="mb-4"
        />

        <Input
          type="email"
          value={newClient.email}
          onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
          placeholder="Correo electrónico"
          className="mb-4"
        />

        <Input
          type="text"
          value={newClient.phone}
          onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
          placeholder="Teléfono"
          className="mb-4"
        />

        <Input
          type="text"
          value={newClient.address}
          onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
          placeholder="Dirección"
          className="mb-4"
        />

        <div className="flex justify-end space-x-2">
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button
            type="submit"
            className="hover:bg-primary dark:hover:bg-primary-dark dark:hover:text-background-dark"
            disabled={!isFormValid || isSubmitting} // Deshabilitar el botón si el formulario no es válido
          >
            {client ? (isSubmitting ? "Guardando..." : "Guardar") : (isSubmitting ? "Agregando..." : "Agregar")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClientCard;
