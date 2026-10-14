// client/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  // Redirect based on role
  const path = {
    admin: "/admin",
    faculty: "/faculty",
    student: "/student",
  }[user.role] || "/login";
  return <Navigate to={path} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Protected area with layout */}
        <Route element={<ProtectedRoute allowedRoles={[]} />}> {/* any authenticated user */}
          <Route element={<AppLayout />}>
            <Route index element={<RoleRedirect />} />
            <Route path="admin" element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route index element={<AdminDashboard />} />
            </Route>
            <Route path="faculty" element={<ProtectedRoute allowedRoles={["faculty"]} />}>
              <Route index element={<FacultyDashboard />} />
            </Route>
            <Route path="student" element={<ProtectedRoute allowedRoles={["student"]} />}>
              <Route index element={<StudentDashboard />} />
            </Route>
          </Route>
        </Route>
        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
