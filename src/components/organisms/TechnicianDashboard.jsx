import ProtectedRoute from "../ProtectedRoute"

const TechnicianDashboard = ({ children }) => (
  <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
    {children}
  </ProtectedRoute>
)

export default TechnicianDashboard