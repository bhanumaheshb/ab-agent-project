import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom';
import { CogIcon, TrophyIcon, UserGroupIcon, CursorArrowRaysIcon, ChartPieIcon } from '@heroicons/react/24/solid';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Status Badge Component ---
function StatusBadge({ status }) {
  const colors = {
    running: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    ended: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
      {status}
    </span>
  );
}

// --- Winner Banner Component ---
function WinnerBanner({ winner }) {
  if (winner.successes === 0) return null;
  return (
    <div className="flex items-center justify-between p-3 my-4 bg-green-100 rounded-lg">
      <div className="flex items-center gap-3">
        <TrophyIcon className="h-6 w-6 text-green-700" />
        <span className="font-semibold text-green-800">
          {winner.name} is your winner!
        </span>
      </div>
      <button className="px-4 py-1 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
        Deploy it now
      </button>
    </div>
  );
}

// --- Single Metric Card (for your 3 summary tables) ---
function SingleMetricCard({ title, value, icon: Icon }) {
  return (
    <div className="flex-1 bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-500" />
        <h4 className="text-xs font-medium text-gray-600 truncate">{title}</h4>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
    </div>
  );
}

// --- Detailed Stats Table (This is your "Conversion Rate Table") ---
function StatsTable({ variations }) {
  return (
    <div className="mt-4 border border-gray-200 rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Variation
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Trials
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Success
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
              Rate
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {variations.map(v => {
            const rate = v.trials > 0 ? (v.successes / v.trials) * 100 : 0;
            return (
              <tr key={v._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{v.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{v.trials}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{v.successes}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-600">{rate.toFixed(2)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// --- Main Experiment Card Component ---
function ExperimentCard({ experiment }) {
  // --- 1. Calculate Winner & Totals ---
  let winner = null;
  let highestRate = -1;
  let totalTrials = 0;
  let totalSuccesses = 0;

  const variationsWithRates = experiment.variations.map(v => {
    totalTrials += v.trials;
    totalSuccesses += v.successes;
    
    const rate = v.trials > 0 ? (v.successes / v.trials) : 0;
    if (rate > highestRate) {
      highestRate = rate;
      winner = v;
    }
    return { ...v, rate: rate * 100 };
  });
  
  const overallRate = totalTrials > 0 ? (totalSuccesses / totalTrials) * 100 : 0;

  // --- 2. Setup Chart Data ---
  const data = {
    labels: variationsWithRates.map(v => v.name),
    datasets: [{
      label: 'Conversion Rate (%)',
      data: variationsWithRates.map(v => v.rate),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: { y: { beginAtZero: true, max: 100 } }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow h-full">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-gray-800 truncate">{experiment.name}</h3>
        <StatusBadge status={experiment.status} />
      </div>

      {/* Winner Banner */}
      {winner && <WinnerBanner winner={winner} />}
      
      {/* 3-Card Summary */}
      <div className="flex flex-row gap-4 my-6">
        <SingleMetricCard 
          title="Total Traffic" 
          value={totalTrials} 
          icon={UserGroupIcon} 
        />
        <SingleMetricCard 
          title="Total Conversions" 
          value={totalSuccesses} 
          icon={CursorArrowRaysIcon} 
        />
        <SingleMetricCard 
          title="Overall Rate" 
          value={`${overallRate.toFixed(2)}%`} 
          icon={ChartPieIcon} 
        />
      </div>
      
      {/* Bar Chart (Conversion Rate per Variation) */}
      <div className="h-48 mb-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Variation Performance</h4>
        <Bar data={data} options={options} />
      </div>
      
      {/* Detailed Table (Your "Conversion Rate Table") */}
      <div>
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Detailed Report</h4>
        <StatsTable variations={experiment.variations} />
      </div>
      
      {/* Setup Button */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link 
          to={`/experiment/${experiment._id}/setup`} 
          className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
        >
          <CogIcon className="h-5 w-5" />
          Get Setup Code
        </Link>
      </div>
    </div>
  );
}

export default ExperimentCard;