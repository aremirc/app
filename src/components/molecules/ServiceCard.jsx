import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useServices } from "@/hooks/useServices"
import Input from "../atoms/Input"
import Button from "../atoms/Button"
import LoadingOverlay from "../atoms/LoadingOverlay"

// Zod schema para validación
const serviceSchema = z.object({
  id: z.number().optional(),  // Asumimos que id es opcional, ya que podría generarse automáticamente
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  price: z.preprocess((val) => parseFloat(val), z.number().min(0.01, "El precio debe ser mayor a 0")),
  status: z.enum(["ACTIVE", "INACTIVE"], "El estado debe ser 'activo' o 'inactivo'"),
  estimatedTime: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const parsed = Number(val);
      return isNaN(parsed) ? undefined : parsed;
    })
    .refine(val => val === undefined || (typeof val === "number" && val >= 0), {
      message: "El tiempo estimado debe ser un número positivo",
    }),
})

const defaultValues = {
  id: undefined,
  name: "",
  description: "",
  price: 0.01,
  status: "ACTIVE",
  estimatedTime: "",
}

const ServiceCard = ({ service, handleCancel }) => {
  const { addServiceMutation, updateServiceMutation } = useServices()

  const { control, handleSubmit, formState: { errors, isValid, isSubmitting }, setValue, watch, reset } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: service ? {
      ...service,
      estimatedTime: service.estimatedTime ?? "",
    } : defaultValues,
    mode: "onChange",
  })

  const isSaving = addServiceMutation.isPending || updateServiceMutation.isPending || isSubmitting

  const onSubmit = async (data) => {
    try {
      if (service) {
        await updateServiceMutation.mutateAsync(data)
      } else {
        await addServiceMutation.mutateAsync(data)
      }
      handleCancel() // Solo se ejecuta si la mutación fue exitosa
    } catch (error) {
      // Ya estás mostrando el toast de error dentro del hook
      // Aquí podrías hacer algo adicional si quieres
      console.error("Error al guardar el usuario", error)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <form onSubmit={handleSubmit(onSubmit)} className="relative min-w-96 bg-background-light dark:bg-text-dark text-text-light p-6 rounded-lg shadow-lg max-w-sm">
        {isSaving && <LoadingOverlay />}

        <h3 className="text-lg font-semibold mb-4">{service ? "Modificar Servicio" : "Agregar Nuevo Servicio"}</h3>

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

        {/* Nombre */}
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <>
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              <Input
                {...field}
                type="text"
                placeholder="Nombre"
                className={`mb-4 ${errors.name ? 'border-red-500' : ''}`}
              />
            </>
          )}
        />

        {/* Descripción */}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <>
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
              <Input
                {...field}
                type="text"
                placeholder="Descripción"
                className={`mb-4 ${errors.description ? 'border-red-500' : ''}`}
              />
            </>
          )}
        />

        {/* Precio */}
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <div className="mb-4">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio</label>
              {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
              <Input
                {...field}
                id="price"
                type="number"
                placeholder="Precio"
                className={`${errors.price ? 'border-red-500' : ''}`}
                onChange={(e) => {
                  const value = Number(e.target.value) || 0; // Convertir el valor a número, y si es NaN, asignar 0
                  field.onChange(value); // Actualizamos el valor en el formulario
                }}
              />
            </div>
          )}
        />

        <Controller
          name="estimatedTime"
          control={control}
          render={({ field }) => (
            <>
              {errors.estimatedTime && <p className="text-red-500 text-sm">{errors.estimatedTime.message}</p>}
              <Input
                {...field}
                type="number"
                placeholder="Tiempo estimado (opcional, minutos)"
                className={`mb-4 ${errors.estimatedTime ? "border-red-500" : ""}`}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === "" ? undefined : Number(value));
                }}
                required={false}
              />
            </>
          )}
        />

        {/* Estatus */}
        {service && (
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                <select
                  {...field}
                  className={`shadow-sm appearance-none border rounded-sm w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-hidden focus:ring-3 focus:ring-primary dark:bg-background-dark ${errors.status ? 'border-red-500' : ''}`}
                  disabled={!service}
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
              </div>
            )}
          />
        )}

        <div className="flex justify-end space-x-2">
          <Button onClick={handleCancel} disabled={isSaving}>Cancelar</Button>
          <Button
            type="submit"
            className="bg-primary-light hover:bg-primary dark:hover:bg-primary-dark dark:hover:text-background-dark"
            disabled={!isValid || isSaving}
          >
            {service
              ? isSaving ? "Guardando..." : "Guardar"
              : isSaving ? "Agregando..." : "Agregar"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ServiceCard
