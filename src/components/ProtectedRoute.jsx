const { useAuth } = require("@/context/AuthContext")

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role.name)) {
    return <div className="text-text-light dark:text-text-dark">No tienes permiso para acceder a esta sección.</div>
  }

  return children
}

export default ProtectedRoute