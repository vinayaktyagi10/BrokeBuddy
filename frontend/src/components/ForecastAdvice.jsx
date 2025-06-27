import React, { useEffect, useState } from 'react';
import { getForecast, getRisk } from '../api/forecast';
import { LineChart, Line } from 'recharts';

export default function ForecastAdvice() {
  const [forecast, setForecast] = useState([]);
  const [risk, setRisk] = useState(null);

  useEffect(() => {
    getForecast().then(res => setForecast(res.data));
    getRisk().then(res => setRisk(res.data));
  }, []);

  return (
    <div className="forecast-advice">
      <h2>📈 Spending Forecast</h2>
      <LineChart width={400} height={200} data={forecast}>
        <Line type="monotone" dataKey="spend" stroke="#8884d8" />
      </LineChart>
      {risk && (
        <div className="risk-alert">
          <p>⚠️ <strong>{risk.message}</strong></p>
          <p>Suggested action: {risk.suggestion}</p>
        </div>
      )}
    </div>
  );
}
