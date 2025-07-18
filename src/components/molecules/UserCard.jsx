import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useUsers } from "@/hooks/useUsers"
import api from "@/lib/axios"
import Input from "../atoms/Input"
import Button from "../atoms/Button"
import Stepper from "../organisms/Stepper"
import StepNavigation from "../organisms/StepNavigation"
import LoadingOverlay from "../atoms/LoadingOverlay"
import PasswordInput from "../atoms/PasswordInput"

const steps = [
  { id: 1, title: "Datos" },
  { id: 2, title: "Contacto" },
  { id: 3, title: "Acceso" },
]

// Esquema de validación con Zod
const userSchema = z.object({
  dni: z.string().min(1, "El DNI es obligatorio").regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  gender: z.enum(["MALE", "FEMALE"], { message: "El género es obligatorio" }),
  birthDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(new Date(val).getTime()), {
      message: "Fecha inválida",
    })
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const today = new Date();
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      return date <= eighteenYearsAgo;
    }, {
      message: "Debes ser mayor de 18 años",
    })
    .transform((val) => (val ? new Date(val).toISOString() : undefined)),
  phone: z.string().regex(/^\d{9}$/, "El teléfono debe tener 9 dígitos numéricos").optional(),
  email: z.string().email("Correo electrónico inválido"),
  country: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]).default("ACTIVE"),
  username: z.string().min(3, "Por favor, ingresa al menos 3 caracteres."),
  roleId: z.number().int().positive("El Rol es obligatorio"),
  // avatar: z
  //   .any()
  //   .optional()
  //   .refine((file) => !file || file instanceof File, "Archivo inválido"),
  // socialLinks: z
  //   .object({
  //     instagram: z.string().url("URL inválida").optional(),
  //     linkedin: z.string().url("URL inválida").optional(),
  //   })
  //   .partial()
  //   .optional(),
  isVerified: z.boolean().default(false),
})

const createUserSchema = userSchema.extend({
  password: z.string().refine(
    (val) =>
      val.length >= 8 &&
      /[A-Z]/.test(val) &&
      /\d/.test(val) &&
      /[\W_]/.test(val),
    {
      message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial",
    }
  ),
})

const editUserSchema = userSchema.extend({
  password: z.string().optional().refine(
    (val) =>
      !val || (
        val.length >= 8 &&
        /[A-Z]/.test(val) &&
        /\d/.test(val) &&
        /[\W_]/.test(val)
      ),
    {
      message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial",
    }
  ),
})

const defaultValues = {
  dni: "",
  firstName: "",
  lastName: "",
  gender: "",
  birthDate: "",
  phone: "",
  email: "",
  country: "",
  address: "",
  status: "PENDING_VERIFICATION",
  username: "",
  password: "",
  roleId: 1,
  avatar: null,
  socialLinks: {},
  isVerified: false,
}

const fetchRoles = async () => {
  const { data } = await api.get("/api/roles")
  return data
}

