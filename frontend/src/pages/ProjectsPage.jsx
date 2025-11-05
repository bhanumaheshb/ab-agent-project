import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { PlusIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import "./AppWhite.css";

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all projects on mount
  useEffect(() => {
    api
      .getProjects()
      .then((res) => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load projects. Please try again.");
        setLoading(false);
      });
  }, []);

  // Handle project creation
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      const { data } = await api.createProject(projectName.trim());
      setProjects((prev) => [...prev, data]);
      setProjectName("");
    } catch (err) {
      setError("Failed to create project. Please try again.");
    }
  };

  // --- UI ---
  if (loading)
    return (
      <div className="page-container flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading your projects...</p>
      </div>
    );

  return (
    <div className="page-container">
      {/* --- Page Header --- */}
      <div className="section-header">
        <h1>Your Projects</h1>
      </div>

      {/* --- Error Message --- */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* --- Create New Project Form --- */}
      <form
        onSubmit={handleCreateProject}
        className="card p-6 mb-10 flex flex-col sm:flex-row gap-4 items-center"
      >
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Enter new client/project name"
          required
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm w-full sm:w-auto"
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-all shadow-sm"
        >
          <PlusIcon className="h-5 w-5" />
          Create Project
        </button>
      </form>

      {/* --- Projects List --- */}
      <div className="card overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <p className="text-lg font-medium mb-2">
              You haven’t created any projects yet.
            </p>
            <p>Start by adding a new client or website project above.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {projects.map((project) => (
              <li key={project._id}>
                <Link
                  to={`/project/${project._id}`}
                  className="flex justify-between items-center p-6 hover:bg-gray-50 transition-all"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {project.name}
                    </h2>
                    {project.description && (
                      <p className="text-gray-500 text-sm mt-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ProjectsPage;
