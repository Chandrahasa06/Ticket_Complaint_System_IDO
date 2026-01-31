import React, { useState } from "react";

/* Role Selection */
import LoginRoleSelect from "./Pages/LoginRoleSelect";

/* Login Pages */
import UserLogin from "./Pages/UserLogin";
import AdminLogin from "./Pages/AdminLogin";
import EngineerLogin from "./Pages/EngineerLogin";
import TechnicianLogin from "./Pages/TechnicianLogin";

/* Dashboards */
import UserDashboard from "./Pages/UserDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import EngineerDashboard from "./Pages/EngineerDashboard";
import TechnicianDashboard from "./Pages/TechnicianDashboard";

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