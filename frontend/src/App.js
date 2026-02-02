import React, { useState } from "react";

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
  const [page, setPage] = useState("role-select");

  return (
    <>
      {page === "role-select" && <LoginRoleSelect setPage={setPage} />}

      {/* LOGIN SCREENS */}
      {page === "user-login" && <UserLogin onLogin={setPage} />}
      {page === "admin-login" && <AdminLogin onLogin={setPage} />}
      {page === "engineer-login" && <EngineerLogin onLogin={setPage} />}
      {page === "technician-login" && <TechnicianLogin onLogin={setPage} />}

      {/* DASHBOARDS */}
      {page === "user" && <UserDashboard />}
      {page === "admin" && <AdminDashboard />}
      {page === "engineer" && <EngineerDashboard />}
      {page === "technician" && <TechnicianDashboard />}
    </>
  );
}

export default App;
