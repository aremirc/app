import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSocket } from "@/context/SocketContext"
import { handleToast } from "@/lib/toast"
import api from "@/lib/axios"

export const useClients = () => {
  const queryClient = useQueryClient()
  const socket = useSocket()

  // Obtener clientes usando react-query
  const { data: clients = [], error, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await api.get("/api/clients")
      return response.data
    },
  })

  // Mutación para agregar un nuevo cliente
  const addClientMutation = useMutation({
    mutationFn: (newClient) => api.post("/api/clients", newClient),
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] }) // Refrescar la lista de clientes
      handleToast("¡Cliente agregado con éxito!")  // Usamos la función utilitaria aquí
      if (socket) {
        // Emitir evento WebSocket cuando se agrega un nuevo cliente
        socket.emit('new-client', newClient)
      }
    },
    onError: (error) => {
      const message =
        error?.response?.data?.error || // si backend usa { error: 'mensaje' }
        error?.response?.data?.message || // si backend usa { message: 'mensaje' }
        "Error al agregar el cliente."
      handleToast(message, "error")  // Usamos la función utilitaria con tipo "error"
    }
  })

  // Mutación para actualizar un cliente
  const updateClientMutation = useMutation({
    mutationFn: (updatedClient) => api.put("/api/clients", updatedClient),
    onSuccess: (updatedClient) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      handleToast("¡Cliente actualizado correctamente!")  // Usamos la función utilitaria aquí
      if (socket) {
        // Emitir evento WebSocket cuando se actualiza un cliente
        socket.emit('client-updated', updatedClient)
      }
    },
    onError: (error) => {
      const message =
        error?.response?.data?.error || // si backend usa { error: 'mensaje' }
        error?.response?.data?.message || // si backend usa { message: 'mensaje' }
        "Error al actualizar el cliente."
      handleToast(message, "error")  // Usamos la función utilitaria con tipo "error"
    }
  })

  // Mutación para eliminar un cliente
  const deleteClientMutation = useMutation({
    mutationFn: (id) => api.delete("/api/clients", { data: { id } }),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] }) // Refrescar la lista de clientes
      handleToast("¡Eliminado correctamente!")  // Usamos la función utilitaria aquí
      if (socket) {
        // Emitir evento WebSocket cuando un cliente es eliminado
        socket.emit('client-deleted', id)
      }
    },
    onError: (error) => {
      const message =
        error?.response?.data?.error || // si backend usa { error: 'mensaje' }
        error?.response?.data?.message || // si backend usa { message: 'mensaje' }
        "Error al eliminar el cliente."
      handleToast(message, "error")  // Usamos la función utilitaria con tipo "error"
    }
  })

  return {
    clients,
    error,
    isLoading,
    addClientMutation,
    updateClientMutation,
    deleteClientMutation,
  }
}
