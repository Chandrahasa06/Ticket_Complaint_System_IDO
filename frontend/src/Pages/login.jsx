import React from "react";

const Login = ({ onLogin }) => {
  return (
    <div className="login-wrapper">
      <div className="login-card">

        <div className="login-title">
          Ticket Management System
        </div>
        <div className="login-subtitle">
          Sign in to your account
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">
              Username / Email
            </label>
            <input
              type="text"
              placeholder="Enter your email"
              className="login-input"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="login-input"
            />
          </div>

          <div className="text-right text-sm text-blue-600 cursor-pointer">
            Forgot password?
          </div>

          <button
            onClick={() => onLogin("user")}
            className="login-btn"
          >
            Sign In
          </button>

          <div className="text-center text-sm text-gray-500">
            OR
          </div>

          <button className="w-full border rounded-lg py-2 text-gray-700 hover:bg-gray-100 transition">
            Continue with Google
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => onLogin("admin")} className="role-btn">
            Admin
          </button>
          <button onClick={() => onLogin("engineer")} className="role-btn">
            Engineer
          </button>
          <button onClick={() => onLogin("technician")} className="role-btn">
            Technician
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
