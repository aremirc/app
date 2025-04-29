import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Input from "../atoms/Input"
import Button from "../atoms/Button"
import { useClients } from "@/hooks/useClients"

// Esquema de validación con Zod
const clientSchema = z.object({
  dni: z.string().min(1, "El DNI es obligatorio").length(8, "El DNI debe tener 8 dígitos numéricos").regex(/^\d{8}$/, "El DNI debe ser solo numérico"),
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido").min(1, "El correo electrónico es obligatorio"),
  phone: z.string().min(1, "El teléfono es obligatorio").regex(/^\d{9}$/, "El teléfono debe tener 9 dígitos numéricos"),
  address: z.string().min(1, "La dirección es obligatoria"),
})

const defaultValues = {
  dni: "",
  name: "",
  email: "",
  phone: "",
  address: "",
}

const ClientCard = ({ client, handleCancel }) => {
  const { addClientMutation, updateClientMutation } = useClients()

  const { control, handleSubmit, formState: { errors, isValid, isSubmitting }, reset, setValue } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: client || defaultValues,
    mode: "onBlur",
  })
  
  const onSubmit = (data) => {
    if (client) {
      updateClientMutation.mutateAsync(data)
    } else {
      addClientMutation.mutateAsync(data)
    }
    handleCancel()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <form onSubmit={handleSubmit(onSubmit)} className="min-w-96 bg-background-light dark:bg-text-dark text-text-light p-6 rounded-lg shadow-lg max-w-sm">
        <h3 className="text-lg font-semibold mb-4">{client ? "Modificar Cliente" : "Agregar Nuevo Cliente"}</h3>

        {/* DNI */}
        <Controller
          name="dni"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="text"
              placeholder="DNI"
              className={`mb-4 ${errors.dni ? 'border-red-500' : ''}`}
              disabled={client} // Deshabilitar si es una edición
            />
          )}
        />
        {errors.dni && <p className="text-red-500 text-sm">{errors.dni.message}</p>}

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

        {/* Correo electrónico */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="email"
              placeholder="Correo electrónico"
              className={`mb-4 ${errors.email ? 'border-red-500' : ''}`}
            />
          )}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

        {/* Teléfono */}
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="text"
              placeholder="Teléfono"
              className={`mb-4 ${errors.phone ? 'border-red-500' : ''}`}
            />
          )}
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}

        {/* Dirección */}
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="text"
              placeholder="Dirección"
              className={`mb-4 ${errors.address ? 'border-red-500' : ''}`}
            />
          )}
        />
        {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}

        <div className="flex justify-end space-x-2">
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button
            type="submit"
            className="hover:bg-primary dark:hover:bg-primary-dark dark:hover:text-background-dark"
            disabled={!isValid || isSubmitting} // Deshabilitar el botón si el formulario no es válido
          >
            {isSubmitting ? (client ? "Guardando..." : "Agregando...") : (client ? "Guardar" : "Agregar")}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ClientCard
