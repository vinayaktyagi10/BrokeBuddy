import React, { useEffect, useState } from 'react';
import { getForecast, getRisk } from '../api/forecast';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ForecastAdvice() {
  const [forecast, setForecast] = useState([]);
  const [risk, setRisk] = useState(null);

  useEffect(() => {
    getForecast().then(setForecast);
    getRisk().then(setRisk);
  }, []);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">📈 Spending Forecast</h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={forecast}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="expected_spend" stroke="#00b894" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      {risk && (
        <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500">
          <p className="font-semibold">⚠️ {risk.message}</p>
          <p>{risk.suggestion}</p>
        </div>
      )}
    </div>
  );
}
