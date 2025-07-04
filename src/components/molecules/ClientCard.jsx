// 1. Paquetes externos
import { useForm, Controller, useWatch } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

// 2. Hooks personalizados
import { useClients } from "@/hooks/useClients"

// 3. Componentes internos
import Input from "../atoms/Input"
import Button from "../atoms/Button"
import Stepper from "../organisms/Stepper"
import StepNavigation from "../organisms/StepNavigation"
import LoadingOverlay from "../atoms/LoadingOverlay"

// 4. React hooks (si no usaste arriba)
import { useState } from "react"
import PasswordInput from "../atoms/PasswordInput"

const steps = [
  { id: 1, title: "Datos" },
  { id: 2, title: "Contacto" },
  { id: 3, title: "Opcional" },
]

const ClientTypeEnum = z.enum(["INDIVIDUAL", "COMPANY"])

// Esquema Zod condicional para dni o ruc según type
const clientSchema = z.object({
  id: z.string().optional(),
  type: ClientTypeEnum.optional(),
  dni: z.string().optional(),
  ruc: z.string().optional(),
  name: z.string().min(1, "El nombre es obligatorio"),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 6,
      { message: "La contraseña debe tener al menos 6 caracteres" }
    ),
  email: z.string().email("Correo electrónico inválido").min(1, "El correo electrónico es obligatorio"),
  phone: z.string().min(1, "El teléfono es obligatorio").regex(/^\d{9}$/, "El teléfono debe tener 9 dígitos numéricos"),
  address: z.string().min(1, "La dirección es obligatoria"),
  contactPersonName: z.string().optional(),
  contactPersonPhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{6,9}$/.test(val),
      { message: "El número debe tener entre 6 y 9 dígitos" }
    ),
  notes: z.string().optional(),
  isActive: z.boolean(),
})
  .superRefine((data, ctx) => {
    if (data.type === "INDIVIDUAL") {
      if (!data.dni || !/^\d{8}$/.test(data.dni)) {
        ctx.addIssue({
          path: ["dni"],
          code: z.ZodIssueCode.custom,
          message: "DNI debe tener 8 dígitos numéricos",
        })
      }
    }

    if (data.type === "COMPANY") {
      if (!data.ruc || !/^\d{11}$/.test(data.ruc)) {
        ctx.addIssue({
          path: ["ruc"],
          code: z.ZodIssueCode.custom,
          message: "RUC debe tener 11 dígitos numéricos",
        })
      }
    }
  })

const defaultValues = {
  id: "",
  type: "INDIVIDUAL",
  dni: "",
  ruc: "",
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  contactPersonName: "",
  contactPersonPhone: "",
  notes: "",
  isActive: true,
}

