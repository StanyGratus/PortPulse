import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

function ScoreTimeline({ data }) {
  if (!data || data.length < 2) {
    return (
      <div style={{ color: '#484f58', textAlign: 'center', padding: '40px 0', fontSize: '0.85rem' }}>
        Scan this target at least twice to see the score timeline.
      </div>
    );
  }

  const chartData = data.map(scan => ({
    date: new Date(scan.scannedAt).toLocaleDateString(),
    score: scan.riskScore,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
        <XAxis dataKey="date" tick={{ fill: '#8b949e', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#8b949e', fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '8px',
            color: '#c9d1d9',
          }}
        />
        <ReferenceLine y={80} stroke="#3fb950" strokeDasharray="4 4" label={{ value: 'Good', fill: '#3fb950', fontSize: 10 }} />
        <ReferenceLine y={50} stroke="#d29922" strokeDasharray="4 4" label={{ value: 'Fair', fill: '#d29922', fontSize: 10 }} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#58a6ff"
          strokeWidth={2}
          dot={{ fill: '#58a6ff', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default ScoreTimeline;