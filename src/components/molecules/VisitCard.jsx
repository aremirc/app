import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useVisits } from "@/hooks/useVisits"
import { z } from "zod"
import api from "@/lib/axios"
import Input from "../atoms/Input"
import Button from "../atoms/Button"
import Stepper from "../organisms/Stepper"
import StepNavigation from "../organisms/StepNavigation"
import LoadingOverlay from "../atoms/LoadingOverlay"

const steps = [
  { id: 1, title: "Fecha" },
  { id: 2, title: "Datos" },
  { id: 3, title: "Opcional" },
]

// Esquema de validación con Zod
const visitSchema = z.object({
  id: z.number().optional(),
  date: z.string()
    .refine(value => !isNaN(Date.parse(value)), "La hora de inicio no es válida") // startTime
    .refine(value => {
      const date = new Date(value);
      const hours = date.getHours();
      return hours >= 6 && hours < 22;
    }, "La hora de inicio debe estar entre las 06:00 y las 22:00"),
  endTime: z.string()
    .refine(value => !isNaN(Date.parse(value)), "La hora de fin no es válida")
    .refine(value => {
      const date = new Date(value);
      const hours = date.getHours();
      return hours >= 6 && hours < 22;
    }, "La hora de fin debe estar entre las 06:00 y las 22:00"),
  description: z.string().min(1, "La descripción es obligatoria"),
  orderId: z.number().min(1, "La orden es obligatoria"),
  userId: z.string().min(1, "El trabajador es obligatorio"),
  clientId: z.string().min(1, "El cliente es obligatorio"),
  isReviewed: z.boolean().optional(),
  evaluation: z
    .number({ invalid_type_error: "La evaluación debe ser un número" })
    .min(0, "Debe ser al menos 0")
    .max(5, "No puede ser mayor a 5")
    .optional(),
  updatedAt: z.string().optional(), // ISO date string
}).superRefine((data, ctx) => {
  if (new Date(data.endTime) <= new Date(data.date)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La hora de fin debe ser posterior a la de inicio",
      path: ["endTime"],
    })
  }
})

const defaultValues = {
  date: "",
  endTime: "",
  description: "",
  orderId: "",
  userId: "",
  clientId: "",
  isReviewed: false,
  evaluation: 0,
  updatedAt: "",
}

// Funciones de consulta para react-query
const fetchOrders = async ({ queryKey }) => {
  const [_key, filters] = queryKey
  const params = new URLSearchParams()

  if (filters.orderID) params.append("orderId", filters.orderID)
  if (filters.clientID) params.append("clientId", filters.clientID)
  if (filters.userID) params.append("workerDni", filters.userID)

  const url = `/api/orders${params.toString() ? `?${params}` : ""}`
  const { data } = await api.get(url)
  return data
}

