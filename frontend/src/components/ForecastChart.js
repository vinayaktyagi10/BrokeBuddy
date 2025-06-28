import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function ForecastChart({ forecastData }) {
  if (!forecastData || forecastData.length === 0) return <p>No forecast data available.</p>;

  const data = {
    labels: forecastData.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [{
      label: 'Predicted Expenses (₹)',
      data: forecastData.map(item => item.expected_spend),
      borderColor: '#00ff7f',
      backgroundColor: 'rgba(0, 255, 127, 0.2)',
      tension: 0.3,
      fill: true,
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: context => `₹${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "₹ Spent"
        },
        ticks: {
          callback: value => `₹${value}`
        }
      },
      x: {
        title: {
          display: true,
          text: "Date"
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-2">30-Day Forecast</h2>
      <Line data={data} options={options} />
    </div>
  );
}
