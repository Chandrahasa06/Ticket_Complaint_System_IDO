import React from "react";

const EngineerLogin = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="card p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-6 text-center">Engineer Login</h2>

        <input
          type="text"
          placeholder="Engineer ID/ Email"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-2 px-4 py-2 border rounded-lg"
        />

        <div className="text-right mb-4">
          <button className="text-sm text-indigo-600 hover:underline">
            Forgot password?
          </button>
        </div>

        <button
          onClick={() => onLogin("engineer")}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Login
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t" />
          <span className="px-3 text-sm text-gray-400">OR</span>
          <div className="flex-grow border-t" />
        </div>

        <button className="w-full border py-2 rounded-lg hover:bg-gray-50">
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default EngineerLogin;
