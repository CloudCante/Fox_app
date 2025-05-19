import React from 'react';
import { useTheme } from '@mui/material';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

export const ParetoChart = ({ data }) => {
    const theme = useTheme();
    
    return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 8,
              right: 8,
              left: 8,
              bottom: 1,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
            />
            <XAxis 
              dataKey="station" 
              angle={-45}
              textAnchor="end"
              height={70}
              interval={0}
              fontSize={12}
              tickMargin={12}
              stroke={theme.palette.mode === 'dark' ? '#fff' : '#666'}
            />
            <YAxis 
              yAxisId="left" 
              fontSize={12}
              stroke={theme.palette.mode === 'dark' ? '#fff' : '#666'}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              fontSize={12}
              stroke={theme.palette.mode === 'dark' ? '#fff' : '#666'}
              domain={[0, 1]}
              tickFormatter={v => `${(v * 100).toFixed(0)}%`}
            />
            <Tooltip 
              contentStyle={{
                fontSize: '12px',
                padding: '4px',
                backgroundColor: theme.palette.mode === 'dark' ? '#1e3a5f' : '#fff',
                color: theme.palette.mode === 'dark' ? '#fff' : '#666'
              }}
            />
            <Legend 
              wrapperStyle={{
                fontSize: '12px',
                color: theme.palette.mode === 'dark' ? '#fff' : '#666'
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="fail"
              fill="#1976d2"
              name="Fail Count"
            >
              <LabelList 
                dataKey="fail" 
                position="inside" 
                fontSize={12}
                fill={theme.palette.mode === 'dark' ? '#fff' : '#666'}
                style={{ fontWeight: 'bold' }}
              />
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="failureRate"
              stroke="#ff0000"
              name="Failure Rate (%)"
              dot={{ fill: '#ff0000' }}
              label={({ x, y, value }) => {
                const yPos = y < 20 ? y + 20 : y - 10;
                return (
                  <text
                    x={x}
                    y={yPos}
                    fill="#ff0000"
                    fontSize={12}
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {value !== undefined ? `${(value * 100).toFixed(1)}%` : ''}
                  </text>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
    );
}; 