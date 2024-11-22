import { useState, useEffect } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";
import UserCard from "../molecules/UserCard";
import Table from "../molecules/Table";
import Card from "../molecules/Card";
import DashboardGrid from "../templates/DashboardGrid";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
// import { useDebounce } from "@/hooks/useDebounce";  // Asumimos que tienes un hook de debounce

const UserPanel = () => {
  const { logout } = useAuth()
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/api/users")
        setUsers(response.data)
        setError(null)
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        setError('Hubo un error al cargar los usuarios.');
        if (error.response && error.response.status === 401) {
          logout()
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleDelete = async (dni) => {
    try {
      const [userResponse, workerResponse] = await Promise.all([
        api.delete('/api/users', { data: { dni } }), // Eliminando usuario
        api.delete('/api/workers', { data: { dni } }), // Eliminando trabajador
      ]);
      setUsers(users.filter((user) => user.dni !== dni));
      toast.error("¡Eliminado correctamente!", { className: 'dark:border-none dark:bg-background-dark dark:text-danger-dark' });
    } catch (error) {
      toast.error("Error al eliminar el usuario.", { className: 'dark:border-none dark:bg-background-dark dark:text-danger-dark' });
    }
  };

  const handleEdit = (dni) => {
    const userToEdit = users.find((user) => user.dni === dni);
    setSelectedUser(userToEdit);
    console.log(userToEdit);
    setIsModalOpen(true)
  };

  const handleAddUser = (newUser) => {
    if (newUser.username && newUser.email) {
      setUsers([...users, newUser]);
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const filteredUsers = users.filter((user) => user.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardGrid>
      <Card>
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">Panel de Usuarios</h2>
            <Button onClick={() => setIsModalOpen(true)} className="hover:bg-primary dark:hover:bg-primary-dark">Agregar Usuario</Button>
          </div>
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario"
            className="w-1/3"
          />
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <Table headers={["DNI", "Username", "Email", "RoleId", "CreatedAt"]} data={filteredUsers} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </Card>

      {/* Modal para agregar un nuevo usuario */}
      {isModalOpen && (
        <UserCard user={selectedUser} handleAddUser={handleAddUser} setIsModalOpen={setIsModalOpen} handleCancel={handleCancel} />
      )}
    </DashboardGrid>
  );
};

export default UserPanel;