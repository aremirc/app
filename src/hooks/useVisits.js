import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSocket } from "@/context/SocketContext"
import { handleToast } from "@/lib/toast"
import api from "@/lib/axios"

export const useVisits = () => {
  const queryClient = useQueryClient()
  const socket = useSocket()

  // Usar react-query para obtener visitas
  const { data: visits = [], error, isLoading } = useQuery({
    queryKey: ["visits"],
    queryFn: async () => {
      const response = await api.get("/api/visits")
      return response.data
    },
  })

  // Mutación para agregar una nueva visita
  const addVisitMutation = useMutation({
    mutationFn: (newVisit) => api.post("/api/visits", newVisit),
    onSuccess: (newVisit) => {
      queryClient.invalidateQueries({ queryKey: ["visits"] })
      handleToast("¡Visita agregada correctamente!")  // Usamos la función utilitaria aquí
      if (socket) {
        // Emitir evento WebSocket cuando se agrega una nueva visita
        socket.emit("new-visit", newVisit)
      }
    },
    onError: (error) => {
      const message =
        error?.response?.data?.error || // si backend usa { error: 'mensaje' }
        error?.response?.data?.message || // si backend usa { message: 'mensaje' }
        "Error al agregar la visita."
      handleToast(message, "error")  // Usamos la función utilitaria con tipo "error"
    },
  })

  // Mutación para actualizar una visita (PUT)
  const updateVisitMutation = useMutation({
    // mutationFn: (updatedVisit) => api.put(`/api/visits/${updatedVisit.id}`, updatedVisit),
    mutationFn: (updatedVisit) => api.put("/api/visits", updatedVisit),
    onSuccess: (updatedVisit) => {
      queryClient.invalidateQueries({ queryKey: ["visits"] })
      handleToast("¡Visita actualizada correctamente!")  // Usamos la función utilitaria aquí
      if (socket) {
        // Emitir evento WebSocket cuando se actualiza una visita
        socket.emit("visit-updated", updatedVisit)
      }
    },
    onError: (error) => {
      const message =
        error?.response?.data?.error || // si backend usa { error: 'mensaje' }
        error?.response?.data?.message || // si backend usa { message: 'mensaje' }
        "Error al actualizar la visita."
      handleToast(message, "error")  // Usamos la función utilitaria con tipo "error"
    },
  })

  // Mutación para eliminar una visita
  const deleteVisitMutation = useMutation({
    mutationFn: (id) => api.delete("/api/visits", { data: { id } }),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["visits"] })
      handleToast("¡Visita eliminada correctamente!")  // Usamos la función utilitaria aquí
      if (socket) {
        // Emitir evento WebSocket cuando se elimina una visita
        socket.emit("visit-deleted", id)
      }
    },
    onError: (error) => {
      const message =
        error?.response?.data?.error || // si backend usa { error: 'mensaje' }
        error?.response?.data?.message || // si backend usa { message: 'mensaje' }
        "Error al eliminar la visita."
      handleToast(message, "error")  // Usamos la función utilitaria con tipo "error"
    },
  })

  return {
    visits,
    error,
    isLoading,
    addVisitMutation,
    updateVisitMutation,
    deleteVisitMutation,
  }
}
