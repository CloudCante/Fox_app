import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ReferenceLine, Line } from 'recharts';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function getLinearRegressionLine(data) {
  if (!data || data.length < 2) return [];
  const n = data.length;
  const xSum = (n * (n - 1)) / 2;
  const ySum = data.reduce((sum, d) => sum + d.value, 0);
  const xxSum = ((n - 1) * n * (2 * n - 1)) / 6;
  const xySum = data.reduce((sum, d, i) => sum + i * d.value, 0);
  const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
  const intercept = (ySum - slope * xSum) / n;
  const result = data.map((d, i) => ({ label: d.label, value: slope * i + intercept }));
  return result;
}

const PackingOutputBarChart = ({ data, title, color = '#1976d2', showTrendLine = false, showAvgLine = true }) => {
  const avg = useMemo(() => {
    const nonZero = data.filter(d => d.value > 0);
    if (nonZero.length === 0) return 0;
    return Math.round(nonZero.reduce((sum, d) => sum + d.value, 0) / nonZero.length);
  }, [data]);

  const dataWithTrend = useMemo(() => {
    if (!title || !title.toLowerCase().includes('weekly') || !showTrendLine || data.length < 2) return data;
    const trendLine = getLinearRegressionLine(data);
    const merged = data.map((d, i) => {
      const trendVal = trendLine[i] ? trendLine[i].value : null;
      if (trendVal !== null) {
        console.log(`Trend for ${d.label}:`, trendVal);
      }
      return { ...d, trend: trendVal };
    });
    return merged;
  }, [data, showTrendLine, title]);

  const theme = useTheme();

  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom style={{ margin: 0 }}>{title}</Typography>
        {showAvgLine && avg > 0 && (
          <span style={{ fontWeight: 700, fontSize: '1.2em', color: '#d32f2f', letterSpacing: 1 }}>
            AVG: {avg}u
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dataWithTrend} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" angle={-45} textAnchor="end" height={60} tick={{ fill: theme.palette.text.secondary}}/>
          <YAxis tick={{ fill: theme.palette.text.secondary}}/>
          <Tooltip />
          <Bar dataKey="value" fill={color}>
            <LabelList dataKey="value" position="top" fill={theme.palette.text.secondary} style={{ fontWeight: 'bold', fontSize: '13px', }} />
          </Bar>
          {showAvgLine && avg > 0 && (
            <ReferenceLine y={avg} stroke="red" strokeDasharray="6 3">
              <LabelList
                value={`AVG = ${avg}u`}
                position="right"
                fill="red"
                style={{ fontWeight: 'bold', fontSize: '13px', }}
              />
            </ReferenceLine>
          )}
          {showTrendLine && title && title.toLowerCase().includes('weekly') && data.length >= 2 && (
            <Line
              type="linear"
              dataKey="trend"
              stroke="#000"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
              name="Trend"
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PackingOutputBarChart; 