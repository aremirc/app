import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useOrders } from "@/hooks/useOrders"
import api from "@/lib/axios"
import Input from "../atoms/Input"
import Button from "../atoms/Button"
import Stepper from "../organisms/Stepper"
import StepNavigation from "../organisms/StepNavigation"
import { useEffect, useState } from "react"

const steps = [
  { id: 1, title: "Datos" },
  { id: 2, title: "Contacto" },
  { id: 3, title: "Servicios" },
]

const orderStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]

const orderSchema = z.object({
  id: z.number().optional(),
  description: z.string().min(1, "La descripción es obligatoria"),
  clientId: z.string().min(1, "Selecciona un cliente"),
  workers: z.array(z.string()).min(1, "Selecciona al menos un trabajador").max(2, "Puedes asignar solo hasta dos trabajadores"),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"], { message: "Selecciona un estado válido" }), // Uso de enum para validar el status
  services: z.array(z.number()).min(1, "Selecciona al menos un servicio"),
  scheduledDate: z
    .string()
    .min(1, "La fecha programada es obligatoria")
    .refine((str) => !isNaN(new Date(str).getTime()), { message: "Fecha inválida" })
    .transform((str) => new Date(str))
    .refine(date => date >= new Date(), { message: "La fecha programada no puede ser pasada" }),
  endDate: z
    .string()
    .min(1, "La fecha de finalización es obligatoria")
    .refine((str) => !isNaN(new Date(str).getTime()), { message: "Fecha inválida" })
    .transform((str) => new Date(str))
    .refine(date => date >= new Date(), { message: "La fecha de finalización no puede ser pasada" }),
  alternateContactName: z.string().optional(),
  alternateContactPhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{6,9}$/.test(val),
      { message: "El número debe tener entre 6 y 9 dígitos" }
    ),
  statusDetails: z.string().optional(),
  responsibleId: z.string().optional(),
})
  .refine((data) => data.endDate >= data.scheduledDate, {
    message: "La fecha de finalización debe ser posterior a la programada",
    path: ["endDate"],
  })
  .superRefine((data, ctx) => {
    if (data.responsibleId) {
      if (!data.workers.includes(data.responsibleId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["responsibleId"],
          message: "El responsable debe estar en la lista de técnicos asignados",
        })
      }
    }
  })

const defaultValues = {
  description: "",
  status: orderStatuses[0],
  clientId: "",
  clientName: "",
  workers: [],
  services: [],
  scheduledDate: "",
  endDate: "",
  alternateContactName: "",
  alternateContactPhone: "",
  statusDetails: "",
}

const fetchActiveClients = async () => {
  const { data } = await api.get("/api/clients?isActive=true")
  return data
}

const fetchActiveTechnicians = async () => {
  const { data } = await api.get("/api/users?role=TECHNICIAN&status=ACTIVE")
  return data
}

const fetchActiveServices = async () => {
  const { data } = await api.get("/api/services?status=ACTIVE")
  return data
}

