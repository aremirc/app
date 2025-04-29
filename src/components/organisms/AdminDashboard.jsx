import ProtectedRoute from "../ProtectedRoute"

const AdminDashboard = ({ children }) => (
  <ProtectedRoute allowedRoles={["ADMIN"]}>
    {children}
  </ProtectedRoute>
)

export default AdminDashboard