import { Routes, Route, Navigate } from "react-router-dom";
import Cookies from "js-cookie";

// Middlewares
import ProtectedRoute from "./middlewares/ProtectedRoute";

// Role Selection
import LoginRoleSelect from "./pages/LoginRoleSelect";

// Login pages
import UserLogin from "./pages/User/Login";
import AdminLogin from "./pages/Admin/Login";
import EngineerLogin from "./pages/Engineer/Login";
import TechnicianLogin from "./pages/Technician/Login";

// Dashboards
import UserDashboard from "./pages/User/Dashboard";
import AdminDashboard from "./pages/Admin/Dashboard";
import EngineerDashboard from "./pages/Engineer/Dashboard";
import TechnicianDashboard from "./pages/Technician/Dashboard";

// 🔹 Public Route Wrapper
const PublicRoute = ({ children }) => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");

  if (token && role) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* ROLE SELECTION */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LoginRoleSelect />
          </PublicRoute>
        }
      />

      {/* LOGIN ROUTES */}
      <Route
        path="/login/user"
        element={
          <PublicRoute>
            <UserLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/login/admin"
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/login/engineer"
        element={
          <PublicRoute>
            <EngineerLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/login/technician"
        element={
          <PublicRoute>
            <TechnicianLogin />
          </PublicRoute>
        }
      />

      {/* DASHBOARDS */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute roles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/engineer/dashboard"
        element={
          <ProtectedRoute roles={["engineer"]}>
            <EngineerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/dashboard"
        element={
          <ProtectedRoute roles={["technician"]}>
            <TechnicianDashboard />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;