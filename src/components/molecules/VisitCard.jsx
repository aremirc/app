import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Input from "../atoms/Input"
import Button from "../atoms/Button"
import api from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import { useVisits } from "@/hooks/useVisits"

// Esquema de validación con Zod
const visitSchema = z.object({
  startTime: z.string().refine(value => !isNaN(Date.parse(value)), "La hora de inicio no es válida"),
  endTime: z.string().refine(value => !isNaN(Date.parse(value)), "La hora de fin no es válida"),
  description: z.string().min(1, "La descripción es obligatoria"),
  orderId: z.number().min(1, "La orden es obligatoria"),
  workerId: z.string().min(1, "El trabajador es obligatorio"),
  clientId: z.string().min(1, "El cliente es obligatorio"),
}).refine(data => new Date(data.endTime) > new Date(data.startTime), {
  message: "La hora de fin debe ser posterior a la de inicio",
  path: ["endTime"],
})

const defaultValues = {
  startTime: "",
  endTime: "",
  description: "",
  orderId: "",
  workerId: "",
  clientId: ""
}

// Funciones de consulta para react-query
const fetchOrders = async () => {
  const { data } = await api.get("/api/orders")
  return data
}

const fetchClients = async () => {
  const { data } = await api.get("/api/clients")
  return data
}

const fetchWorkers = async () => {
  const { data } = await api.get("/api/workers")
  return data
}

const VisitCard = ({ visit, handleCancel }) => {
  const { addVisitMutation, updateVisitMutation } = useVisits()

  const { control, handleSubmit, formState: { errors, isValid, isSubmitting }, setValue, reset } = useForm({
    resolver: zodResolver(visitSchema),
    defaultValues: visit ? {
      ...visit,
      startTime: new Date(visit.date).toISOString().slice(0, 16),
      endTime: new Date(visit.endTime).toISOString().slice(0, 16),
    } : defaultValues,
    mode: "onBlur",
  })

  // Usamos useQuery para obtener órdenes, clientes y trabajadores
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders
  })

  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients
  })

  const { data: workers = [], isLoading: isLoadingWorkers } = useQuery({
    queryKey: ["workers"],
    queryFn: fetchWorkers
  })

  const loading = isLoadingOrders || isLoadingClients || isLoadingWorkers

  const onSubmit = (data) => {
    const payload = {
      ...data,
      date: new Date(data.startTime),
      endTime: new Date(data.endTime),
    }

    if (visit) {
      updateVisitMutation.mutateAsync(payload)
    } else {
      addVisitMutation.mutateAsync(payload)
    }
    handleCancel()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <form onSubmit={handleSubmit(onSubmit)} className="min-w-96 bg-background-light dark:bg-text-dark text-text-light p-6 rounded-lg shadow-lg max-w-sm">
        <h3 className="text-lg font-semibold mb-4">{visit ? "Modificar Visita" : "Agregar Nueva Visita"}</h3>

        {/* Hora de Inicio */}
        <div className="mb-4">
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Hora de Inicio</label>
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="datetime-local"
                className={`mb-4 ${errors.startTime ? 'border-red-500' : ''}`}
              />
            )}
          />
          {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime.message}</p>}
        </div>

        {/* Hora de Fin */}
        <div className="mb-4">
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Hora de Fin</label>
          <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="datetime-local"
                className={`mb-4 ${errors.endTime ? 'border-red-500' : ''}`}
              />
            )}
          />
          {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder="Descripción"
                className={`mb-4 ${errors.description ? 'border-red-500' : ''}`}
              />
            )}
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        {/* Orden */}
        <div className="mb-4">
          <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">Selecciona una Orden</label>
          <Controller
            name="orderId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className={`shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark ${errors.orderId ? 'border-red-500' : ''}`}
                disabled={loading}
                onChange={(e) => {
                  // Convertir el valor seleccionado a número
                  field.onChange(Number(e.target.value))
                }}
              >
                <option value="" disabled>Selecciona una orden</option>
                {loading ? <option value="" disabled>Cargando órdenes...</option> : orders?.map(order => (
                  <option key={order.id} value={order.id}>{order.description} - {order.status}</option>
                ))}
              </select>
            )}
          />
          {errors.orderId && <p className="text-red-500 text-sm">{errors.orderId.message}</p>}
        </div>

        {/* Cliente */}
        <div className="mb-4">
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Selecciona un Cliente</label>
          <Controller
            name="clientId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className={`shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark ${errors.clientId ? 'border-red-500' : ''}`}
                disabled={loading}
              >
                <option value="" disabled>Selecciona un cliente</option>
                {loading ? <option value="" disabled>Cargando clientes...</option> : clients?.map(client => (
                  <option key={client.dni} value={client.dni}>{client.name} - {client.email}</option>
                ))}
              </select>
            )}
          />
          {errors.clientId && <p className="text-red-500 text-sm">{errors.clientId.message}</p>}
        </div>

        {/* Trabajador */}
        <div className="mb-4">
          <label htmlFor="workerId" className="block text-sm font-medium text-gray-700">Selecciona un Trabajador</label>
          <Controller
            name="workerId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className={`shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark ${errors.workerId ? 'border-red-500' : ''}`}
                disabled={loading}
              >
                <option value="" disabled>Selecciona un trabajador</option>
                {loading ? <option value="" disabled>Cargando trabajadores...</option> : workers?.map(worker => (
                  <option key={worker.dni} value={worker.dni}>{worker.firstName} {worker.lastName}</option>
                ))}
              </select>
            )}
          />
          {errors.workerId && <p className="text-red-500 text-sm">{errors.workerId.message}</p>}
        </div>

        <div className="flex justify-end space-x-2">
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button
            type="submit"
            className="hover:bg-primary dark:hover:bg-primary-dark dark:hover:text-background-dark"
            disabled={!isValid || loading || isSubmitting}
          >
            {visit ? (isSubmitting ? "Guardando..." : "Guardar") : (isSubmitting ? "Agregando..." : "Agregar")}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default VisitCard
