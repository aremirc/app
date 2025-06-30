import { useState, useEffect } from "react"
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
import LoadingOverlay from "../atoms/LoadingOverlay"

const steps = [
  { id: 1, title: "Datos" },
  { id: 2, title: "Contacto" },
  { id: 3, title: "Servicios" },
]

const orderStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED", 'ON_HOLD', 'FAILED']

const orderSchema = z.object({
  id: z.number().optional(),
  description: z.string().min(1, "El título es obligatorio"),
  clientId: z.string().min(1, "Selecciona un cliente"),
  workers: z
    .array(z.string())
    .min(1, "Selecciona al menos un trabajador")
    .max(2, "Puedes asignar solo hasta dos trabajadores"),
  status: z.enum(
    ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED", 'ON_HOLD', 'FAILED'],
    { message: "Selecciona un estado válido" }
  ), // Uso de enum para validar el status
  services: z.array(z.number()).min(1, "Selecciona al menos un servicio"),
  scheduledDate: z
    .string()
    .min(1, "La fecha programada es obligatoria")
    .refine((str) => !isNaN(new Date(str).getTime()), { message: "Fecha inválida" })
    .transform((str) => new Date(str).toISOString()),
  endDate: z
    .string()
    .min(1, "La fecha de finalización es obligatoria")
    .refine((str) => !isNaN(new Date(str).getTime()), { message: "Fecha inválida" })
    .transform((str) => new Date(str).toISOString()),
  alternateContactName: z.string().optional(),
  alternateContactPhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{6,9}$/.test(val),
      { message: "El número debe tener entre 6 y 9 dígitos" }
    ),
  statusDetails: z.string().optional(),
  responsibleId: z.string().min(1, "Debes seleccionar un responsable"),
  updatedAt: z.string().optional(), // ISO date string
})
  .refine((data) => new Date(data.endDate) >= new Date(data.scheduledDate), {
    message: "La fecha de finalización debe ser posterior a la programada",
    path: ["endDate"],
  })
  .superRefine((data, ctx) => {
    const now = new Date()
    const allowPastDates = ["IN_PROGRESS", "COMPLETED", "CANCELLED", "ON_HOLD", "FAILED"].includes(data.status)

    // Fecha programada en el pasado
    if (!allowPastDates && data.scheduledDate < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledDate"],
        message: "La fecha programada no puede ser pasada",
      })
    }

    // Fecha de finalización en el pasado
    if (!allowPastDates && data.endDate < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "La fecha de finalización no puede ser pasada",
      })
    }

    // Validar que el responsable esté entre los trabajadores seleccionados
    if (data.responsibleId && !data.workers.includes(data.responsibleId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["responsibleId"],
        message: "El responsable debe estar en la lista de técnicos asignados",
      })
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
  responsibleId: "",
  updatedAt: "",
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

