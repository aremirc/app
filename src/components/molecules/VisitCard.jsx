import { useEffect, useState } from "react"
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
})
  .refine(data => new Date(data.endTime) > new Date(data.date), {
    message: "La hora de fin debe ser posterior a la de inicio",
    path: ["endTime"],
  })

const defaultValues = {
  date: "",
  endTime: "",
  description: "",
  orderId: "",
  userId: "",
  clientId: "",
  isReviewed: false,
  evaluation: 0.0,
  updatedAt: "",
}

// Funciones de consulta para react-query
const fetchOrders = async () => {
  const { data } = await api.get("/api/orders")
  return data
}

const VisitCard = ({ visit, handleCancel }) => {
  const [step, setStep] = useState(1)
  const { addVisitMutation, updateVisitMutation } = useVisits()

  const toDatetimeLocal = (dateStr) =>
    new Date(new Date(dateStr).getTime() - new Date().getTimezoneOffset() * 60000)
      .toISOString().slice(0, 16)

  const { control, handleSubmit, formState: { errors, isValid, isSubmitting }, setValue, watch, reset, trigger } = useForm({
    resolver: zodResolver(visitSchema),
    defaultValues: visit ? {
      ...visit,
      updatedAt: visit.updatedAt ?? "",
      date: visit.date ? toDatetimeLocal(visit.date) : "",
      endTime: visit.endTime ? toDatetimeLocal(visit.endTime) : "",
    } : defaultValues,
    mode: "onChange",
  })

  const isSaving = addVisitMutation.isPending || updateVisitMutation.isPending || isSubmitting

  // Usamos useQuery para obtener órdenes, clientes y trabajadores
  const { data: orders = [], isLoading: loading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders
  })

  const orderId = watch("orderId")

  useEffect(() => {
    if (!orderId) return

    const selectedOrder = orders.find(order => order.id === orderId)
    if (selectedOrder) {
      setValue("clientId", selectedOrder.clientId)

      const responsibleWorker = selectedOrder.workers.find(w => w.isResponsible)
      if (responsibleWorker) {
        setValue("userId", responsibleWorker.userId)
      }
    }
  }, [orderId, orders, setValue])

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      date: new Date(data.date),
      endTime: new Date(data.endTime),
      updatedAt: data.updatedAt,
    }

    try {
      if (visit) {
        await updateVisitMutation.mutateAsync(payload)
      } else {
        await addVisitMutation.mutateAsync(payload)
      }
      handleCancel() // Solo se ejecuta si la mutación fue exitosa
    } catch (error) {
      // Ya estás mostrando el toast de error dentro del hook
      // Aquí podrías hacer algo adicional si quieres
      console.error("Error al guardar la visita", error)
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
              render={({ field }) => {
                const today = new Date().toISOString().slice(0, 16) // "YYYY-MM-DDTHH:MM"
                return (
                  <div className="mb-4">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Hora de Inicio</label>
                    {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
                    <Input
                      {...field}
                      id="date"
                      type="datetime-local"
                      max={today}
                      className={`${errors.date ? 'border-red-500' : ''}`}
                    />
                  </div>
                )
              }}
            />

            {/* Hora de Fin */}
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => {
                const today = new Date().toISOString().slice(0, 16) // "YYYY-MM-DDTHH:MM"
                return (
                  <div className="mb-4">
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Hora de Fin</label>
                    {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}
                    <Input
                      {...field}
                      id="endTime"
                      type="datetime-local"
                      max={today}
                      className={`${errors.endTime ? 'border-red-500' : ''}`}
                    />
                  </div>
                )
              }}
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
                    id="description"
                    type="text"
                    placeholder="Descripción"
                    className={`${errors.description ? 'border-red-500' : ''}`}
                  />
                </div>
              )}
            />

            {/* Orden */}
            <Controller
              name="orderId"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">Selecciona una Orden</label>
                  {errors.orderId && <p className="text-red-500 text-sm">{errors.orderId.message}</p>}
                  <select
                    {...field}
                    id="orderId"
                    className={`shadow-sm appearance-none border rounded-sm w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-hidden focus:ring-3 focus:ring-primary dark:bg-background-dark ${errors.orderId ? 'border-red-500' : ''}`}
                    disabled={loading || visit}
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
                </div>
              )}
            />
          </>
        )}

        {step === 3 && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-light">
                Cliente
              </label>
              <p className="text-text-light">
                {orders.find(o => o.id === watch("orderId"))?.client?.name ?? "Sin cliente"}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-light">
                Técnicos Asignados
              </label>
              <ul className="mt-1 list-disc pl-5 text-text-light space-y-1">
                {
                  (() => {
                    const selectedOrder = orders.find(o => o.id === watch("orderId"))
                    if (!selectedOrder) return <li>No hay técnicos asignados</li>

                    return selectedOrder.workers.map(worker => {
                      const fullName = `${worker.user.firstName} ${worker.user.lastName}`
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
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </div>
              )}
            />

            <Controller
              name="isReviewed"
              control={control}
              render={({ field }) => (
                <div className="mb-4 flex items-center space-x-2">
                  <input
                    {...field}
                    type="checkbox"
                    id="isReviewed"
                    className="form-checkbox h-5 w-5 text-primary"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
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
