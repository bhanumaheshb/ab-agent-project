import React, { useContext } from 'react'; // <-- Correct import
import { Routes, Route, NavLink, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './context/AuthContext'; // <-- Correct import
import ProtectedRoute from './components/ProtectedRoute'; // Our "Gatekeeper"

// --- Pages ---
import ProjectsPage from './pages/ProjectsPage';
import Dashboard from './pages/Dashboard';
import CreateExperiment from './pages/CreateExperiment';
import ExperimentSetupPage from './pages/ExperimentSetupPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminUsersPage from './pages/AdminUsersPage'; // <-- ADDED
import AdminProjectsPage from './pages/AdminProjectsPage'; // <-- ADDED
import AdminRoute from './components/AdminRoute'; // <-- ADDED

// --- Icons ---
import { 
  ChartPieIcon, 
  PlusCircleIcon, 
  FolderIcon, 
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon // <-- ADDED
} from '@heroicons/react/24/solid';

// --- Reusable Nav Link Component ---
function NavItem({ to, icon: Icon, children }) {
  const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-lg text-gray-200";
  const activeClasses = "bg-gray-700 font-semibold text-white";
  const inactiveClasses = "hover:bg-gray-700/50";

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <Icon className="h-6 w-6" />
      {children}
    </NavLink>
  );
}

// --- Main App Layout (for logged-in users) ---
function AppLayout() {
  const { user, logout } = useContext(AuthContext); // <-- Corrected

  return (
    <div className="flex h-screen bg-gray-100">
      {/* --- Sidebar Navigation --- */}
      <nav className="flex flex-col w-64 bg-gray-800 p-4 shadow-lg">
        <div className="py-4 px-2 text-2xl font-bold text-white">
          A/B Agent
        </div>
        
        {/* --- User Nav Links --- */}
        <ul className="space-y-2 flex-grow">
          <li>
            <NavItem to="/projects" icon={FolderIcon}>My Projects</NavItem>
          </li>
          
          {/* --- ADMIN ONLY SECTION --- */}
          {user && user.isAdmin && (
            <li className="pt-4 mt-4 border-t border-gray-700">
              <span className="px-4 text-xs font-semibold text-gray-500 uppercase">Admin</span>
              <ul className="space-y-2 mt-2">
                <li>
                  <NavItem to="/admin/users" icon={ShieldCheckIcon}>Users</NavItem>
                </li>
                 <li>
                  <NavItem to="/admin/projects" icon={ShieldCheckIcon}>Projects</NavItem>
                </li>
              </ul>
            </li>
          )}
        </ul>
        
        {/* Footer with User & Logout */}
        <div className="mt-auto">
          <div className="px-4 py-2 text-gray-400 text-sm truncate">
            {user?.email} {user?.isAdmin && '(Admin)'}
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

      {/* --- Main Content Area --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet /> {/* This is where the nested routes will render */}
      </main>
    </div>
  );
}

// --- The Main App Router ---
function App() {
  const { user } = useContext(AuthContext); // <-- Corrected

  return (
    <Routes>
      {/* Public Routes (Login/Signup) */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/projects" />} />
      <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/projects" />} />

      {/* Protected Routes (The Main App) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Default route for logged-in users */}
        <Route index element={<Navigate to="/projects" replace />} />
        
        {/* Agency/Project Routes */}
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="project/:projectId" element={<Dashboard />} />
        <Route path="project/:projectId/create" element={<CreateExperiment />} />
        <Route path="experiment/:experimentId/setup" element={<ExperimentSetupPage />} />

        {/* --- ADMIN ONLY ROUTES --- */}
        <Route path="admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="admin/projects" element={<AdminRoute><AdminProjectsPage /></AdminRoute>} />
      </Route>
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to={user ? "/projects" : "/login"} />} />
    </Routes>
  );
}

export default App;