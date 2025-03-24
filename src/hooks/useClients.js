import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/context/SocketContext";
import { handleToast } from "@/lib/toast";
import api from "@/lib/axios";

export const useClients = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  // Obtener clientes usando react-query
  const { data: clients = [], error, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await api.get("/api/clients");
      return response.data;
    },
  });

  // Mutación para agregar un nuevo cliente
  const addClientMutation = useMutation({
    mutationFn: (newClient) => api.post("/api/clients", newClient),
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] }); // Refrescar la lista de clientes
      handleToast("¡Cliente agregado con éxito!");  // Usamos la función utilitaria aquí
      if (socket) {
        // Emitir evento WebSocket cuando se agrega un nuevo cliente
        socket.emit('new-client', newClient);
      }
    },
    onError: () => {
      handleToast("Error al agregar el cliente.", "error");  // Usamos la función utilitaria con tipo "error"
    }
  });

  // Mutación para actualizar un cliente
  const updateClientMutation = useMutation({
    mutationFn: (updatedClient) => api.put("/api/clients", updatedClient),
    onSuccess: (updatedClient) => {
      queryClient.setQueryData(['clients'], (prevClients) =>
        prevClients.map((client) => (client.dni === updatedClient.dni ? updatedClient : client))
      );
      handleToast("¡Cliente actualizado correctamente!");  // Usamos la función utilitaria aquí
      if (socket) {
        // Emitir evento WebSocket cuando se actualiza un cliente
        socket.emit('client-updated', updatedClient);
      }
    },
    onError: () => {
      handleToast("Error al actualizar el cliente.", "error");  // Usamos la función utilitaria con tipo "error"
    }
  });

  // Mutación para eliminar un cliente
  const deleteClientMutation = useMutation({
    mutationFn: (dni) => api.delete("/api/clients", { data: { dni } }),
    onSuccess: (dni) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] }); // Refrescar la lista de clientes
      handleToast("¡Eliminado correctamente!");  // Usamos la función utilitaria aquí
      if (socket) {
        // Emitir evento WebSocket cuando un cliente es eliminado
        socket.emit('client-deleted', dni);
      }
    },
    onError: () => {
      handleToast("Error al eliminar el cliente.", "error");  // Usamos la función utilitaria con tipo "error"
    }
  });

  return {
    clients,
    error,
    isLoading,
    addClientMutation,
    updateClientMutation,
    deleteClientMutation,
  };
};
