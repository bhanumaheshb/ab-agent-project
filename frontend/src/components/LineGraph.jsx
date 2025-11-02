import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

// --- 1. Import all Chart.js parts ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // <-- This was the missing plugin
} from 'chart.js';
import api from '../services/api';

// --- 2. Register all the parts ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler // <-- Register the plugin
);

/**
 * @desc Helper to format data for the chart
 */
function formatChartData(stats, variations) {
  // Get all unique days from the stats
  const dateLabels = [...new Set(stats.map(s => new Date(s.date).toLocaleDateString()))];
  
  // --- THIS IS THE FIX ---
  // We add a "Start" label at the beginning
  const labels = ["Start", ...dateLabels];
  
  const datasets = variations.map((variation, index) => {
    // Assign a color to each variation
    const colors = ['rgba(59, 130, 246, 1)', 'rgba(34, 197, 94, 1)', 'rgba(234, 179, 8, 1)'];
    const bgColors = ['rgba(59, 130, 246, 0.2)', 'rgba(34, 197, 94, 0.2)', 'rgba(234, 179, 8, 0.2)'];
    
    const data = labels.map(label => {
      // --- THIS IS THE FIX ---
      // The "Start" point is always 0
      if (label === "Start") {
        return 0;
      }

      let dailyTrials = 0;
      let dailySuccesses = 0;

      // Find all stats for this variation and this day
      stats.filter(s => 
          s.variationName === variation.name && 
          new Date(s.date).toLocaleDateString() === label
      ).forEach(s => {
          dailyTrials += s.trials;
          dailySuccesses += s.successes;
      });

      // Calculate conversion rate for that day
      return dailyTrials > 0 ? (dailySuccesses / dailyTrials) * 100 : 0;
    });

    return {
      label: variation.name,
      data: data,
      borderColor: colors[index % colors.length],
      backgroundColor: bgColors[index % colors.length],
      fill: true, // This line now works because of the Filler plugin
      tension: 0.1
    };
  });

  return { labels, datasets };
}

/**
 * @desc The Line Graph component
 */
function LineGraph({ experiment }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Fetch the daily stats for this experiment
    api.getExperimentStats(experiment._id)
      .then(res => {
        const data = formatChartData(res.data, experiment.variations);
        setChartData(data);
      })
      .catch(err => console.error("Error fetching line graph stats", err));
  }, [experiment._id, experiment.variations]);

  // Don't render anything until the data is loaded
  if (!chartData) return <p>Loading graph data...</p>;
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Conversion Rate (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  return <Line options={options} data={chartData} />;
}

export default LineGraph;