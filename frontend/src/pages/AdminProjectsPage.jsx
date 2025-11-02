import React, { useState, useEffect } from 'react';
import api from '../services/api';

function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminProjects()
      .then(res => setProjects(res.data))
      .catch(err => console.error("Error fetching projects", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading projects...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6">All Projects</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agency (User)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map(project => (
            <tr key={project._id}>
              <td className="px-6 py-4 whitespace-nowrap">{project.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{project.user?.agencyName} ({project.user?.email})</td>
              <td className="px-6 py-4 whitespace-nowrap">{new Date(project.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminProjectsPage;