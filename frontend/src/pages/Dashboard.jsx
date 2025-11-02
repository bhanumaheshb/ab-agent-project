import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import ExperimentCard from '../components/ExperimentCard';
import LineGraph from '../components/LineGraph'; // <-- 1. IMPORT LINE GRAPH
import { BeakerIcon, PlusIcon } from '@heroicons/react/24/solid';

function Dashboard() {
  const { projectId } = useParams(); // Get projectId from URL
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      setError('');
      api.getExperimentsByProject(projectId)
        .then(response => {
          setExperiments(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching experiments:', error);
          setError('Failed to load experiments.');
          setLoading(false);
        });
    }
  }, [projectId]);

  if (loading) return <p>Loading experiments...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">
          Experiments Dashboard
        </h1>
        <Link
          to={`/project/${projectId}/create`}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          Create Experiment
        </Link>
      </div>

      {experiments.length === 0 ? (
        // ... (empty state code is fine) ...
        <div className="text-center mt-16 p-12 bg-white rounded-xl shadow-lg">
          <BeakerIcon className="mx-auto h-24 w-24 text-gray-300" />
          <h2 className="mt-6 text-2xl font-bold text-gray-800">No Experiments Found</h2>
          <p className="mt-2 text-gray-500">
            Get started by creating your first A/B test for this project.
          </p>
        </div>
      ) : (
        // --- 2. THIS IS THE MAIN CHANGE ---
        // We map over each experiment and render BOTH cards.
        // The grid will automatically place them side-by-side.
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {experiments.map(exp => (
            <React.Fragment key={exp._id}>
              <ExperimentCard experiment={exp} />
              
              {/* This is the new, separate card for the line graph */}
              <div className="bg-white p-6 rounded-xl shadow-lg h-full">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Performance Over Time</h4>
                <div className="h-96">
                  <LineGraph experiment={exp} />
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;