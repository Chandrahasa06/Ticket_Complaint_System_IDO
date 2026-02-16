import { Routes, Route, Navigate} from "react-router-dom";

/* Role Selection */
import LoginRoleSelect from "./pages/LoginRoleSelect";

/* Login pages */
import UserLogin from "./pages/User/Login";
import AdminLogin from "./pages/Admin/Login";
import EngineerLogin from "./pages/Engineer/Login";
import TechnicianLogin from "./pages/Technician/Login";

/* Dashboards */
import UserDashboard from "./pages/User/Dashboard";
import AdminDashboard from "./pages/Admin/Dashboard";
import EngineerDashboard from "./pages/Engineer/Dashboard";
import TechnicianDashboard from "./pages/Technician/Dashboard";

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
      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/engineer/dashboard" element={<EngineerDashboard />} />
      <Route path="/technician/dashboard" element={<TechnicianDashboard />} />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
