import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Input from "../atoms/Input"
import Button from "../atoms/Button"
import { useServices } from "@/hooks/useServices"

// Zod schema para validación
const serviceSchema = z.object({
  id: z.number().optional(),  // Asumimos que id es opcional, ya que podría generarse automáticamente
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  price: z.preprocess((val) => parseFloat(val), z.number().min(0.01, "El precio debe ser mayor a 0")),
  status: z.enum(["active", "inactive"], "El estado debe ser 'active' o 'inactive'"),
})

const defaultValues = {
  id: undefined,
  name: "",
  description: "",
  price: 0.01,
  status: "active",
}

const ServiceCard = ({ service, handleCancel }) => {
  const { addServiceMutation, updateServiceMutation } = useServices()

  const { control, handleSubmit, formState: { errors, isValid, isSubmitting }, setValue, watch, reset } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: service || defaultValues,
    mode: "onBlur", // Para validar al perder el foco
  })

  const onSubmit = (data) => {
    if (service) {
      updateServiceMutation.mutateAsync(data)
    } else {
      addServiceMutation.mutateAsync(data)
    }
    handleCancel()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <form onSubmit={handleSubmit(onSubmit)} className="min-w-96 bg-background-light dark:bg-text-dark text-text-light p-6 rounded-lg shadow-lg max-w-sm">
        <h3 className="text-lg font-semibold mb-4">{service ? "Modificar Servicio" : "Agregar Nuevo Servicio"}</h3>

        <Controller
          name="id"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              placeholder="ID automático"
              className={`mb-4 hidden ${errors.id ? "border-red-500" : ""}`}
              disabled
            />
          )}
        />
        {errors.id && <p className="text-red-500 text-sm">{errors.id.message}</p>}

        {/* Nombre */}
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="text"
              placeholder="Nombre"
              className={`mb-4 ${errors.name ? 'border-red-500' : ''}`}
            />
          )}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

        {/* Descripción */}
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

        {/* Precio */}
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              placeholder="Precio"
              className={`mb-4 ${errors.price ? 'border-red-500' : ''}`}
              onChange={(e) => {
                const value = Number(e.target.value) || 0; // Convertir el valor a número, y si es NaN, asignar 0
                field.onChange(value); // Actualizamos el valor en el formulario
              }}
            />
          )}
        />
        {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}

        {/* Estatus */}
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className={`shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark ${errors.status ? 'border-red-500' : ''}`}
                disabled={!service}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            )}
          />
          {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
        </div>

        <div className="flex justify-end space-x-2">
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button
            type="submit"
            className="hover:bg-primary dark:hover:bg-primary-dark dark:hover:text-background-dark"
            disabled={!isValid || isSubmitting}
          >
            {service ? (isSubmitting ? "Guardando..." : "Guardar") : (isSubmitting ? "Agregando..." : "Agregar")}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ServiceCard
