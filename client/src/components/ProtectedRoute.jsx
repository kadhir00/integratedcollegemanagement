// client/src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute validates authentication and role.
 * Props:
 *   allowedRoles: array of roles that may access the wrapped route.
 *   redirectPath: optional path to redirect when role mismatches (defaults to role‑specific dashboard).
 */
export default function ProtectedRoute({ allowedRoles = [], redirectPath }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Simple loading placeholder – can be replaced with a spinner.
    return <div className="flex h-screen items-center justify-center">Loading…</div>;
  }

  if (!user) {
    // Not logged in – send to login page.
    return <Navigate to="/login" replace />;
  }

  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(user.role);

  if (!hasAccess) {
    // Role does not match – redirect to the appropriate dashboard.
    const fallback = redirectPath || {
      admin: "/admin",
      faculty: "/faculty",
      student: "/student",
    }[user.role] || "/login";
    return <Navigate to={fallback} replace />;
  }

  // All good – render the nested route(s).
  return <Outlet />;
}
