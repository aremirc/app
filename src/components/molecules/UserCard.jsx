import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useUsers } from "@/hooks/useUsers";

// Esquema de validación con Zod
const userSchema = z.object({
  dni: z.string().min(1, "El DNI es obligatorio").regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
  username: z.string().min(3, "El nombre de usuario es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  firstName: z.string().min(1, "El nombre es obligatorio").optional(),
  lastName: z.string().min(1, "El apellido es obligatorio").optional(),
  phone: z.string().optional(),
  // roleId: z.string().optional(),
  roleId: z.number().int().positive().optional(),
});

const defaultValues = {
  dni: "",
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  roleId: 2, // Rol por defecto
};

const fetchRoles = async () => {
  const { data } = await api.get("/api/roles");
  return data;
};

const UserCard = ({ user, handleCancel }) => {
  const { addUserMutation, updateUserMutation } = useUsers();

  const { control, handleSubmit, formState: { errors, isValid, isSubmitting }, setValue, watch, reset } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: user ? { ...user, password: '' } : defaultValues,
    mode: "onBlur", // Validación al perder el foco
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles
  });

  const onSubmit = (data) => {
    if (user) {
      updateUserMutation.mutateAsync(data);
    } else {
      addUserMutation.mutateAsync(data);
    }
    handleCancel()
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <form onSubmit={handleSubmit(onSubmit)} className="min-w-96 bg-background-light dark:bg-text-dark text-text-light p-6 rounded-lg shadow-lg max-w-sm">
        <h3 className="text-lg font-semibold mb-4">{user ? 'Modificar Usuario' : 'Agregar Nuevo Usuario'}</h3>

        <Controller
          name="dni"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="DNI"
              className={`mb-4 ${errors.dni ? "border-red-500" : ""}`}
              disabled={user}
            />
          )}
        />
        {errors.dni && <p className="text-red-500 text-sm">{errors.dni.message}</p>}

        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Nombre de usuario"
              className={`mb-4 ${errors.username ? "border-red-500" : ""}`}
            />
          )}
        />
        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}

        {!user && (
          <>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Nombre"
                  className={`mb-4 ${errors.firstName ? "border-red-500" : ""}`}
                />
              )}
            />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}

            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Apellido"
                  className={`mb-4 ${errors.lastName ? "border-red-500" : ""}`}
                />
              )}
            />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
          </>
        )}

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Correo electrónico"
              className={`mb-4 ${errors.email ? "border-red-500" : ""}`}
            />
          )}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

        {!user && (
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Teléfono"
                className={`mb-4 ${errors.phone ? "border-red-500" : ""}`}
              />
            )}
          />
        )}

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder={user ? "Contraseña nueva" : "Contraseña"}
              type="password"
              className={`mb-4 ${errors.password ? "border-red-500" : ""}`}
            />
          )}
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

        <Controller
          name="roleId"
          control={control}
          render={({ field }) => (
            <div className="mb-4">
              <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
                Selecciona un Rol
              </label>
              <select
                id="roleId"
                {...field}
                className={`shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark ${errors.roleId ? "border-red-500" : ""}`}
                disabled={rolesLoading}
              >
                {rolesLoading ? (
                  <option value="" disabled>Cargando roles...</option>
                ) : roles.length ? (
                  roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))
                ) : (
                  <option value="" disabled>No hay roles disponibles</option>
                )}
              </select>
            </div>
          )}
        />
        {errors.roleId && <p className="text-red-500 text-sm">{errors.roleId.message}</p>}

        <div className="flex justify-end space-x-2">
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button
            type="submit"
            className="hover:bg-primary dark:hover:bg-primary-dark dark:hover:text-background-dark"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (user ? "Guardando..." : "Agregando...") : (user ? "Guardar" : "Agregar")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserCard;