const toDateTimeLocalString = (date) => {
  const pad = n => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const toDatetimeLocal = (dateStr) =>
  new Date(new Date(dateStr).getTime() - new Date().getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16)

const VisitCard = ({ visit, setVisit, userID, clientID, orderID, handleCancel }) => {
  const [step, setStep] = useState(1)
  const { addVisitMutation, updateVisitMutation } = useVisits()

  const orderFilters = {
    ...(orderID && { orderID }),
    ...(clientID && { clientID }),
    ...(userID && { userID })
  }

  const { data: orders = [], isLoading: loading } = useQuery({
    queryKey: ["orders", orderFilters], // clave react-query dependiente de filtros
    queryFn: fetchOrders
  })

  const { control, handleSubmit, formState: { errors, isValid, isSubmitting }, setValue, watch, reset, trigger } = useForm({
    resolver: zodResolver(visitSchema),
    defaultValues: visit ? {
      ...visit,
      updatedAt: visit.updatedAt ?? "",
      date: visit.date ? toDatetimeLocal(visit.date) : "",
      endTime: visit.endTime ? toDatetimeLocal(visit.endTime) : "",
      evaluation: typeof visit.evaluation === 'number' ? visit.evaluation : 0,
      isReviewed: visit.isReviewed ?? false,
    } : {
      ...defaultValues,
      orderId: orderID ? Number(orderID) : "", // ← asegura un número válido o string vacío
      clientId: orderID
        ? orders.find(o => o.id === Number(orderID))?.clientId || ""
        : "",
      userId: orderID
        ? orders.find(o => o.id === Number(orderID))?.workers.find(w => w.isResponsible)?.userId || ""
        : "",
    },
    mode: "onChange",
  })

  const isSaving = addVisitMutation.isPending || updateVisitMutation.isPending || isSubmitting

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      date: new Date(data.date).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
      updatedAt: data.updatedAt,
    }

    try {
      if (visit) {
        await updateVisitMutation.mutateAsync(payload)
      } else {
        await addVisitMutation.mutateAsync(payload)
      }

      setVisit?.(data) // Actualiza el estado en el padre
      handleCancel() // Solo se ejecuta si la mutación fue exitosa
    } catch (error) {
      // Ya estás mostrando el toast de error dentro del hook
      // Aquí podrías hacer algo adicional si quieres
      console.error("Error al guardar la visita", error)
    }
  }

  const nowLocal = toDateTimeLocalString(new Date())

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

  const isReviewedValue = watch("isReviewed")
  const selectedOrder = orders.find(o => o.id === watch("orderId"))

  if (selectedOrder) {
    // Si clientId está vacío pero sí lo tenemos en la orden, actualizamos.
    if (!watch("clientId") && selectedOrder.clientId) {
      setValue("clientId", selectedOrder.clientId)
    }

    // Lo mismo con userId
    const responsibleUserId = selectedOrder.workers.find(w => w.isResponsible)?.userId
    if (!watch("userId") && responsibleUserId) {
      setValue("userId", responsibleUserId)
    }
  }

  const validateStepAndSet = async (newStep) => {
    const fieldsToValidate = {
      1: ["date", "endTime"],
      2: ["description", "orderId"],
      3: ["clientId", "userId", "evaluation", "isReviewed"],
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

        <h3 className="text-lg font-semibold mb-4">{visit ? "Modificar Visita" : "Agregar Nueva Visita"}</h3>

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

            {/* Hora de Inicio */}
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">Hora de Inicio</label>
                  {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
                  <Input
                    {...field}
                    autoFocus
                    id="date"
                    type="datetime-local"
                    max={nowLocal} // "YYYY-MM-DDTHH:MM"
                    className={`${errors.date ? 'border-red-500' : ''}`}
                  />
                </div>
              )}
            />

            {/* Hora de Fin */}
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Hora de Fin</label>
                  {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}
                  <Input
                    {...field}
                    id="endTime"
                    type="datetime-local"
                    max={nowLocal} // "YYYY-MM-DDTHH:MM"
                    className={`${errors.endTime ? 'border-red-500' : ''}`}
                  />
                </div>
              )}
            />
          </>
        )}

        {step === 2 && (
          <>
            {/* Descripción */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
                  {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                  <Input
                    {...field}
                    autoFocus
                    id="description"
                    type="text"
                    placeholder="Descripción"
                    className={`${errors.description ? 'border-red-500' : ''}`}
                  />
                </div>
              )}
            />

            {/* Orden */}
            <div className="mb-4">
              <label htmlFor="orderId" className="block text-sm font-medium text-text-light">
                {(!visit && !orderID) ? "Selecciona una Orden" : "Orden Seleccionada"}
              </label>

              {(!visit && !orderID) ? (
                <Controller
                  name="orderId"
                  control={control}
                  render={({ field }) => (
                    <>
                      {errors.orderId && (
                        <p className="text-red-500 text-sm">{errors.orderId.message}</p>
                      )}
                      <select
                        {...field}
                        id="orderId"
                        className={`shadow-sm appearance-none border rounded-sm w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-hidden focus:ring-3 focus:ring-primary dark:bg-background-dark ${errors.orderId ? 'border-red-500' : ''}`}
                        disabled={loading}
                        onChange={(e) => {
                          const selectedId = Number(e.target.value)
                          field.onChange(selectedId)

                          const order = orders.find(o => o.id === selectedId)
                          if (order) {
                            setValue("clientId", order.clientId)
                            const responsible = order.workers.find(w => w.isResponsible)
                            if (responsible) {
                              setValue("userId", responsible.userId)
                            }
                          }
                        }}
                      >
                        <option value="" disabled>Selecciona una orden</option>
                        {loading
                          ? <option value="" disabled>Cargando órdenes...</option>
                          : orders.map(order => (
                            <option key={order.id} value={order.id}>
                              {order.description} - {order.status}
                            </option>
                          ))}
                      </select>
                    </>
                  )}
                />
              ) : (
                <>
                  <div className="mt-1 text-sm text-text-light">
                    {selectedOrder?.description ?? "Sin descripción"}
                  </div>
                  <Controller
                    name="orderId"
                    control={control}
                    render={({ field }) => <input type="hidden" {...field} />}
                  />
                </>
              )}

              {/* Fechas de orden */}
              <div className="mt-4">
                {selectedOrder?.scheduledDate && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium">Inicio:</span>{" "}
                    {capitalize(new Date(selectedOrder.scheduledDate).toLocaleDateString("es-PE", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }))}
                  </div>
                )}
                {selectedOrder?.endDate && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Fin:</span>{" "}
                    {capitalize(new Date(selectedOrder.endDate).toLocaleDateString("es-PE", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }))}
                  </div>
                )}
              </div>

              {selectedOrder?.status && (
                <span
                  className={`mt-3 inline-block align-middle text-xs px-2 py-0.5 rounded-full font-semibold
                    ${selectedOrder.status === "COMPLETED"
                      ? "bg-green-200 text-green-800"
                      : selectedOrder.status === "IN_PROGRESS"
                        ? "bg-yellow-200 text-yellow-800"
                        : ["FAILED", "CANCELLED"].includes(selectedOrder.status)
                          ? "bg-red-200 text-red-800"
                          : "bg-gray-200 text-gray-800"}
                  `}
                >
                  {selectedOrder.status.replace("_", " ")}
                </span>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-light">Cliente</label>
              <p className="text-text-light">
                {orders.find(o => o.id === watch("orderId"))?.client?.name ?? "Sin cliente"}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-light">Técnicos Asignados</label>
              <ul className="mt-1 list-disc pl-5 text-text-light space-y-1">
                {
                  (() => {
                    const selectedOrder = orders.find(o => o.id === watch("orderId"))
                    if (!selectedOrder) return <li>No hay técnicos asignados</li>

                    return selectedOrder.workers.map(worker => {
                      const fullName = `${worker.user.firstName?.split(" ")[0]} ${worker.user.lastName?.split(" ")[0]}`
                      return (
                        <li key={worker.userId} className="flex items-center gap-2">
                          <span>{fullName}</span>
                          {worker.isResponsible && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-primary-light text-primary-dark dark:bg-primary-dark dark:text-background-dark">
                              Responsable
                            </span>
                          )}
                        </li>
                      )
                    })
                  })()
                }
              </ul>
            </div>

            {/* Cliente */}
            <Controller
              name="clientId"
              control={control}
              render={({ field }) => <input type="hidden" {...field} />}
            />

            {/* Trabajador */}
            <Controller
              name="userId"
              control={control}
              render={({ field }) => <input type="hidden" {...field} />}
            />

            {isReviewedValue && (
              <Controller
                name="evaluation"
                control={control}
                render={({ field }) => (
                  <div className="mb-4">
                    <label htmlFor="evaluation" className="block text-sm font-medium text-gray-700">Evaluación (0-5)</label>
                    {errors.evaluation && <p className="text-red-500 text-sm">{errors.evaluation.message}</p>}
                    <Input
                      {...field}
                      id="evaluation"
                      type="number"
                      min={0}
                      max={5}
                      step={0.1}
                      placeholder="Ej. 4.5"
                      className={`${errors.evaluation ? 'border-red-500' : ''}`}
                      onChange={(e) => {
                        const value = e.target.value
                        const numberValue = parseFloat(value)
                        field.onChange(isNaN(numberValue) ? undefined : numberValue)
                      }}
                      onBlur={(e) => {
                        const value = e.target.value
                        const numberValue = parseFloat(value)

                        if (isNaN(numberValue) || value === "") {
                          setValue("isReviewed", false)
                          setValue("evaluation", undefined)
                        } else {
                          setValue("isReviewed", true)
                        }
                      }}
                    />
                  </div>
                )}
              />
            )}

            <Controller
              name="isReviewed"
              control={control}
              render={({ field }) => (
                <div className="mb-4 flex items-center space-x-2">
                  <input
                    {...field}
                    autoFocus
                    type="checkbox"
                    id="isReviewed"
                    className="form-checkbox h-5 w-5 text-primary"
                    checked={field.value}
                    onChange={(e) => {
                      const checked = e.target.checked
                      field.onChange(checked)

                      if (!checked) {
                        // Limpiar evaluación si se desmarca
                        setValue("evaluation", undefined)
                      }
                    }}
                  />
                  <label htmlFor="isReviewed" className="text-sm text-text-light">
                    ¿Revisada?
                  </label>
                </div>
              )}
            />
          </>
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
                disabled={!isValid || loading || isSaving}
              >
                {visit
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

export default VisitCard
