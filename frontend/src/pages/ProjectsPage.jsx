import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { PlusIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getProjects()
      .then((res) => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects.");
        setLoading(false);
      });
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      const { data } = await api.createProject(projectName.trim());
      setProjects([...projects, data]);
      setProjectName("");
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project.");
    }
  };

  if (loading) return <p>Loading projects...</p>;

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Your Projects
      </h1>

      {/* --- Create Project --- */}
      <form
        onSubmit={handleCreateProject}
        className="mb-8 p-6 bg-white rounded-xl shadow-lg flex gap-4"
      >
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Enter new client/project name"
          required
          className="flex-grow block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          Create Project
        </button>
      </form>

      {/* --- List of Projects --- */}
      <div className="bg-white rounded-xl shadow-lg">
        <ul className="divide-y divide-gray-200">
          {error && <li className="p-4 text-red-500">{error}</li>}
          {projects.length === 0 && !loading && (
            <li className="p-6 text-center text-gray-500">
              You haven't created any projects yet.
            </li>
          )}
          {projects.map((project) => (
            <li key={project._id}>
              {/* ✅ FIXED LINK TO DASHBOARD PAGE */}
              <Link
                to={`/app/project/${project._id}`}
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition"
              >
                <div>
                  <span className="text-xl font-semibold text-gray-800">
                    {project.name}
                  </span>
                </div>
                <ChevronRightIcon className="h-6 w-6 text-gray-400" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProjectsPage;