const toLocalDateInput = (isoDate) => {
  if (!isoDate) return ""
  const date = new Date(isoDate)
  return date.toISOString().split("T")[0]
  // const offset = date.getTimezoneOffset() * 60000
  // return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

const UserCard = ({ user, setUser, handleCancel }) => {
  const [step, setStep] = useState(1)
  const { addUserMutation, updateUserMutation } = useUsers()

  const { control, handleSubmit, formState: { errors, isValid, isSubmitting }, setValue, watch, reset, trigger } = useForm({
    resolver: zodResolver(!!user ? editUserSchema : createUserSchema),
    defaultValues: user ? {
      ...user,
      birthDate: user?.birthDate ? toLocalDateInput(user.birthDate) : "",
      phone: user.phone ?? "",
      country: user.country ?? "",
      address: user.address ?? "",
      password: ""
    } : defaultValues,
    mode: "onChange",
  })

  const isSaving = addUserMutation.isPending || updateUserMutation.isPending || isSubmitting

  const emailValue = watch("email")

  useEffect(() => {
    if (!user && emailValue) {
      const [localPart] = emailValue.split("@")
      if (localPart && /^[a-zA-Z0-9._-]+$/.test(localPart)) {
        setValue("username", localPart)
      }
    }
  }, [emailValue, user, setValue])

  const { data: roles = [], isLoading: rolesLoading, isError: rolesError } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles
  })

  const onSubmit = async (data) => {
    try {
      if (user) {
        await updateUserMutation.mutateAsync(data)
      } else {
        await addUserMutation.mutateAsync(data)
      }

      setUser?.(data) // Actualiza el estado en el padre
      handleCancel() // Solo se ejecuta si la mutación fue exitosa
    } catch (error) {
      // Ya estás mostrando el toast de error dentro del hook
      // Aquí podrías hacer algo adicional si quieres
      console.error("Error al guardar el usuario", error)
    }
  }

  const validateStepAndSet = async (newStep) => {
    const fieldsToValidate = {
      1: ["dni", "firstName", "lastName", "gender", "birthDate"],
      2: ["phone", "email", "country", "address"],
      3: ["username", "password", "roleId"],
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

        <h3 className="text-lg font-semibold mb-4">{user ? 'Modificar Usuario' : 'Agregar Nuevo Usuario'}</h3>

        <Stepper
          steps={steps}
          controlledStep={step}
          onStepChange={validateStepAndSet}
        />

        {step === 1 && (
          <>
            {!user && (
              < Controller
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
                      placeholder="DNI"
                      className={`${errors.dni ? "border-red-500" : ""}`}
                      inputMode="numeric"
                      pattern="\d*"
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/\D/g, '') // Elimina todo lo que no sea dígito
                        if (onlyNums.length <= 8) {
                          field.onChange(onlyNums)
                        }
                      }}
                      disabled={user}
                    />
                  </div>
                )}
              />
            )}

            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombres</label>
                  {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                  <Input
                    {...field}
                    id="firstName"
                    placeholder="Nombre"
                    className={`${errors.firstName ? "border-red-500" : ""}`}
                  />
                </div>
              )}
            />

            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellidos</label>
                  {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                  <Input
                    {...field}
                    id="lastName"
                    placeholder="Apellido"
                    className={`${errors.lastName ? "border-red-500" : ""}`}
                  />
                </div>
              )}
            />

            {/* Gender */}
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Género</label>
                  {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
                  <select
                    {...field}
                    id="gender"
                    className={`shadow-sm appearance-none border rounded-sm w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-hidden focus:ring-3 focus:ring-primary dark:bg-background-dark ${errors.gender ? "border-red-500" : ""}`}
                  >
                    <option value="" disabled>Seleccione</option>
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                  </select>
                </div>
              )}
            />

            {/* Birth Date */}
            <Controller
              name="birthDate"
              control={control}
              render={({ field }) => {
                const today = new Date();
                const maxDate = today.toISOString().split("T")[0]; // Fecha actual: YYYY-MM-DD
                const minDate = new Date(today.getFullYear() - 75, today.getMonth(), today.getDate())
                  .toISOString()
                  .split("T")[0]; // Fecha mínima permitida: hoy - 75 años

                return (
                  <div className="mb-4">
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                    {errors.birthDate?.message && <p className="text-red-500 text-sm">{errors.birthDate.message}</p>}
                    <Input
                      {...field}
                      type="date"
                      id="birthDate"
                      min={minDate} // <-- aquí limitas a que tenga máximo 75 años
                      max={maxDate}
                      placeholder="Fecha de nacimiento"
                      className={`shadow-sm appearance-none border rounded-sm w-full py-2 px-3 leading-tight focus:outline-hidden focus:ring-3 focus:ring-primary dark:bg-background-dark dark:text-text-dark ${errors.birthDate ? "border-red-500" : ""}`}
                      required={false}
                    />
                  </div>
                )
              }}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                  <Input
                    {...field}
                    autoFocus
                    id="phone"
                    placeholder="Teléfono"
                    className={`${errors.phone ? "border-red-500" : ""}`}
                    inputMode="numeric"
                    pattern="\d*"
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, '') // Elimina todo lo que no sea dígito
                      if (onlyNums.length <= 9) {
                        field.onChange(onlyNums)
                      }
                    }}
                  />
                </div>
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="Correo electrónico"
                    className={`${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
              )}
            />

            {/* Country */}
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">País</label>
                  {errors.country && <p className="text-red-500 text-sm">{errors.country.message}</p>}
                  <Input
                    {...field}
                    id="country"
                    placeholder="Ej. Perú"
                    list="country-suggestions"
                    className={`${errors.country ? "border-red-500" : ""}`}
                    required={false}
                  />
                  <datalist id="country-suggestions">
                    <option value="Perú" />
                    <option value="Argentina" />
                    <option value="México" />
                    <option value="Colombia" />
                    <option value="Chile" />
                  </datalist>
                </div>
              )}
            />

            {/* Address */}
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
                    placeholder="Dirección actual"
                    className={`${errors.address ? "border-red-500" : ""}`}
                    required={false}
                  />
                </div>
              )}
            />
          </>
        )}

        {step === 3 && (
          <>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nombre de usuario</label>
                  {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                  <Input
                    {...field}
                    autoFocus
                    id="username"
                    placeholder="Usuario"
                    className={`${errors.username ? "border-red-500" : ""}`}
                  />
                </div>
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">{user ? "Contraseña nueva" : "Contraseña"}</label>
                  {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                  <PasswordInput
                    {...field}
                    id="password"
                    placeholder={user ? "Contraseña nueva (opcional)" : "Contraseña"}
                    className={`${errors.password ? "border-red-500" : ""}`}
                    required={false}
                  />
                </div>
              )}
            />

            <Controller
              name="roleId"
              control={control}
              render={({ field }) => (
                <div className="mb-4">
                  <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">Selecciona un Rol</label>
                  {errors.roleId && <p className="text-red-500 text-sm">{errors.roleId.message}</p>}
                  <select
                    id="roleId"
                    {...field}
                    className={`shadow-sm appearance-none border rounded-sm w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-hidden focus:ring-3 focus:ring-primary dark:bg-background-dark ${errors.roleId ? "border-red-500" : ""}`}
                    disabled={rolesLoading || rolesError} // Deshabilitar solo si hay error o carga
                    onChange={(e) => {
                      // Convertir el valor seleccionado a número
                      field.onChange(Number(e.target.value))
                    }}
                  >
                    {rolesLoading ? (
                      <option value="" disabled>Cargando roles...</option>
                    ) : rolesError ? (
                      <option value="" disabled>Error al cargar roles</option>
                    ) : roles.length ? (
                      roles.map((role) => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))
                    ) : (
                      <option value="" disabled>No hay roles disponibles</option> // Si no hay roles
                    )}
                  </select>
                </div>
              )}
            />

            {user && (
              <>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="mb-4">
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                      {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                      <select
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value)

                          if (value === "ACTIVE") {
                            setValue("isVerified", true)
                          } else {
                            setValue("isVerified", false)
                          }
                        }}
                        className={`shadow-sm appearance-none border rounded-sm w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-hidden focus:ring-3 focus:ring-primary dark:bg-background-dark ${errors.status ? 'border-red-500' : ''}`}
                        disabled={!user}
                      >
                        <option value="ACTIVE">Activo</option>
                        <option value="INACTIVE">Inactivo</option>
                        <option value="SUSPENDED">Suspendido</option>
                        {!user.isVerified && (<option value="PENDING_VERIFICATION">Pendiente</option>)}
                      </select>
                    </div>
                  )}
                />

                {!user.isVerified && (
                  <Controller
                    name="isVerified"
                    control={control}
                    render={({ field }) => (
                      <div className="mb-4 flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => {
                            const checked = e.target.checked
                            field.onChange(checked)

                            if (checked) {
                              setValue("status", "ACTIVE")
                            } else {
                              setValue("status", "PENDING_VERIFICATION")
                            }
                          }}
                          id="isVerified"
                          className="form-checkbox h-5 w-5 text-primary dark:bg-background-dark"
                          disabled={!user}
                        />
                        <label htmlFor="isVerified" className="text-sm font-medium text-gray-700">
                          Cuenta verificada
                        </label>
                        {errors.isVerified && <p className="text-red-500 text-sm">{errors.isVerified.message}</p>}
                      </div>
                    )}
                  />
                )}

                {/* Avatar */}
                {/* <Controller
                  name="avatar"
                  control={control}
                  render={({ field }) => {
                    const previewUrl = field.value instanceof File ? URL.createObjectURL(field.value) : null

                    return (
                      <div className="mb-4">
                        <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">Foto de perfil</label>
                        {errors.avatar && <p className="text-red-500 text-sm">{errors.avatar.message}</p>}
                        <Input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            field.onChange(file)
                          }}
                          className={`mb-2 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark dark:text-text-dark dark:bg-background-dark ${errors.avatar ? "border-red-500" : ""}`}
                          required={false}
                        />

                        {previewUrl && (
                          <div className="mt-2">
                            <img src={previewUrl} alt="Preview" className="h-20 w-20 rounded-full object-cover border" />
                          </div>
                        )}
                      </div>
                    )
                  }}
                /> */}

                {/* Social Links: Instagram */}
                {/* <Controller
                  name="socialLinks.instagram"
                  control={control}
                  render={({ field }) => (
                    <div className="mb-4">
                      <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">Instagram</label>
                      {errors.socialLinks?.instagram && <p className="text-red-500 text-sm">{errors.socialLinks.instagram.message}</p>}
                      <Input
                        {...field}
                        id="instagram"
                        type="url"
                        placeholder="https://instagram.com/usuario"
                        className={`mb-4 ${errors.socialLinks?.instagram ? "border-red-500" : ""}`}
                        required={false}
                      />
                    </div>
                  )}
                /> */}

                {/* LinkedIn */}
                {/* <Controller
                  name="socialLinks.linkedin"
                  control={control}
                  render={({ field }) => (
                    <div className="mb-4">
                      <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">LinkedIn</label>
                      {errors.socialLinks?.linkedin && <p className="text-red-500 text-sm">{errors.socialLinks.linkedin.message}</p>}
                      <Input
                        {...field}
                        id="linkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/usuario"
                        className={`mb-4 ${errors.socialLinks?.linkedin ? "border-red-500" : ""}`}
                        required={false}
                      />
                    </div>
                  )}
                /> */}
              </>
            )}
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
                disabled={isSaving || !isValid}
              >
                {isSaving
                  ? user ? "Guardando..." : "Agregando..."
                  : user ? "Guardar" : "Agregar"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default UserCard
