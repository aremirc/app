import { useEffect, useState } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import api from "@/lib/axios";
import { toast } from "sonner";

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

const UserCard = ({ user, handleAddUser, setIsModalOpen, handleCancel }) => {
  const [newUser, setNewUser] = useState(user ? { ...user, password: '' } : defaultValues);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/roles");
        setRoles(response.data);
      } catch (error) {
        console.error("Error al obtener los roles:", error);
        toast.error("No se pudieron cargar los roles.", { description: error.response?.data?.error || error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Funciones de validación
  const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const isValidDNI = (dni) => /^\d{8}$/.test(dni);

  const validateUser = (user) => {
    if (!user.dni || !user.username || !user.email || !user.password) return "Por favor, completa todos los campos.";
    if (!isValidDNI(user.dni)) return "Por favor, ingresa un DNI válido.";
    if (!isValidEmail(user.email)) return "Por favor, ingresa un correo electrónico válido.";
    if (user.password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    return null;
  };

  const addUser = async () => {
    try {
      const [userResponse, workerResponse] = await Promise.all([
        api.post('/api/users', newUser),
        api.post('/api/workers', newUser),
      ]);
      handleAddUser(userResponse.data);
      setNewUser(defaultValues);
      toast.success('¡Nuevo usuario guardado!', { description: userResponse.data.message, className: 'dark:border-none dark:bg-primary-dark' });
    } catch (error) {
      toast.error('Error al guardar los datos:', {
        description: error.response?.data?.error || error.message,
        className: 'dark:border-none dark:bg-background-dark dark:text-danger-dark'
      });
    }
  };

  const editUser = async () => {
    try {
      const response = await api.put('/api/users', newUser);
      handleAddUser(response.data);
      toast.success('Cambios guardados correctamente.', { className: 'dark:border-none dark:bg-primary-dark' });
      handleCancel();
    } catch (error) {
      toast.error('Error al guardar los datos:', {
        description: error.response?.data?.error || error.message,
        className: 'dark:border-none dark:bg-background-dark dark:text-danger-dark'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateUser(newUser);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      user ? await editUser() : await addUser();
    } catch (error) {
      toast.error('Error al guardar los datos:', {
        description: error.response?.data?.error || error.message,
        className: 'dark:border-none dark:bg-background-dark dark:text-danger-dark'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = newUser.dni.trim() !== "" && newUser.username.trim() !== "" && newUser.email.trim() !== "" && newUser.password.trim() !== "" && isValidEmail(newUser.email) && isValidDNI(newUser.dni);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <form onSubmit={handleSubmit} className="min-w-96 bg-background-light dark:bg-text-dark text-text-light p-6 rounded-lg shadow-lg max-w-sm">
        <h3 className="text-lg font-semibold mb-4">{user ? 'Modificar Usuario' : 'Agregar Nuevo Usuario'}</h3>

        <Input
          type="text"
          value={newUser.dni}
          onChange={(e) => setNewUser({ ...newUser, dni: e.target.value })}
          placeholder="DNI"
          className="mb-4"
          disabled={user}
        />

        <Input
          type="text"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          placeholder="Nombre de usuario"
          className="mb-4"
        />

        {!user && <Input
          type="text"
          value={newUser.firstName}
          onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
          placeholder="Nombre"
          className="mb-4"
        />}

        {!user && <Input
          type="text"
          value={newUser.lastName}
          onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
          placeholder="Apellido"
          className="mb-4"
        />}

        <Input
          type="email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          placeholder="Correo electrónico"
          className="mb-4"
        />

        {!user && <Input
          type="text"
          value={newUser.phone}
          onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
          placeholder="Teléfono"
          className="mb-4"
        />}

        <Input
          type="password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          placeholder={user ? "Contraseña nueva" : "Contraseña"}
          className="mb-4"
        />

        <div className="mb-4">
          <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
            Selecciona un Rol
          </label>
          <select
            id="roleId"
            value={newUser.roleId}
            onChange={(e) => setNewUser({ ...newUser, roleId: parseInt(e.target.value) })}
            className="shadow appearance-none border rounded w-full py-2 px-3 dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary dark:bg-background-dark"
            disabled={loading}
          >
            {loading ? (
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

        <div className="flex justify-end space-x-2">
          <Button onClick={handleCancel}>Cancelar</Button>
          <Button
            type="submit"
            className="hover:bg-primary dark:hover:bg-primary-dark dark:hover:text-background-dark"
            disabled={!isFormValid || loading || isSubmitting}
          >
            {isSubmitting ? (user ? "Guardando..." : "Agregando...") : (user ? "Guardar" : "Agregar")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserCard;
