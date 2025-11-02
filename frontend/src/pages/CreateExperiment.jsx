import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { PlusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

function CreateExperiment() {
  const { projectId } = useParams(); // Get projectId from URL
  const [name, setName] = useState('');
  const [variations, setVariations] = useState([{ name: '' }, { name: '' }]);
  const navigate = useNavigate();

  const handleVariationChange = (index, event) => {
    const values = [...variations];
    values[index].name = event.target.value;
    setVariations(values);
  };

  const handleAddVariation = () => {
    setVariations([...variations, { name: '' }]);
  };

  const handleRemoveVariation = (index) => {
    if (variations.length <= 2) return;
    const values = [...variations];
    values.splice(index, 1);
    setVariations(values);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const filteredVariations = variations.filter(v => v.name.trim() !== '');
    
    if (name && filteredVariations.length >= 2 && projectId) {
      // Send the projectId along with the rest of the data
      api.createExperiment({ name, variations: filteredVariations, projectId })
        .then(() => navigate(`/project/${projectId}`)) // Go back to project dashboard
        .catch(error => console.error('Error creating experiment:', error));
    } else {
      alert('Please provide an experiment name and at least two variation names.');
    }
  };

  return (
    <>
      <Link 
        to={`/project/${projectId}`} 
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Project
      </Link>
      
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Create New Experiment</h2>
        
        <div>
          <label htmlFor="exp-name" className="block text-sm font-medium text-gray-700">
            Experiment Name
          </label>
          <input
            type="text"
            id="exp-name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Variations (at least 2)
          </label>
          <div className="space-y-3">
            {variations.map((variation, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Variation ${index + 1} Name`}
                  value={variation.name}
                  onChange={e => handleVariationChange(index, e)}
                  required
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {index > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVariation(index)}
                    className="p-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleAddVariation}
            className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <PlusIcon className="h-5 w-5" />
            Add Variation
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700"
          >
            Create Experiment
          </button>
        </div>
      </form>
    </>
  );
}

export default CreateExperiment;