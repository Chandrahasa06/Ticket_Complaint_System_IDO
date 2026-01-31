import React from "react";

const LoginRoleSelect = ({ setPage }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Ticket Management System</h1>
        <p className="text-gray-500 mb-8">Select your role</p>

        <div className="space-y-4">
          <button
            onClick={() => setPage("user-login")}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            User
          </button>

          <button
            onClick={() => setPage("admin-login")}
            className="w-full bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-900"
          >
            Admin
          </button>

          <button
            onClick={() => setPage("engineer-login")}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Engineer
          </button>

          <button
            onClick={() => setPage("technician-login")}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
          >
            Technician
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRoleSelect;
