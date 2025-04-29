import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSocket } from '@/context/SocketContext' // Asegúrate de tener un contexto de socket configurado

const useRealTimeUpdates = () => {
  const socket = useSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket) return

    // Manejar la llegada de nuevos pedidos (orders)
    const handleNewOrder = (newOrder) => {
      queryClient.setQueryData(['orders'], (prevOrders) => [newOrder, ...prevOrders])
    }

    const handleOrderDeleted = (id) => {
      queryClient.setQueryData(['orders'], (prevOrders) => prevOrders.filter(order => order.id !== id))
    }

    const handleOrderUpdated = (updatedOrder) => {
      queryClient.setQueryData(['orders'], (prevOrders) =>
        prevOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
      )
    }

    // Manejar nuevos clientes (clients)
    const handleNewClient = (newClient) => {
      queryClient.setQueryData(['clients'], (prevClients) => [newClient, ...prevClients])
    }

    const handleClientDeleted = (dni) => {
      queryClient.setQueryData(['clients'], (prevClients) => prevClients.filter(client => client.dni !== dni))
    }

    const handleClientUpdated = (updatedClient) => {
      queryClient.setQueryData(['clients'], (prevClients) =>
        prevClients.map((client) => (client.dni === updatedClient.dni ? updatedClient : client))
      )
    }

    // Manejar nuevos servicios (services)
    const handleNewService = (newService) => {
      queryClient.setQueryData(['services'], (prevServices) => [newService, ...prevServices])
    }

    const handleServiceDeleted = (id) => {
      queryClient.setQueryData(['services'], (prevServices) => prevServices.filter(service => service.id !== id))
    }

    const handleServiceUpdated = (updatedService) => {
      queryClient.setQueryData(['services'], (prevServices) =>
        prevServices.map((service) => (service.id === updatedService.id ? updatedService : service))
      )
    }

    // Manejar nuevas visitas (visits)
    const handleNewVisit = (newVisit) => {
      queryClient.setQueryData(['visits'], (prevVisits) => [newVisit, ...(prevVisits || [])])
    }

    const handleVisitDeleted = (id) => {
      queryClient.setQueryData(['visits'], (prevVisits) => prevVisits.filter(visit => visit.id !== id))
    }

    const handleVisitUpdated = (updatedVisit) => {
      queryClient.setQueryData(['visits'], (prevVisits) =>
        prevVisits.map((visit) => (visit.id === updatedVisit.id ? updatedVisit : visit))
      )
    }

    // Manejar nuevos usuarios (users)
    const handleNewUser = (newUser) => {
      queryClient.setQueryData(['users'], (prevUsers) => [newUser, ...prevUsers])
    }

    const handleUserDeleted = (dni) => {
      queryClient.setQueryData(['users'], (prevUsers) => prevUsers.filter(user => user.dni !== dni))
    }

    const handleUserUpdated = (updatedUser) => {
      queryClient.setQueryData(['users'], (prevUsers) =>
        prevUsers.map((user) => (user.dni === updatedUser.dni ? updatedUser : user))
      )
    }

    // Suscribirse a los eventos de WebSocket
    socket.on('new-order', handleNewOrder)
    socket.on('order-deleted', handleOrderDeleted)
    socket.on('order-updated', handleOrderUpdated)

    socket.on('new-client', handleNewClient)
    socket.on('client-deleted', handleClientDeleted)
    socket.on('client-updated', handleClientUpdated)

    socket.on('new-service', handleNewService)
    socket.on('service-deleted', handleServiceDeleted)
    socket.on('service-updated', handleServiceUpdated)

    socket.on('new-visit', handleNewVisit)
    socket.on('visit-deleted', handleVisitDeleted)
    socket.on('visit-updated', handleVisitUpdated)

    socket.on('new-user', handleNewUser)
    socket.on('user-deleted', handleUserDeleted)
    socket.on('user-updated', handleUserUpdated)

    socket.on('connect_error', (error) => {
      console.error('Error en la conexión WebSocket:', error)
      // Aquí puedes manejar lógica adicional como mostrar un mensaje de error o reconectar
    })

    // Limpieza al desmontar el componente
    return () => {
      socket.off('new-order', handleNewOrder)
      socket.off('order-deleted', handleOrderDeleted)
      socket.off('order-updated', handleOrderUpdated)

      socket.off('new-client', handleNewClient)
      socket.off('client-deleted', handleClientDeleted)
      socket.off('client-updated', handleClientUpdated)

      socket.off('new-service', handleNewService)
      socket.off('service-deleted', handleServiceDeleted)
      socket.off('service-updated', handleServiceUpdated)

      socket.off('new-visit', handleNewVisit)
      socket.off('visit-deleted', handleVisitDeleted)
      socket.off('visit-updated', handleVisitUpdated)

      socket.off('new-user', handleNewUser)
      socket.off('user-deleted', handleUserDeleted)
      socket.off('user-updated', handleUserUpdated)
    }
  }, [socket, queryClient])

  return null // Este hook no necesita retornar nada
}

export default useRealTimeUpdates
