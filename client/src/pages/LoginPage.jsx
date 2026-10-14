// client/src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      // After login redirect based on role (handled in AuthProvider via token)
      // We assume role is set in user after login.
      if (user?.role === "admin") navigate("/admin");
      else if (user?.role === "faculty") navigate("/faculty");
      else navigate("/student");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-6 rounded shadow-md"
      >
        <h2 className="mb-4 text-2xl font-bold text-center text-deep-blue">
          Sign in
        </h2>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-deep-blue"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-deep-blue"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-deep-blue text-white py-2 rounded hover:bg-deep-blue-dark transition"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <div className="mt-4 text-center text-sm">
          <a href="#" className="text-teal-600 hover:underline">
            Forgot password?
          </a>
        </div>
      </form>
    </div>
  );
}
