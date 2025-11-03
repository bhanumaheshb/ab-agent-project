import React, { useState, useContext } from 'react'; // <-- Import useState
import { Routes, Route, NavLink, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// --- Pages ---
import ProjectsPage from './pages/ProjectsPage';
import Dashboard from './pages/Dashboard';
import CreateExperiment from './pages/CreateExperiment';
import ExperimentSetupPage from './pages/ExperimentSetupPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminProjectsPage from './pages/AdminProjectsPage';
import AdminRoute from './components/AdminRoute';

// --- Icons ---
import { 
  FolderIcon, 
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
  Bars3Icon, // <-- Add Hamburger Icon
  XMarkIcon  // <-- Add Close Icon
} from '@heroicons/react/24/solid';

// --- Reusable Nav Link Component ---
function NavItem({ to, icon: Icon, children }) {
  // ... (This component is unchanged)
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
  const { user, logout } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // <-- Add state for mobile menu

  return (
    // Changed to relative for mobile overlay
    <div className="relative flex h-screen bg-gray-100 overflow-hidden">
      
      {/* --- Sidebar Navigation --- */}
      {/* --- THIS IS THE MAIN CHANGE --- */}
      <nav 
        className={`
          flex flex-col w-64 bg-gray-800 p-4 shadow-lg z-20 
          transform transition-transform duration-300 ease-in-out
          absolute md:static h-full
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
        `}
      >
        <div className="flex justify-between items-center py-4 px-2">
          <span className="text-2xl font-bold text-white">A/B Agent</span>
          {/* Mobile Close Button */}
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-300">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Nav Links */}
        <ul className="space-y-2 flex-grow">
          <li>
            <NavItem to="/projects" icon={FolderIcon}>My Projects</NavItem>
          </li>
          
          {/* ADMIN ONLY SECTION */}
          {user && user.isAdmin && (
            // ... (admin section is unchanged)
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
          {/* ... (user email and logout button are unchanged) ... */}
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
      
      {/* Dim overlay for mobile (when menu is open) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
        />
      )}

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* --- Mobile Header Bar --- */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 text-gray-700">
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="text-lg font-bold text-gray-800">A/B Agent</span>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet /> {/* This is where the nested routes will render */}
        </main>
      </div>
    </div>
  );
}

// --- The Main App Router (Unchanged) ---
function App() {
  const { user } = useContext(AuthContext); // <-- Corrected

  return (
    <Routes>
      {/* ... (all your Route components are unchanged) ... */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/projects" />} />
      <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/projects" />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/projects" replace />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="project/:projectId" element={<Dashboard />} />
        <Route path="project/:projectId/create" element={<CreateExperiment />} />
        <Route path="experiment/:experimentId/setup" element={<ExperimentSetupPage />} />
        <Route path="admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="admin/projects" element={<AdminRoute><AdminProjectsPage /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to={user ? "/projects" : "/login"} />} />
    </Routes>
  );
}

export default App;
