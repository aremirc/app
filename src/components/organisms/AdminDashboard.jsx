import ProtectedRoute from "../ProtectedRoute"

const AdminDashboard = ({ children }) => (
  <ProtectedRoute allowedRoles={["Admin"]}>
    {children}
  </ProtectedRoute>
)

export default AdminDashboard