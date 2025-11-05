import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import {
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  BeakerIcon,
} from "@heroicons/react/24/solid";
import "./AppWhite.css";

function CreateExperiment() {
  const { projectId } = useParams();
  const [name, setName] = useState("");
  const [variations, setVariations] = useState([{ name: "" }, { name: "" }]);
  const navigate = useNavigate();

  const handleVariationChange = (index, event) => {
    const updated = [...variations];
    updated[index].name = event.target.value;
    setVariations(updated);
  };

  const handleAddVariation = () => {
    setVariations([...variations, { name: "" }]);
  };

  const handleRemoveVariation = (index) => {
    if (variations.length <= 2) return;
    const updated = [...variations];
    updated.splice(index, 1);
    setVariations(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validVariations = variations.filter((v) => v.name.trim() !== "");

    if (!name || validVariations.length < 2) {
      alert("Please provide a name and at least two variations.");
      return;
    }

    try {
      await api.createExperiment({
        name,
        variations: validVariations,
        projectId,
      });
      navigate(`/project/${projectId}`);
    } catch (err) {
      console.error("Error creating experiment:", err);
      alert("Failed to create experiment. Try again.");
    }
  };

  return (
    <div className="page-container">
      {/* Back Link */}
      <Link
        to={`/project/${projectId}`}
        className="flex items-center gap-2 text-sky-600 hover:text-sky-800 mb-6 font-medium"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Project
      </Link>

      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <BeakerIcon className="h-10 w-10 text-sky-600" />
        <h1 className="text-3xl font-bold text-gray-800">
          Create New Experiment
        </h1>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="card p-8 max-w-3xl mx-auto space-y-6"
      >
        {/* Experiment Name */}
        <div>
          <label
            htmlFor="exp-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Experiment Name
          </label>
          <input
            id="exp-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Button Color Test"
            required
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Variations Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variations <span className="text-gray-500">(at least 2)</span>
          </label>
          <div className="space-y-3">
            {variations.map((v, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Variation ${index + 1}`}
                  value={v.name}
                  onChange={(e) => handleVariationChange(index, e)}
                  required
                  className="flex-grow block px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                {index > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVariation(index)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm"
                    title="Remove Variation"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleAddVariation}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 shadow-sm"
          >
            <PlusIcon className="h-5 w-5" />
            Add Variation
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 shadow-md"
          >
            <BeakerIcon className="h-5 w-5" />
            Create Experiment
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateExperiment;
