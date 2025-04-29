import ProtectedRoute from "../ProtectedRoute"

const SupervisorDashboard = ({ children }) => (
  <ProtectedRoute allowedRoles={["SUPERVISOR"]}>
    {children}
  </ProtectedRoute>
)

export default SupervisorDashboard