const OrderCard = ({ order, handleCancel }) => {
  const [step, setStep] = useState(1)
  const [availableTechs, setAvailableTechs] = useState([])
  const [loadingTechs, setLoadingTechs] = useState(false)
  const { addOrderMutation, updateOrderMutation } = useOrders()

  const { control, handleSubmit, formState: { errors, isValid, isSubmitting }, watch, setValue, trigger } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: order ? { ...order, clientName: order?.client?.name, scheduledDate: order?.scheduledDate?.slice(0, 16) ?? "", endDate: order?.endDate?.slice(0, 16) ?? "", workers: order?.workers?.map((w) => w.userId) ?? [], responsibleId: order?.workers.find((w) => w.isResponsible)?.userId ?? null, services: order?.services?.map((s) => s.id) ?? [] } : defaultValues,
    mode: "onChange", // o "onSubmit" si prefieres validar solo al enviar
    shouldUnregister: false,
  })

  const scheduledDate = watch("scheduledDate")
  const endDate = watch("endDate")

  // Usando useQuery para obtener clientes, trabajadores y servicios
  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchActiveClients
  })

  const { data: techs = [], isLoading: loadingWorkers } = useQuery({
    queryKey: ["techs"],
    queryFn: fetchActiveTechnicians
  })

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ["services"],
    queryFn: fetchActiveServices
  })

  // Combinamos todas las cargas en una sola variable
  const loading = loadingClients || loadingWorkers || loadingServices

  useEffect(() => {
    const checkAvailability = async (scheduledDate, endDate) => {
      if (!scheduledDate || !endDate) return

      setLoadingTechs(true)

      try {
        const { data } = await api.get("/api/available-techs", {
          params: { scheduledDate, endDate },
        })

        setAvailableTechs(data)
      } catch (err) {
        console.error("Error al cargar técnicos disponibles", err)
        setAvailableTechs([])
      } finally {
        setLoadingTechs(false)
      }
    }

    checkAvailability(scheduledDate, endDate)
  }, [scheduledDate, endDate])

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

        <Stepper
          steps={steps}
          controlledStep={step}
          onStepChange={async (newStep) => {
            const fieldsToValidate = {
              1: ["description", "status", "scheduledDate", "endDate", "statusDetails"],
              2: ["clientId", "alternateContactName", "alternateContactPhone"],
              3: ["workers", "services"],
            }

            const currentFields = fieldsToValidate[step]
            const isValidStep = await trigger(currentFields)

            if (isValidStep) {
              setStep(newStep)
            } else {
              console.log("Errores en el paso actual:", errors)
            }
          }}
        />

        {step === 1 && (
          <>
            <Controller
              name="id"
              control={control}
              render={({ field }) => (
                <>
                  {errors.id && <p className="text-red-500 text-sm">{errors.id.message}</p>}
                  <Input
                    {...field}
                    type="number"
                    placeholder="ID automático"
                    className={`mb-4 hidden ${errors.id ? "border-red-500" : ""}`}
                    disabled
                  />
                </>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <>
                  {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                  <Input
                    {...field}
                    type="text"
                    placeholder="Descripción de la orden"
                    className={`mb-4 ${errors.description ? "border-red-500" : ""}`}
                  />
                </>
              )}
            />

            {order && (
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="mb-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Estado de la Orden
                    </label>
                    {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                    <select {...field} id="status" className="shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark" disabled={!order}>
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              />
            )}

            <Controller
              name="scheduledDate"
              control={control}
              render={({ field }) => (
                <>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                    Fecha Programada
                  </label>
                  {errors.scheduledDate && <p className="text-red-500 text-sm">{errors.scheduledDate.message}</p>}
                  <Input
                    {...field}
                    id="scheduledDate"
                    type="datetime-local"
                    className="mb-4"
                    label="Fecha Programada"
                    min={new Date().toISOString().slice(0, 16)} // formato "YYYY-MM-DDTHH:mm"
                  />
                </>
              )}
            />

            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    Fecha de Finalización
                  </label>
                  {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
                  <Input
                    {...field}
                    id="endDate"
                    type="datetime-local"
                    className="mb-4"
                    label="Fecha de Finalización"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </>
              )}
            />

            <Controller
              name="statusDetails"
              control={control}
              render={({ field }) => (
                <>
                  {errors.statusDetails && <p className="text-red-500 text-sm">{errors.statusDetails.message}</p>}
                  <Input
                    {...field}
                    type="text"
                    className="mb-4"
                    placeholder="Detalles del estado"
                    required={false}
                  />
                </>
              )}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Controller
              name="clientName"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                    Selecciona un Cliente
                  </label>
                  {errors.clientId && (
                    <p className="text-red-500 text-sm">{errors.clientId.message}</p>
                  )}
                  <input
                    {...field}
                    list="client-suggestions"
                    id="clientName"
                    placeholder="Selecciona un cliente"
                    disabled={loading}
                    className="shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark"
                    onChange={(e) => {
                      const name = e.target.value;
                      field.onChange(name);
                      const matchedClient = clients.find((client) => client.name === name);
                      if (matchedClient) {
                        setValue("clientId", matchedClient.id);
                      } else {
                        // Limpiar ID si no hay coincidencia
                        setValue("clientId", "");
                      }
                    }}
                    onBlur={(e) => {
                      const name = e.target.value;
                      const matchedClient = clients.find((client) => client.name === name);
                      if (!matchedClient) {
                        // Si no es válido, limpia el input
                        field.onChange("");
                        setValue("clientId", "");
                      }
                    }}
                  />
                  <datalist id="client-suggestions">
                    {loadingClients ? (
                      <option value="Cargando clientes..." disabled />
                    ) : (
                      clients.map((client) => (
                        <option key={client.id} value={client.name} />
                      ))
                    )}
                  </datalist>
                </div>
              )}
            />

            {/* Campo oculto para enviar el ID real */}
            <Controller
              name="clientId"
              control={control}
              render={({ field }) => <input type="hidden" {...field} />}
            />

            {/* <Controller
              name="clientId"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                    Selecciona un Cliente
                  </label>
                  {errors.clientId && <p className="text-red-500 text-sm">{errors.clientId.message}</p>}
                  <select {...field} id="clientId" className="shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark" disabled={loading}>
                    <option value="" disabled>Selecciona un cliente</option>
                    {loadingClients ? (
                      <option value="" disabled>Cargando clientes...</option>
                    ) : (
                      clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}
            /> */}

            <Controller
              name="alternateContactName"
              control={control}
              render={({ field }) => (
                <>
                  {errors.alternateContactName && <p className="text-red-500 text-sm">{errors.alternateContactName.message}</p>}
                  <Input
                    {...field}
                    type="text"
                    className="mb-4"
                    placeholder="Nombre de contacto alternativo"
                    required={false}
                  />
                </>
              )}
            />

            <Controller
              name="alternateContactPhone"
              control={control}
              render={({ field }) => (
                <>
                  {errors.alternateContactPhone && <p className="text-red-500 text-sm">{errors.alternateContactPhone.message}</p>}
                  <Input
                    {...field}
                    type="text"
                    className="mb-4"
                    placeholder="Teléfono alternativo"
                    inputMode="numeric"
                    pattern="\d*"
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, '') // Elimina todo lo que no sea dígito
                      if (onlyNums.length <= 9) {
                        field.onChange(onlyNums)
                      }
                    }}
                    required={false}
                  />
                </>
              )}
            />

            <Controller
              name="workers"
              control={control}
              render={({ field }) => {
                const selectedWorkers = field.value || []

                const toggleWorker = (id) => {
                  if (selectedWorkers.includes(id)) {
                    field.onChange(selectedWorkers.filter((w) => w !== id))
                    // Si se deselecciona el responsable, limpiamos responsibleId
                    if (watch("responsibleId") === id) {
                      setValue("responsibleId", null)
                    }
                  } else if (selectedWorkers.length < 2) {
                    field.onChange([...selectedWorkers, id])
                  }
                }

                return (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {order ? "Técnicos disponibles" : "Selecciona Técnicos"}
                    </label>
                    {errors.workers && (
                      <p className="text-red-500 text-sm">{errors.workers.message}</p>
                    )}
                    <div className="space-y-2 mt-2">
                      {loadingTechs ? (
                        <p>Cargando técnicos...</p>
                      ) : (
                        availableTechs.map((worker) => {
                          const isSelected = selectedWorkers.includes(worker.dni)
                          const isResponsible =
                            order?.workers?.find((w) => w.userId === worker.dni)?.isResponsible ?? false

                          return (
                            <div key={worker.dni} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`worker-${worker.dni}`}
                                value={worker.dni}
                                checked={isSelected}
                                onChange={() => toggleWorker(worker.dni)}
                                disabled={
                                  !selectedWorkers.includes(worker.dni) &&
                                  selectedWorkers.length >= 2
                                }
                                className="mr-2"
                              />
                              <label htmlFor={`worker-${worker.dni}`} className={`text-sm ${isSelected ? 'font-semibold' : 'text-gray-700'}`}>
                                {worker.firstName} {worker.lastName}
                                {isResponsible && (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                    R. Asignado
                                  </span>
                                )}
                              </label>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* ✅ Mostrar trabajadores seleccionados */}
                    {selectedWorkers.length > 0 && (
                      <div className="mt-3 text-sm text-gray-600">
                        <strong>Técnico responsable:</strong>{" "}
                        <div className="space-y-2 mt-2">
                          {selectedWorkers
                            .map((workerId) => {
                              const isResponsible =
                                order?.workers?.find((w) => w.userId === workerId)?.isResponsible ?? false
                              const worker = techs.find((w) => w.dni === workerId)
                              return (
                                <div key={`responsible-${workerId}`} className="flex items-center ml-4">
                                  <input
                                    type="radio"
                                    name="responsibleId"
                                    id={`responsible-${workerId}`}
                                    value={workerId}
                                    checked={watch("responsibleId") === workerId}
                                    onChange={() => setValue("responsibleId", workerId)}
                                    className="mr-2"
                                  />
                                  <label htmlFor={`responsible-${workerId}`} className="text-sm text-gray-700">
                                    {worker?.firstName} {worker?.lastName}
                                    {isResponsible && (
                                      <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                        Responsable
                                      </span>
                                    )}
                                  </label>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }}
            />
          </>
        )}

        {step === 3 && (
          <Controller
            name="services"
            control={control}
            render={({ field }) => {
              const selectedServiceIds = field.value ?? []

              const toggleService = (id) => {
                if (selectedServiceIds.includes(id)) {
                  field.onChange(selectedServiceIds.filter((s) => s !== id))
                } else {
                  field.onChange([...selectedServiceIds, id])
                }
              }

              return (
                <div className="mb-4">
                  <label htmlFor="services" className="block text-sm font-medium text-gray-700">
                    {order ? "Servicios asignados" : "Selecciona Servicios"}
                  </label>
                  {errors.services && <p className="text-red-500 text-sm">{errors.services.message}</p>}
                  <div className="space-y-2 mt-2">
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
                            checked={selectedServiceIds.includes(service.id)}
                            onChange={() => toggleService(service.id)}
                            className="mr-2"
                            disabled={loading}
                          />
                          <label htmlFor={`service-${service.id}`} className="text-sm text-gray-700">
                            {service.name} - ${service.price}
                          </label>
                        </div>
                      ))
                    )}
                  </div>

                  {/* ✅ Mostrar servicios seleccionados */}
                  {selectedServiceIds.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Seleccionados:</strong>{" "}
                      {selectedServiceIds
                        .map((id) => {
                          const s = services.find((s) => s.id === id)
                          return s ? s.name : id
                        })
                        .join(", ")}
                    </div>
                  )}
                </div>
              )
            }}
          />
        )}

        <div className="flex justify-between">
          <StepNavigation
            step={step}
            steps={steps}
            prevStep={() => setStep((prev) => Math.max(prev - 1, 1))}
            nextStep={() => setStep((prev) => Math.min(prev + 1, steps.length))}
          />

          <div className="space-x-2">
            <Button onClick={handleCancel}>Cancelar</Button>
            <Button
              type="submit"
              className="hover:bg-primary dark:hover:bg-primary-dark dark:hover:text-background-dark"
              disabled={isSubmitting || !isValid || loading}
            >
              {order ? (isSubmitting ? "Guardando..." : "Guardar") : (isSubmitting ? "Agregando..." : "Agregar")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default OrderCard
