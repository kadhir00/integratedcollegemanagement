// client/src/components/AppLayout.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    { name: "Admin", path: "/admin", role: "admin" },
    { name: "Faculty", path: "/faculty", role: "faculty" },
    { name: "Student", path: "/student", role: "student" },
  ];

  const filteredMenu = menuItems.filter((m) => m.role === user?.role);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white w-64 p-4 border-r hidden md:block ${mobileOpen ? "block" : ""}`}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center mb-8">
            <h2 className="text-2xl font-bold text-deep-blue">ICMP</h2>
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded">
              {user?.role?.toUpperCase()}
            </span>
          </div>
          <nav className="flex-1">
            {filteredMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block py-2 px-3 rounded hover:bg-gray-200 ${isActive ? "bg-deep-blue text-white" : "text-gray-700"}`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="mt-4 w-full py-2 px-3 text-left text-gray-600 hover:bg-gray-200 rounded"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile drawer toggle */}
      <button
        className="md:hidden p-2 fixed top-4 left-4 z-20"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation drawer"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