const toDateTimeLocalString = (date) => {
  const pad = n => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const toLocalDatetimeInputValue = (isoString) => {
  const date = new Date(isoString)
  const offset = date.getTimezoneOffset() * 60000
  const localISO = new Date(date.getTime() - offset).toISOString().slice(0, 16)
  return localISO
}

const OrderCard = ({ order, handleCancel }) => {
  const [step, setStep] = useState(1)
  const [availableTechs, setAvailableTechs] = useState([])
  const [loadingTechs, setLoadingTechs] = useState(false)
  const { addOrderMutation, updateOrderMutation } = useOrders()
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(isTouch)
  }, [])

  const { control, handleSubmit, formState: { errors, isValid, isSubmitting }, watch, getValues, setValue, trigger } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: order ? {
      ...order,
      updatedAt: order.updatedAt ?? "",
      clientName: order?.client?.name,
      scheduledDate: order?.scheduledDate ? toLocalDatetimeInputValue(order.scheduledDate) : "",
      endDate: order?.endDate ? toLocalDatetimeInputValue(order.endDate) : "",
      statusDetails: order.statusDetails ?? "",
      alternateContactName: order.alternateContactName ?? "",
      alternateContactPhone: order.alternateContactPhone ?? "",
      workers: order?.workers?.map((w) => w.userId) ?? [],
      responsibleId: order?.workers.find((w) => w.isResponsible)?.userId ?? "",
      services: order?.services?.map((s) => s.id) ?? []
    } : defaultValues,
    mode: "onChange", // o "onSubmit" si prefieres validar solo al enviar
    shouldUnregister: false,
  })

  const isSaving = isSubmitting || addOrderMutation.isPending || updateOrderMutation.isPending

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

  const checkAvailability = async () => {
    // Validar campos antes de continuar
    const isValidDates = await trigger(["scheduledDate", "endDate"])
    if (!isValidDates) return

    const currentScheduledDate = new Date(getValues("scheduledDate")).toISOString()
    const currentEndDate = new Date(getValues("endDate")).toISOString()

    if (!currentScheduledDate || !currentEndDate) return

    setLoadingTechs(true)

    try {
      const { data } = await api.get("/api/available-techs", {
        params: {
          scheduledDate: currentScheduledDate,
          endDate: currentEndDate,
          orderId: order?.id,
        },
      })

      setAvailableTechs(data)
    } catch (err) {
      console.error("Error al cargar técnicos disponibles", err)
      setAvailableTechs([])
    } finally {
      setLoadingTechs(false)
    }
  }

  useEffect(() => {
    if (order && step === 2) {
      const scheduled = getValues("scheduledDate")
      const end = getValues("endDate")
      if (scheduled && end) {
        checkAvailability()
      }
    }
  }, [step])

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      updatedAt: data.updatedAt,
    }

    try {
      if (order) {
        await updateOrderMutation.mutateAsync(payload)
      } else {
        await addOrderMutation.mutateAsync(payload)
      }
      handleCancel() // Solo se ejecuta si la mutación fue exitosa
    } catch (error) {
      // Ya estás mostrando el toast de error dentro del hook
      // Aquí podrías hacer algo adicional si quieres
      console.error("Error al guardar el usuario", error)
    }
  }

  const minDate = toDateTimeLocalString(
    order?.scheduledDate ? new Date(order.scheduledDate) : new Date()
  )

  const validateStepAndSet = async (newStep) => {
    const fieldsToValidate = {
      1: ["description", "status", "scheduledDate", "endDate", "statusDetails"],
      2: ["clientId", "alternateContactName", "alternateContactPhone", "workers"],
      3: ["services"],
    }

    const currentFields = fieldsToValidate[step]
    const isValidStep = await trigger(currentFields)

    if (isValidStep) {
      setStep(newStep)
    } else {
      console.log("❌ Errores en el paso actual:", errors)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <form onSubmit={handleSubmit(onSubmit)} className="relative min-w-96 bg-background-light dark:bg-text-dark text-text-light p-6 rounded-lg shadow-lg max-w-sm">
        {isSaving && <LoadingOverlay />}

        <h3 className="text-lg font-semibold mb-4">{order ? "Modificar Orden" : "Agregar Nueva Orden"}</h3>

        <Stepper
          steps={steps}
          controlledStep={step}
          onStepChange={validateStepAndSet}
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
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Título de la orden
                  </label>
                  {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                  <Input
                    {...field}
                    autoFocus
                    type="text"
                    placeholder="Ej. Instalación de CCTV para cliente ABC"
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
                    <select {...field} id="status" className="shadow appearance-none border rounded-sm w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-hidden focus:ring-3 focus:ring-primary dark:bg-background-dark" disabled={!order}>
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
                    min={minDate} // formato "YYYY-MM-DDTHH:mm"
                    onBlur={(e) => {
                      field.onBlur?.(e)
                      checkAvailability()
                    }}
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
                    min={minDate}
                    onBlur={(e) => {
                      field.onBlur?.(e)
                      checkAvailability()
                    }}
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
                    placeholder="Detalles de la orden (opcional)"
                    required={false}
                  />
                </>
              )}
            />
          </>
        )}

        {step === 2 && (
          <>
            {isTouchDevice ? (
              // Mostrar <select> en móviles
              <Controller
                name="clientId"
                control={control}
                render={({ field }) => (
                  <div className="mb-4">
                    <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                      Selecciona un Cliente
                    </label>
                    {errors.clientId && <p className="text-red-500 text-sm">{errors.clientId.message}</p>}
                    <select {...field} autoFocus id="clientId" className="shadow appearance-none border rounded-sm w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-hidden focus:ring-3 focus:ring-primary dark:bg-background-dark" disabled={loading}>
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
              />
            ) : (
              // Mostrar input con datalist en desktop
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
                        autoFocus
                        list="client-suggestions"
                        id="clientName"
                        placeholder="Selecciona un cliente"
                        disabled={loading}
                        className="shadow appearance-none border rounded-sm w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-hidden focus:ring-3 focus:ring-primary dark:bg-background-dark"
                        onChange={(e) => {
                          const name = e.target.value
                          field.onChange(name)
                          const matchedClient = clients.find((client) => client.name === name)
                          if (matchedClient) {
                            setValue("clientId", matchedClient.id)
                          } else {
                            // Limpiar ID si no hay coincidencia
                            setValue("clientId", "")
                          }
                        }}
                        onBlur={(e) => {
                          const name = e.target.value
                          const matchedClient = clients.find((client) => client.name === name)
                          if (!matchedClient) {
                            // Si no es válido, limpia el input
                            field.onChange("")
                            setValue("clientId", "")
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
              </>
            )}

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
                    placeholder="Nombre alternativo (contacto opcional)"
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
                    placeholder="Teléfono alternativo (opcional)"
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
                  const currentResponsible = watch("responsibleId")

                  if (selectedWorkers.includes(id)) {
                    const updated = selectedWorkers.filter((w) => w !== id)
                    field.onChange(updated)

                    // ✅ Si se deselecciona el responsable actual
                    if (currentResponsible === id) {
                      if (updated.length > 0) {
                        setValue("responsibleId", updated[0]) // asignar otro automáticamente
                      } else {
                        setValue("responsibleId", "") // no queda nadie
                      }
                    }
                  } else if (selectedWorkers.length < 2) {
                    const updated = [...selectedWorkers, id]
                    field.onChange(updated)

                    // ✅ Si no hay responsable asignado aún, asignar al nuevo
                    if (!currentResponsible) {
                      setValue("responsibleId", id)
                    }
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
                      ) : availableTechs.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay técnicos disponibles para esta orden.</p>
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
                                {worker.firstName?.split(" ")[0]} {worker.lastName?.split(" ")[0]}
                                {isResponsible && (
                                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-light text-background-dark dark:bg-primary-dark">
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
                        <strong>Técnicos Asignados:</strong>

                        <div className="space-y-2 mt-2">
                          {selectedWorkers.map((workerId) => {
                            const isResponsible = order?.workers?.find((w) => w.userId === workerId)?.isResponsible ?? false
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
                                  {worker?.firstName?.split(" ")[0]} {worker?.lastName?.split(" ")[0]}
                                  {isResponsible && (
                                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-light text-background-dark dark:bg-primary-dark">
                                      Responsable
                                    </span>
                                  )}
                                </label>
                              </div>
                            )
                          })}
                        </div>

                        <p className="mt-2 text-xs text-gray-500 italic">
                          Selecciona quién será el técnico responsable de la orden.
                        </p>
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
            nextStep={() => validateStepAndSet(Math.min(step + 1, steps.length))}
          />

          <div className="space-x-2">
            <Button onClick={handleCancel} disabled={isSaving}>Cancelar</Button>
            {(step === steps.length || isValid) && (
              <Button
                type="submit"
                className="bg-primary-light hover:bg-primary dark:hover:bg-primary-dark dark:hover:text-background-dark"
                disabled={isSaving || !isValid || loading}
              >
                {order
                  ? isSaving ? "Guardando..." : "Guardar"
                  : isSaving ? "Agregando..." : "Agregar"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default OrderCard
