import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { ArrowLeftIcon, ClipboardIcon } from "@heroicons/react/24/solid";
import "./AppWhite.css";

function CodeBlock({ codeString }) {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-sm">
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 bg-slate-700 p-1 rounded-lg hover:bg-slate-600"
      >
        <ClipboardIcon className="h-5 w-5" />
      </button>
      <pre>{codeString}</pre>
      {copied && (
        <span className="absolute bottom-2 right-2 text-xs text-green-400">
          Copied!
        </span>
      )}
    </div>
  );
}

function ExperimentSetupPage() {
  const { experimentId } = useParams();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getExperimentById(experimentId)
      .then((res) => {
        setExperiment(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [experimentId]);

  if (loading) return <p>Loading setup instructions...</p>;
  if (!experiment) return <p>Experiment not found.</p>;

  const scriptTag = `<script async src="https://backend-service-0d12.onrender.com/agent.js" data-exp-id="${experiment._id}"></script>`;

  const decisionLogic = `<script>
window.onABAgentDecision = function(decision) {
  ${experiment.variations
    .map(
      (variation, i) =>
        `${i === 0 ? "if" : "else if"} (decision === '${variation.name}') {\n    // Logic for ${variation.name}\n  }`
    )
    .join("\n  ")}
};
</script>`;

  const trackCall = `<button onclick="window.ABAgent.track()">Track Conversion</button>`;

  return (
    <div className="page-container">
      <Link
        to={`/project/${experiment.project}`}
        className="text-sky-600 hover:text-sky-800 flex items-center gap-2 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-6">{experiment.name} Setup</h1>

      <div className="space-y-8">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-2">Step 1: Add Agent Script</h2>
          <p className="text-gray-600 mb-4">
            Paste inside your <code>&lt;head&gt;</code> tag.
          </p>
          <CodeBlock codeString={scriptTag} />
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-2">Step 2: Decision Logic</h2>
          <CodeBlock codeString={decisionLogic} />
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-2">Step 3: Track Conversions</h2>
          <CodeBlock codeString={trackCall} />
        </div>
      </div>
    </div>
  );
}

export default ExperimentSetupPage;
