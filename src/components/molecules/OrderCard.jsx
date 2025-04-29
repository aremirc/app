import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Input from "../atoms/Input"
import Button from "../atoms/Button"
import api from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import { useOrders } from "@/hooks/useOrders"

// Definición del esquema de validación de Zod
const orderStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]

const orderSchema = z.object({
  description: z.string().min(1, "La descripción es obligatoria"),
  clientId: z.string().min(1, "Selecciona un cliente"),
  workerIds: z.string().min(1, "Selecciona al menos un trabajador"),
  // workerIds: z.array(z.string()).min(1, "Selecciona al menos un trabajador").max(2, "Puedes asignar solo hasta dos trabajadores"),
  status: z.enum(orderStatuses, { message: "Selecciona un estado válido" }), // Uso de enum para validar el status
  services: z.array(z.number()).min(0, {
    message: "Selecciona al menos un servicio",
  }),
})

const defaultValues = {
  description: "",
  status: orderStatuses[0],
  clientId: "",
  workerIds: "",
  services: [],
}

const fetchClients = async () => {
  const { data } = await api.get("/api/clients")
  return data
}

const fetchWorkers = async () => {
  const { data } = await api.get("/api/workers")
  return data
}

const fetchServices = async () => {
  const { data } = await api.get("/api/services")
  return data
}

const OrderCard = ({ order, handleCancel }) => {
  const { addOrderMutation, updateOrderMutation } = useOrders()

  const { control, handleSubmit, formState: { errors, isValid, isSubmitting }, watch, setValue } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: order || defaultValues,
    mode: "onBlur", // Validación al perder el foco
  })

  // Usando useQuery para obtener clientes, trabajadores y servicios
  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients
  })

  const { data: workers = [], isLoading: loadingWorkers } = useQuery({
    queryKey: ["workers"],
    queryFn: fetchWorkers
  })

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices
  })

  // Combinamos todas las cargas en una sola variable
  const loading = loadingClients || loadingWorkers || loadingServices

  const handleServiceChange = (serviceId) => {
    const currentServices = watch("services") ?? []
    const updatedServices = currentServices.includes(serviceId)
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId]
    setValue("services", updatedServices)
  }

  const onSubmit = (data) => {
    if (order) {
      updateOrderMutation.mutateAsync(data)
    } else {
      addOrderMutation.mutateAsync(data)
    }
    handleCancel()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <form onSubmit={handleSubmit(onSubmit)} className="min-w-96 bg-background-light dark:bg-text-dark text-text-light p-6 rounded-lg shadow-lg max-w-sm">
        <h3 className="text-lg font-semibold mb-4">{order ? "Modificar Orden" : "Agregar Nueva Orden"}</h3>

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="text"
              placeholder="Descripción de la orden"
              className={`mb-4 ${errors.description ? "border-red-500" : ""}`}
            />
          )}
        />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Estado de la Orden
              </label>
              <select {...field} className="shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark" disabled={loading}>
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          )}
        />
        {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}

        <Controller
          name="clientId"
          control={control}
          render={({ field }) => (
            <div className="mb-4">
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                Selecciona un Cliente
              </label>
              <select {...field} className="shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark" disabled={loading}>
                <option value="" disabled>Selecciona un cliente</option>
                {loadingClients ? (
                  <option value="" disabled>Cargando clientes...</option>
                ) : (
                  clients.map((client) => (
                    <option key={client.dni} value={client.dni}>
                      {client.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}
        />
        {errors.clientId && <p className="text-red-500 text-sm">{errors.clientId.message}</p>}

        <Controller
          name="workerIds"
          control={control}
          render={({ field }) => (
            <div className="mb-4">
              <label htmlFor="workerIds" className="block text-sm font-medium text-gray-700">
                Selecciona un Trabajador
              </label>
              <select {...field} className="shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark" disabled={loading}>
                <option value="" disabled>Selecciona un trabajador</option>
                {loadingWorkers ? (
                  <option value="" disabled>Cargando trabajadores...</option>
                ) : (
                  workers.map((worker) => (
                    <option key={worker.dni} value={worker.dni}>
                      {worker.firstName} {worker.lastName}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}
        />
        {errors.workerIds && <p className="text-red-500 text-sm">{errors.workerIds.message}</p>}

        <Controller
          name="services"
          control={control}
          render={({ field }) => (
            <div className="mb-4">
              <label htmlFor="services" className="block text-sm font-medium text-gray-700">
                {order ? "Servicios" : "Selecciona Servicios"}
              </label>
              <div className="space-y-2">
                {loadingServices ? (
                  <p>Cargando servicios...</p>
                ) : services.length === 0 ? (
                  <p>No hay servicios disponibles.</p>
                ) : (
                  services.map((service) => (
                    <div key={service.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`service-${service.id}`}
                        value={service.id}
                        checked={(watch("services") ?? []).includes(service.id)}
                        onChange={() => handleServiceChange(service.id)}
                        className="mr-2"
                        disabled={order || loading}
                      />
                      <label htmlFor={`service-${service.id}`} className="text-sm text-gray-700">
                        {service.name} - ${service.price}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        />
        {errors.services && <p className="text-red-500 text-sm">{errors.services.message}</p>}

        <div className="flex justify-end space-x-2">
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button
            type="submit"
            className="hover:bg-primary dark:hover:bg-primary-dark dark:hover:text-background-dark"
            disabled={isSubmitting || !isValid || loading}
          >
            {order ? (isSubmitting ? "Guardando..." : "Guardar") : (isSubmitting ? "Agregando..." : "Agregar")}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default OrderCard
