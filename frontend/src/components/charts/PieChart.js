// ../charts/PieChart.js
import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Paper, Box, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// Styles
import { paperStyle, flexStyle, typeStyle, boxStyle } from '../theme/themes.js';

const COLORS = [
  '#4caf50', // green
  '#f44336', // red
  '#ff9800', // orange
  '#2196f3', // blue
  '#9c27b0', // purple
  '#607d8b', // gray
];

export const PieChart = memo(function PieChart({ label, data, loading }) {
  const theme = useTheme();

  if (!data.length && !loading) {
    return (
      <Paper sx={paperStyle}>
        <Box sx={flexStyle}>
          <Typography variant="h6" sx={typeStyle}>{label}</Typography>
        </Box>
        <Box sx={boxStyle}>
          <Typography variant="body1" color="text.secondary">
            No data available
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={paperStyle}>
      <Box sx={flexStyle}>
        <Typography variant="h6" sx={typeStyle}>{label}</Typography>
      </Box>
      <Box sx={{ ...boxStyle, height: 360 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}`, n]} />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  );
});

PieChart.propTypes = {
  label: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
};

PieChart.defaultProps = {
  data: [],
  loading: false,
};
