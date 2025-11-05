import React, { useState, useContext } from "react";
import { Routes, Route, NavLink, Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// --- Pages ---
import Home from "./pages/Home"; // ✅ Public landing page
import ProjectsPage from "./pages/ProjectsPage";
import Dashboard from "./pages/Dashboard";
import CreateExperiment from "./pages/CreateExperiment";
import ExperimentSetupPage from "./pages/ExperimentSetupPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminProjectsPage from "./pages/AdminProjectsPage";

// --- Icons ---
import {
  FolderIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

// --- Sidebar NavItem ---
function NavItem({ to, icon: Icon, children }) {
  const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-lg text-gray-200";
  const activeClasses = "bg-gray-700 font-semibold text-white";
  const inactiveClasses = "hover:bg-gray-700/50";
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
      }
    >
      <Icon className="h-6 w-6" />
      {children}
    </NavLink>
  );
}

// --- Main App Layout (protected section) ---
function AppLayout() {
  const { user, logout } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <nav
        className={`
          flex flex-col w-64 bg-gray-800 p-4 shadow-lg z-20 
          transform transition-transform duration-300 ease-in-out
          absolute md:static h-full
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
        `}
      >
        <div className="flex justify-between items-center py-4 px-2">
          <span className="text-2xl font-bold text-white">A/B Agent</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <ul className="space-y-2 flex-grow">
          <li>
            <NavItem to="/app/projects" icon={FolderIcon}>
              My Projects
            </NavItem>
          </li>

          {/* Admin Section */}
          {user?.isAdmin && (
            <li className="pt-4 mt-4 border-t border-gray-700">
              <span className="px-4 text-xs font-semibold text-gray-500 uppercase">
                Admin
              </span>
              <ul className="space-y-2 mt-2">
                <li>
                  <NavItem to="/app/admin/users" icon={ShieldCheckIcon}>
                    Users
                  </NavItem>
                </li>
                <li>
                  <NavItem to="/app/admin/projects" icon={ShieldCheckIcon}>
                    Projects
                  </NavItem>
                </li>
              </ul>
            </li>
          )}
        </ul>

        <div className="mt-auto">
          <div className="px-4 py-2 text-gray-400 text-sm truncate">
            {user?.email} {user?.isAdmin && "(Admin)"}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-300 hover:bg-red-700/50"
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
            Logout
          </button>
        </div>
      </nav>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 text-gray-700"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="text-lg font-bold text-gray-800">A/B Agent</span>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// --- Main App Routes ---
function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/app/projects" />}
      />
      <Route
        path="/signup"
        element={!user ? <SignupPage /> : <Navigate to="/app/projects" />}
      />

      {/* Protected Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="project/:projectId" element={<Dashboard />} />
        <Route path="project/:projectId/create" element={<CreateExperiment />} />
        <Route
          path="experiment/:experimentId/setup"
          element={<ExperimentSetupPage />}
        />

        {/* Admin Routes */}
        <Route
          path="admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/projects"
          element={
            <AdminRoute>
              <AdminProjectsPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
