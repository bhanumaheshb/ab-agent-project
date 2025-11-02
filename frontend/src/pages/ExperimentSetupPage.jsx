import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeftIcon, ClipboardIcon } from '@heroicons/react/24/solid';

/**
 * A helper component for a "copy-to-clipboard" code block
 */
function CodeBlock({ codeString }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2s
  };

  return (
    <div className="relative bg-gray-900 text-white p-4 rounded-lg font-mono text-sm">
      <button 
        onClick={copyToClipboard} 
        className="absolute top-2 right-2 p-1 bg-gray-700 rounded-lg hover:bg-gray-600"
      >
        <ClipboardIcon className="h-5 w-5" />
      </button>
      <pre>{codeString}</pre>
      {copied && <span className="absolute bottom-2 right-2 text-xs text-green-400">Copied!</span>}
    </div>
  );
}

/**
 * The main page component for showing setup instructions
 */
function ExperimentSetupPage() {
  const { experimentId } = useParams();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the experiment data when the page loads
  useEffect(() => {
    api.getExperimentById(experimentId)
      .then(res => {
        setExperiment(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching experiment", err);
        setLoading(false);
      });
  }, [experimentId]);

  // --- Show loading/error states ---
  if (loading) return <p>Loading setup instructions...</p>;
  if (!experiment) return <p>Experiment not found.</p>;

  // --- Dynamically generate the code snippets ---
  
  // 1. The main script tag
  const scriptTag = 
`<script 
  async 
  src="http://localhost:8080/agent.js" 
  data-exp-id="${experiment._id}">
</script>`;

  // 2. The decision logic, dynamically built with variation names
  const decisionLogic = 
`<script>
  // This function is called by agent.js
  window.onABAgentDecision = function(decision) {
    
    // Find the element you want to change
    // Example: const button = document.getElementById('hero-button');
    
    ${experiment.variations.map((variation, index) => `
    ${index === 0 ? 'if' : 'else if'} (decision === '${variation.name}') {
      // --- Logic for ${variation.name} ---
      // Example:
      // button.style.backgroundColor = 'blue';
      // button.innerText = 'Start Trial';
    }
    `).join('')}
  };
</script>`;

  // 3. The tracking call
  const trackCall = 
`<button 
  id="hero-button" 
  onclick="window.ABAgent.track()">
  
  Your Button Text
  
</button>`;

  return (
    <div>
      <Link 
        to={`/project/${experiment.project}`} 
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Project Dashboard
      </Link>
      
      <h1 className="text-3xl font-bold mb-4">Setup for: {experiment.name}</h1>
      <p className="mb-6 text-gray-600">
        Follow these steps to install the A/B test on your landing page.
      </p>

      <div className="space-y-8">
        {/* Step 1 */}
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-3">Step 1: Install the Agent Script</h2>
          <p className="mb-4">Paste this code anywhere inside the &lt;head&gt;. tag of your website.</p>
          <CodeBlock codeString={scriptTag} />
        </div>

        {/* Step 2 */}
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-3">Step 2: Add Decision Logic</h2>
          <p className="mb-4">
            This code tells your page what to do when the agent makes a decision. 
            Paste it just before your closing `&lt;/body&gt;` tag.
          </p>
          <CodeBlock codeString={decisionLogic} />
        </div>

        {/* Step 3 */}
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-3">Step 3: Track Conversions</h2>
          <p className="mb-4">
            Call the `window.ABAgent.track()` function when a user achieves the goal 
            (e.g., clicking the button, submitting a form).
          </p>
          <CodeBlock codeString={trackCall} />
        </div>
      </div>
    </div>
  );
}

export default ExperimentSetupPage;