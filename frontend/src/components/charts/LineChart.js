// ../charts/LineChart.js
import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Paper, Box, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// Styles
import { paperStyle, flexStyle, typeStyle, boxStyle } from '../theme/themes.js';

const clampPct = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(100, n));
};

const formatDate = (d) => {
  // expects ISO yyyy-mm-dd; keep it simple & fast
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return String(d);
  }
};

export const LineChart = memo(function LineChart({ label, data, loading }) {
  const theme = useTheme();

  const safeData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    // minimal sanitation + normalization
    return data
      .map((row) => ({
        date: row?.date ?? row?.name ?? '',
        health: clampPct(row?.health),
        usage: clampPct(row?.usage),
        healthKPI: clampPct(row?.healthKPI),
      }))
      .filter((r) => r.date && (r.health !== null || r.usage !== null || r.healthKPI !== null));
  }, [data]);

  if (!safeData.length && !loading) {
    return (
      <Paper sx={paperStyle}>
        <Box sx={flexStyle}>
          <Typography variant="h6" sx={typeStyle}>{label}</Typography>
        </Box>
        <Box sx={boxStyle}>
          <Typography variant="body1" color="text.secondary">No data available</Typography>
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
            <ComposedChart data={safeData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                minTickGap={24}
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                label={{ value: 'Percent', angle: -90, position: 'insideLeft', dy: 10, fill: theme.palette.text.secondary }}
              />
              <Tooltip
                formatter={(value, name) => [`${value}%`, name]}
                labelFormatter={(v) => `Date: ${formatDate(v)}`}
              />
              <Legend />
              {/* Health (solid) */}
              <Line
                type="monotone"
                dataKey="health"
                name="Health"
                stroke={theme.palette.success.main}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
              {/* Usage (solid) */}
              <Line
                type="monotone"
                dataKey="usage"
                name="Usage"
                stroke={theme.palette.info.main}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
              {/* Health KPI (dashed) */}
              <Line
                type="monotone"
                dataKey="healthKPI"
                name="Health KPI"
                stroke={theme.palette.warning.main}
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  );
});

LineChart.propTypes = {
  label: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string,
    health: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    usage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    healthKPI: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  })),
  loading: PropTypes.bool,
};

LineChart.defaultProps = {
  data: [],
  loading: false,
};
