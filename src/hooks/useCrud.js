import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/context/SocketContext";
import { handleToast } from "@/lib/toast";
import api from "@/lib/axios";  // Aquí importas la configuración de Axios con el CSRF token incluido

const useCrud = ({ key, endpoint }) => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  // Obtener datos usando react-query
  const { data, error, isLoading } = useQuery({
    queryKey: [key],
    queryFn: async () => {
      const response = await api.get(endpoint);
      return response.data;
    },
  });

  // Mutación para agregar un nuevo registro
  const addMutation = useMutation({
    mutationFn: (newData) => api.post(endpoint, newData),
    onSuccess: (newData) => {
      queryClient.invalidateQueries({ queryKey: [key] }); // Refrescar la lista
      handleToast(`¡${key.slice(0, -1)} agregado con éxito!`);
      if (socket) {
        socket.emit(`${key}-added`, newData);
      }
    },
    onError: () => {
      handleToast(`Error al agregar el ${key.slice(0, -1)}.`, "error");
    }
  });

  // Mutación para actualizar un registro
  const updateMutation = useMutation({
    mutationFn: (updatedData) => api.put(endpoint, updatedData),
    onSuccess: (updatedData) => {
      queryClient.setQueryData([key], (prevData) =>
        prevData.map((item) => (item.id === updatedData.id ? updatedData : item))
      );
      handleToast(`¡${key.slice(0, -1)} actualizado correctamente!`);
      if (socket) {
        socket.emit(`${key}-updated`, updatedData);
      }
    },
    onError: () => {
      handleToast(`Error al actualizar el ${key.slice(0, -1)}.`, "error");
    }
  });

  // Mutación para eliminar un registro
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(endpoint, { data: { id } }),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: [key] });
      handleToast(`¡${key.slice(0, -1)} eliminado correctamente!`);
      if (socket) {
        socket.emit(`${key}-deleted`, id);
      }
    },
    onError: () => {
      handleToast(`Error al eliminar el ${key.slice(0, -1)}.`, "error");
    }
  });

  return {
    data,
    error,
    isLoading,
    addMutation,
    updateMutation,
    deleteMutation,
  };
};

export default useCrud;
