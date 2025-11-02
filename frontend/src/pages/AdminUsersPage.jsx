import React, { useState, useEffect } from 'react';
import api from '../services/api';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminUsers()
      .then(res => setUsers(res.data))
      .catch(err => console.error("Error fetching users", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6">All Users (Agencies)</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agency Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Is Admin</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map(user => (
            <tr key={user._id}>
              <td className="px-6 py-4 whitespace-nowrap">{user.agencyName}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.isAdmin ? 'Yes' : 'No'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsersPage;