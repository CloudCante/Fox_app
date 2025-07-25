import React from 'react';
import { Box, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PChart = ({ 
  data = [], 
  title = "P-Chart", 
  subtitle = "",
  station = "",
  model = "",
  week = ""
}) => {
  // Early return for no data
  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No data available for {station} station
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select different week, model, or station to view P-Chart data
        </Typography>
      </Box>
    );
  }

  // Calculate P-chart statistics
  const calculatePChartStats = (data) => {
    const totalDefects = data.reduce((sum, day) => sum + day.fails, 0);
    const totalSamples = data.reduce((sum, day) => sum + (day.fails + day.passes), 0);
    const P = totalDefects / totalSamples;
    const Q = 1 - P;
    const N_bar = totalSamples / data.length;
    
    return {
      P,
      UCL: P + (3 * Math.sqrt((P * Q) / N_bar)),
      LCL: Math.max(0, P - (3 * Math.sqrt((P * Q) / N_bar))), // LCL cannot be negative
      hasNegativeLCL: P - (3 * Math.sqrt((P * Q) / N_bar)) < 0
    };
  };

  const stats = calculatePChartStats(data);

  // Process daily points
  const processedData = data.map(point => {
    const totalSample = point.fails + point.passes;
    const dailyP = point.fails / totalSample;
    
    return {
      date: point.date,
      proportion: dailyP,
      isOutOfControl: dailyP > stats.UCL || dailyP < stats.LCL,
      sampleSize: totalSample,
      defects: point.fails
    };
  });

  // Check for runs (7+ points above/below centerline)
  let runCount = 0;
  let lastPosition = null;
  processedData.forEach((point, index) => {
    const currentPosition = point.proportion > stats.P;
    if (lastPosition === currentPosition) {
      runCount++;
      if (runCount >= 7) {
        // Mark points in the run as out of control
        for (let i = index - 6; i <= index; i++) {
          processedData[i].isOutOfControl = true;
        }
      }
    } else {
      runCount = 1;
    }
    lastPosition = currentPosition;
  });

  // Format data for chart
  const labels = processedData.map(point => {
    const date = new Date(point.date);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  });

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Daily Proportion',
        data: processedData.map(point => point.proportion * 100),
        borderColor: '#1976d2',
        backgroundColor: processedData.map(point => 
          point.isOutOfControl ? '#d32f2f' : '#1976d2'
        ),
        pointRadius: 6,
        pointBorderWidth: 2,
        fill: false,
        tension: 0,
        showLine: false,
      },
      {
        label: 'UCL',
        data: Array(labels.length).fill(stats.UCL * 100),
        borderColor: '#ff9800',
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
        fill: false,
      },
      {
        label: 'CL (p̄)',
        data: Array(labels.length).fill(stats.P * 100),
        borderColor: '#4caf50',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'LCL',
        data: Array(labels.length).fill(stats.LCL * 100),
        borderColor: '#ff9800',
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
        fill: false,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const dataIndex = context.dataIndex;
            const point = processedData[dataIndex];
            
            return [
              `Sample Size: ${point.sampleSize} parts`,
              `Defects: ${point.defects}`,
              `UCL: ${(stats.UCL * 100).toFixed(2)}%`,
              `LCL: ${(stats.LCL * 100).toFixed(2)}%`,
              `Status: ${point.isOutOfControl ? 'OUT OF CONTROL' : 'In Control'}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Production Day'
        },
        grid: {
          display: true,
          color: '#f0f0f0'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Defect Rate (%)'
        },
        beginAtZero: true,
        max: Math.max(stats.UCL * 100, ...processedData.map(p => p.proportion * 100)) * 1.1,
        grid: {
          display: true,
          color: '#f0f0f0'
        },
        ticks: {
          callback: function(value) {
            return value.toFixed(1) + '%';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const outOfControlCount = processedData.filter(p => p.isOutOfControl).length;

  return (
    <Box>
      {stats.hasNegativeLCL && (
        <Box sx={{ 
          bgcolor: 'warning.light', 
          p: 1, 
          borderRadius: 1, 
          mb: 2 
        }}>
          <Typography variant="body2" color="warning.dark">
            ⚠️ The Lower Control Limit calculation resulted in negative values and has been adjusted to zero.
          </Typography>
        </Box>
      )}

      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 2, 
        p: 2, 
        bgcolor: 'background.paper',
        borderRadius: 1
      }}>
        <Typography variant="body2">
          <strong>Average Defect Rate:</strong> {(stats.P * 100).toFixed(2)}%
        </Typography>
        <Typography variant="body2">
          <strong>Out of Control Points:</strong> {outOfControlCount}/{processedData.length}
        </Typography>
      </Box>

      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {subtitle}
        </Typography>
      )}
      
      <Box sx={{ height: 400, mt: 2 }}>
        <Line data={chartData} options={options} />
      </Box>

      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>P-Chart Statistics:</strong> {processedData.length} data points • 
          Control limits based on overall proportion • 
          Red points indicate out-of-control conditions • 
          3-sigma control limits (99.7% confidence)
        </Typography>
      </Box>
    </Box>
  );
};

export default PChart;