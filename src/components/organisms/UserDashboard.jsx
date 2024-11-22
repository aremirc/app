import ProtectedRoute from "../ProtectedRoute"

const UserDashboard = ({ children }) => (
  <ProtectedRoute allowedRoles={["Worker", "Admin"]}>
    {children}
  </ProtectedRoute>
)

export default UserDashboard