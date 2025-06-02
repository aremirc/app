import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSocket } from "@/context/SocketContext"
import { handleToast } from "@/lib/toast"
import api from "@/lib/axios"

export const useUsers = () => {
  const queryClient = useQueryClient()
  const socket = useSocket()

  const { data: users = [], error, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get("/api/users")
      return response.data
    },
  })

  const addUserMutation = useMutation({
    mutationFn: (newUser) => api.post("/api/users", newUser),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries(["users"])
      handleToast("¡Usuario agregado con éxito!")
      if (socket) socket.emit('new-user', newUser)
    },
    onError: () => {
      handleToast("Error al agregar el usuario.", "error")
    }
  })

  const updateUserMutation = useMutation({
    mutationFn: (updatedUser) => api.put("/api/users", updatedUser),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["users"], (prevUsers) =>
        prevUsers.map((user) => (user.dni === updatedUser.dni ? updatedUser : user))
      )
      handleToast("¡Usuario actualizado correctamente!")
      if (socket) socket.emit('user-updated', updatedUser)
    },
    onError: () => {
      handleToast("Error al actualizar el usuario.", "error")
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: (dni) => api.delete("/api/users", { data: { dni } }), // También puedes hacer más acciones relacionadas con la eliminación (como eliminar órdenes asociadas, etc.)
    onSuccess: (dni) => {
      queryClient.invalidateQueries(["users"])
      handleToast("¡Usuario eliminado correctamente!")
      if (socket) socket.emit('user-deleted', dni)
    },
    onError: () => {
      handleToast("Error al eliminar el usuario.", "error")
    }
  })

  return {
    users,
    error,
    isLoading,
    addUserMutation,
    updateUserMutation,
    deleteUserMutation,
  }
}
