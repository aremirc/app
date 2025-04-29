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
    mutationFn: async (newUser) => {
      // Primero, agregar al usuario
      const userResponse = await api.post("/api/users", newUser)
      
      // Luego, agregar al trabajador
      const workerResponse = await api.post("/api/workers", newUser)
  
      return { userResponse, workerResponse } // Devuelve ambas respuestas para sincronizar
    },
    onSuccess: (newUser) => {
      queryClient.invalidateQueries(["users"])
      queryClient.invalidateQueries(["workers"])
      handleToast("¡Usuario agregado con éxito!")
      if (socket) socket.emit('new-user', newUser)
    },
    onError: () => {
      handleToast("Error al agregar el usuario.", "error")
    }
  })  

  const updateUserMutation = useMutation({
    mutationFn: async (updatedUser) => {
      // Actualiza el usuario
      const userResponse = await api.put("/api/users", updatedUser)
  
      // Actualiza el trabajador
      const workerResponse = await api.put("/api/workers", updatedUser)
  
      return { userResponse, workerResponse } // Devuelve ambas respuestas para sincronizar
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["users"], (prevUsers) =>
        prevUsers.map((user) => (user.dni === updatedUser.dni ? updatedUser : user))
      )
      queryClient.setQueryData(["workers"], (prevWorkers) =>
        prevWorkers.map((worker) => (worker.dni === updatedUser.dni ? updatedUser : worker))
      )
      handleToast("¡Usuario actualizado correctamente!")
      if (socket) socket.emit('user-updated', updatedUser)
    },
    onError: () => {
      handleToast("Error al actualizar el usuario.", "error")
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (dni) => {
      // Elimina al usuario
      await api.delete("/api/users", { data: { dni } })
      
      // Elimina al trabajador
      await api.delete("/api/workers", { data: { dni } })
  
      // También puedes hacer más acciones relacionadas con la eliminación (como eliminar órdenes asociadas, etc.)
    },
    onSuccess: (dni) => {
      queryClient.invalidateQueries(["users"])
      queryClient.invalidateQueries(["workers"])
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