const ClientCard = ({ client, handleCancel }) => {
  const [step, setStep] = useState(1)
  const { addClientMutation, updateClientMutation } = useClients()

  const cleanClient = {
    ...client,
    ...(client?.type === "INDIVIDUAL" && { dni: client?.id }),
    ...(client?.type === "COMPANY" && { ruc: client?.id }),
    contactPersonName: client?.contactPersonName ?? "",
    contactPersonPhone: client?.contactPersonPhone ?? "",
    notes: client?.notes ?? "",
    password: "", // no traerla
  }

  const { control, handleSubmit, formState: { errors, isValid, isSubmitting }, watch, reset, setValue, trigger } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: client ? cleanClient : defaultValues,
    mode: "onChange",
  })

  const isSaving = isSubmitting || addClientMutation.isPending || updateClientMutation.isPending

  const typeValue = useWatch({
    control,
    name: "type",
  })

  const onSubmit = async (data) => {
    if (!data.id) {
      data.id = data.type === "INDIVIDUAL" ? data.dni : data.ruc
    }

    try {
      if (client) {
        await updateClientMutation.mutateAsync(data)
      } else {
        await addClientMutation.mutateAsync(data)
      }
      handleCancel() // Solo se ejecuta si la mutación fue exitosa
    } catch (error) {
      // Ya estás mostrando el toast de error dentro del hook
      // Aquí podrías hacer algo adicional si quieres
      console.error("Error al guardar el usuario", error)
    }
  }

  const validateStepAndSet = async (newStep) => {
    const fieldsToValidate = {
      1: ["type", "dni", "ruc", "name"],
      2: ["email", "phone", "address", "password"],
      3: ["contactPersonName", "contactPersonPhone", "notes"],
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

        <h3 className="text-lg font-semibold mb-4">{client ? "Modificar Cliente" : "Agregar Nuevo Cliente"}</h3>

        <Stepper
          steps={steps}
          controlledStep={step}
          onStepChange={validateStepAndSet}
        />

        {step === 1 && (
          <>
            {/* Tipo */}
            {!client && (
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <div className="mb-4">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de cliente</label>
                    <select {...field} id="type" className="shadow appearance-none border rounded-sm w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-hidden focus:ring-3 focus:ring-primary dark:bg-background-dark" disabled={Boolean(client)}>
                      <option value="INDIVIDUAL">Individual</option>
                      <option value="COMPANY">Empresa</option>
                    </select>
                  </div>
                )}
              />
            )}

            {typeValue === "INDIVIDUAL" && (
              <Controller
                name="dni"
                control={control}
                render={({ field }) => (
                  <div className="mb-4">
                    <label htmlFor="dni" className="block text-sm font-medium text-gray-700">DNI</label>
                    {errors.dni && <p className="text-red-500 text-sm">{errors.dni.message}</p>}
                    <Input
                      {...field}
                      autoFocus
                      id="dni"
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/\D/g, '') // Elimina todo lo que no sea dígito
                        if (onlyNums.length <= 8) {
                          field.onChange(onlyNums)
                        }
                      }}
                      placeholder="DNI (8 dígitos)"
                      className={`${errors.dni ? "border-red-500" : ""}`}
                      disabled={Boolean(client)} // opcional: bloquear si es edición
                    />
                  </div>
                )}
              />
            )}

            {typeValue === "COMPANY" && (
              <Controller
                name="ruc"
                control={control}
                render={({ field }) => (
                  <div className="mb-4">
                    <label htmlFor="ruc" className="block text-sm font-medium text-gray-700">RUC</label>
                    {errors.ruc && <p className="text-red-500 text-sm">{errors.ruc.message}</p>}
                    <Input
                      {...field}
                      id="ruc"
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/\D/g, '') // Elimina todo lo que no sea dígito
                        if (onlyNums.length <= 11) {
                          field.onChange(onlyNums)
                        }
                      }}
                      placeholder="RUC (11 dígitos)"
                      className={`${errors.ruc ? "border-red-500" : ""}`}
                      disabled={Boolean(client)} // opcional: bloquear si es edición
                    />
                  </div>
                )}
              />
            )}

            {/* Nombre */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre {typeValue === "COMPANY" ? "de la empresa" : "del cliente"}</label>
                  {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                  <Input
                    {...field}
                    id="name"
                    type="text"
                    placeholder="Nombre"
                    className={`${errors.name ? 'border-red-500' : ''}`}
                  />
                </div>
              )}
            />

            {/* isActive */}
            {client && (
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center mb-4 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="mr-2"
                      disabled={!client}
                    />
                    Cliente activo
                  </label>
                )}
              />
            )}
          </>
        )}

        {step === 2 && (
          <>
            {/* Correo electrónico */}
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                  <Input
                    {...field}
                    autoFocus
                    id="email"
                    type="email"
                    placeholder="Correo electrónico"
                    className={`${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
              )}
            />

            {/* Teléfono */}
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono electrónico</label>
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                  <Input
                    {...field}
                    id="phone"
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, '') // Elimina todo lo que no sea dígito
                      if (onlyNums.length <= 9) {
                        field.onChange(onlyNums)
                      }
                    }}
                    placeholder="Teléfono"
                    className={`${errors.phone ? 'border-red-500' : ''}`}
                  />
                </div>
              )}
            />

            {/* Dirección */}
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
                  {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                  <Input
                    {...field}
                    id="address"
                    type="text"
                    placeholder="Dirección"
                    className={`${errors.address ? 'border-red-500' : ''}`}
                  />
                </div>
              )}
            />

            {/* Password */}
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña (opcional)</label>
                  {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                  <PasswordInput
                    {...field}
                    id="password"
                    placeholder="Contraseña (min. 6 caracteres)"
                    className={`${errors.password ? 'border-red-500' : ''}`}
                    required={false}
                  />
                </div>
              )}
            />
          </>
        )}

        {step === 3 && (
          <>
            {/* ContactPersonName */}
            <Controller
              name="contactPersonName"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="contactPersonName" className="block text-sm font-medium text-gray-700">Nombre de contacto</label>
                  <Input
                    {...field}
                    autoFocus
                    id="contactPersonName"
                    type="text"
                    placeholder="Nombre de contacto (opcional)"
                    required={false}
                  />
                </div>
              )}
            />

            {/* ContactPersonPhone */}
            <Controller
              name="contactPersonPhone"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="contactPersonPhone" className="block text-sm font-medium text-gray-700">Teléfono de contacto</label>
                  {errors.contactPersonPhone && <p className="text-red-500 text-sm">{errors.contactPersonPhone.message}</p>}
                  <Input
                    {...field}
                    id="contactPersonPhone"
                    type="text"
                    placeholder="Teléfono de contacto (opcional)"
                    className={`${errors.contactPersonPhone ? 'border-red-500' : ''}`}
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
                </div>
              )}
            />

            {/* Notes */}
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas</label>
                  <textarea
                    {...field}
                    id="notes"
                    placeholder="Notas (opcional)"
                    className="w-full p-2 border rounded-sm appearance-none dark:bg-background-dark dark:text-text-dark leading-tight focus:outline-hidden focus:ring-3 focus:ring-primary resize-none"
                    rows={3}
                  />
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
                disabled={!isValid || isSaving} // Deshabilitar el botón si el formulario no es válido
              >
                {isSaving
                  ? client ? "Guardando..." : "Agregando..."
                  : client ? "Guardar" : "Agregar"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default ClientCard
