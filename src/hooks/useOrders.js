import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSocket } from "@/context/SocketContext"
import { handleToast } from "@/lib/toast"
import api from "@/lib/axios"

export const useOrders = () => {
  const queryClient = useQueryClient()
  const socket = useSocket()

  // Consultar las órdenes
  const { data: orders = [], error, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get("/api/orders")
      return response.data
    },
  })

  // Mutación para agregar una nueva orden
  const addOrderMutation = useMutation({
    mutationFn: (newOrder) => api.post('/api/orders', newOrder),
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      handleToast('¡Orden agregada con éxito!')  // Usamos la función utilitaria aquí
      if (socket) socket.emit('new-order', newOrder)
    },
    onError: (error) => {
      const message =
        error?.response?.data?.error || // si backend usa { error: 'mensaje' }
        error?.response?.data?.message || // si backend usa { message: 'mensaje' }
        'Error al agregar la orden.'
      handleToast(message, 'error')  // Usamos la función utilitaria con tipo "error"
    },
  })

  // Mutación para actualizar una orden
  const updateOrderMutation = useMutation({
    mutationFn: (updatedOrder) => api.put('/api/orders', updatedOrder),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      handleToast('¡Orden actualizada correctamente!')  // Usamos la función utilitaria aquí
      if (socket) socket.emit('order-updated', updatedOrder)
    },
    onError: (error) => {
      const message =
        error?.response?.data?.error || // si backend usa { error: 'mensaje' }
        error?.response?.data?.message || // si backend usa { message: 'mensaje' }
        'Error al actualizar la orden.'
      handleToast(message, 'error')  // Usamos la función utilitaria con tipo "error"
    },
  })

  // Mutación para eliminar una orden
  const deleteOrderMutation = useMutation({
    mutationFn: (id) => api.delete('/api/orders', { data: { id } }),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      handleToast('¡Eliminado correctamente!')  // Usamos la función utilitaria aquí
      if (socket) socket.emit('order-deleted', id)
    },
    onError: (error) => {
      const message =
        error?.response?.data?.error || // si backend usa { error: 'mensaje' }
        error?.response?.data?.message || // si backend usa { message: 'mensaje' }
        'Error al eliminar la orden.'
      handleToast(message, 'error')  // Usamos la función utilitaria con tipo "error"
    },
  })

  return {
    orders,
    error,
    isLoading,
    addOrderMutation,
    updateOrderMutation,
    deleteOrderMutation,
  }
}
