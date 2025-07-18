import React from 'react';
import { useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export const PChart = ({ data = [], title = "P-Chart - Performance Monitoring" }) => {
    const theme = useTheme();
    
    const mockData = [
        { date: '2024-01-01', proportion: 0.95, ucl: 0.98, lcl: 0.92, centerLine: 0.95 },
        { date: '2024-01-02', proportion: 0.94, ucl: 0.98, lcl: 0.92, centerLine: 0.95 },
        { date: '2024-01-03', proportion: 0.96, ucl: 0.98, lcl: 0.92, centerLine: 0.95 },
        { date: '2024-01-04', proportion: 0.93, ucl: 0.98, lcl: 0.92, centerLine: 0.95 },
        { date: '2024-01-05', proportion: 0.97, ucl: 0.98, lcl: 0.92, centerLine: 0.95 },
        { date: '2024-01-06', proportion: 0.95, ucl: 0.98, lcl: 0.92, centerLine: 0.95 },
        { date: '2024-01-07', proportion: 0.94, ucl: 0.98, lcl: 0.92, centerLine: 0.95 },
    ];
    
    const chartData = data.length > 0 ? data : mockData;
    
    return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
            />
            <XAxis 
              dataKey="date" 
              angle={-45}
              textAnchor="end"
              height={70}
              interval={0}
              fontSize={12}
              tickMargin={12}
              stroke={theme.palette.mode === 'dark' ? '#fff' : '#666'}
            />
            <YAxis 
              fontSize={12}
              stroke={theme.palette.mode === 'dark' ? '#fff' : '#666'}
              domain={[0.8, 1.0]}
              tickFormatter={v => `${(v * 100).toFixed(1)}%`}
            />
            <Tooltip 
              contentStyle={{
                fontSize: '12px',
                padding: '8px',
                backgroundColor: theme.palette.mode === 'dark' ? '#1e3a5f' : '#fff',
                color: theme.palette.mode === 'dark' ? '#fff' : '#666'
              }}
              formatter={(value, name) => [
                `${(value * 100).toFixed(2)}%`,
                name === 'proportion' ? 'Pass Rate' : 
                name === 'ucl' ? 'Upper Control Limit' :
                name === 'lcl' ? 'Lower Control Limit' : 'Center Line'
              ]}
            />
            <Legend 
              wrapperStyle={{
                fontSize: '12px',
                color: theme.palette.mode === 'dark' ? '#fff' : '#666'
              }}
            />
            
            {/* Upper Control Limit */}
            <Line
              type="monotone"
              dataKey="ucl"
              stroke="#ff0000"
              strokeDasharray="5 5"
              name="Upper Control Limit"
              dot={false}
              strokeWidth={2}
            />
            
            {/* Lower Control Limit */}
            <Line
              type="monotone"
              dataKey="lcl"
              stroke="#ff0000"
              strokeDasharray="5 5"
              name="Lower Control Limit"
              dot={false}
              strokeWidth={2}
            />
            
            {/* Center Line */}
            <Line
              type="monotone"
              dataKey="centerLine"
              stroke="#00ff00"
              strokeDasharray="3 3"
              name="Center Line"
              dot={false}
              strokeWidth={2}
            />
            
            {/* Actual Performance Data */}
            <Line
              type="monotone"
              dataKey="proportion"
              stroke="#1976d2"
              name="Pass Rate"
              dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
    );
}; 