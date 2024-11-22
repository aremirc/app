import ProtectedRoute from "../ProtectedRoute"

const ModeratorDashboard = ({ children }) => (
  <ProtectedRoute allowedRoles={["Moderador", "Admin"]}>
    {children}
  </ProtectedRoute>
)

export default ModeratorDashboard