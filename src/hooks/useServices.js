import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/context/SocketContext";
import { handleToast } from "@/lib/toast";
import api from "@/lib/axios";

export const useServices = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  // Obtener servicios con react-query
  const { data: services = [], error, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await api.get("/api/services");
      return response.data;
    },
  });

  // Mutación para agregar un nuevo servicio
  const addServiceMutation = useMutation({
    mutationFn: (newService) => api.post("/api/services", newService),
    onSuccess: (newService) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      handleToast("¡Servicio agregado correctamente!");  // Usamos la función utilitaria aquí
      if (socket) {
        // Emitir evento WebSocket cuando se agrega un nuevo servicio
        socket.emit('new-service', newService);
      }
    },
    onError: () => {
      handleToast("Error al agregar el servicio.", "error");  // Usamos la función utilitaria con tipo "error"
    },
  });

  // Mutación para actualizar un servicio
  const updateServiceMutation = useMutation({
    mutationFn: (updatedService) => api.put("/api/services", updatedService),
    onSuccess: (updatedService) => {
      queryClient.setQueryData(['services'], (prevServices) =>
        prevServices.map((service) => (service.id === updatedService.id ? updatedService : service))
      );
      handleToast("¡Servicio actualizado correctamente!");  // Usamos la función utilitaria aquí
      if (socket) {
        // Emitir evento WebSocket cuando se actualiza un servicio
        socket.emit('service-updated', updatedService);
      }
    },
    onError: () => {
      handleToast("Error al actualizar el servicio.", "error");  // Usamos la función utilitaria con tipo "error"
    },
  });

  // Mutación para eliminar un servicio
  const deleteServiceMutation = useMutation({
    mutationFn: (id) => api.delete("/api/services", { data: { id } }),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      handleToast("¡Servicio eliminado correctamente!");  // Usamos la función utilitaria aquí
      if (socket) {
        // Emitir evento WebSocket cuando se elimina un servicio
        socket.emit('service-deleted', id);
      }
    },
    onError: () => {
      handleToast("Error al eliminar el servicio.", "error");  // Usamos la función utilitaria con tipo "error"
    },
  });

  return {
    services,
    error,
    isLoading,
    addServiceMutation,
    updateServiceMutation,
    deleteServiceMutation,
  };
};
