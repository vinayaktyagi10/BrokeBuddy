import { Line } from 'react-chartjs-2';

export default function ForecastChart({ forecastData }) {
    const data = {
        labels: forecastData.map(item => new Date(item.ds).toLocaleDateString()),
        datasets: [{
            label: 'Predicted Expenses',
            data: forecastData.map(item => item.yhat),
            borderColor: '#00ff7f',
            tension: 0.1
        }]
    };

    return <Line data={data} />;
}