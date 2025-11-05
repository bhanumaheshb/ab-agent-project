import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import ExperimentCard from "../components/ExperimentCard";
import LineGraph from "../components/LineGraph";
import { BeakerIcon, PlusIcon } from "@heroicons/react/24/solid";
import "./AppWhite.css";

function Dashboard() {
  const { projectId } = useParams();
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (projectId) {
      api
        .getExperimentsByProject(projectId)
        .then((res) => {
          setExperiments(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load experiments.");
          setLoading(false);
        });
    }
  }, [projectId]);

  if (loading) return <p>Loading experiments...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="page-container">
      <div className="section-header">
        <h1>Experiments Dashboard</h1>
        <Link
          to={`/project/${projectId}/create`}
          className="flex items-center gap-2 px-5 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 shadow-sm"
        >
          <PlusIcon className="h-5 w-5" />
          Create Experiment
        </Link>
      </div>

      {experiments.length === 0 ? (
        <div className="card text-center p-12 mt-8">
          <BeakerIcon className="mx-auto h-20 w-20 text-gray-400" />
          <h2 className="text-2xl font-semibold mt-4 text-gray-800">
            No Experiments Found
          </h2>
          <p className="text-gray-500 mt-2">
            Start your first A/B test for this project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {experiments.map((exp) => (
            <React.Fragment key={exp._id}>
              <div className="card p-6">
                <ExperimentCard experiment={exp} />
              </div>
              <div className="card p-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-700">
                  Performance Over Time
                </h4>
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
