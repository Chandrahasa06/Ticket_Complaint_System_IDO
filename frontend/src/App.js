import { Routes, Route, Navigate} from "react-router-dom";

/* Role Selection */
import LoginRoleSelect from "./pages/LoginRoleSelect";

/* Login pages */
import UserLogin from "./pages/UserLogin";
import AdminLogin from "./pages/AdminLogin";
import EngineerLogin from "./pages/EngineerLogin";
import TechnicianLogin from "./pages/TechnicianLogin";

/* Dashboards */
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EngineerDashboard from "./pages/EngineerDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";

function App() {

  return (
    <Routes>
      {/* ROLE SELECTION */}
      <Route path="/" element={<LoginRoleSelect />} />

      {/* LOGIN ROUTES */}
      <Route path="/login/user" element={<UserLogin />} />
      <Route path="/login/admin" element={<AdminLogin />} />
      <Route path="/login/engineer" element={<EngineerLogin />} />
      <Route path="/login/technician" element={<TechnicianLogin />} />

      {/* DASHBOARDS */}
      <Route path="/dashboard/user" element={<UserDashboard />} />
      <Route path="/dashboard/admin" element={<AdminDashboard />} />
      <Route path="/dashboard/engineer" element={<EngineerDashboard />} />
      <Route path="/dashboard/technician" element={<TechnicianDashboard />} />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
