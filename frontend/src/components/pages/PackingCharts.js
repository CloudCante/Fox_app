// src/pages/PackingCharts.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, FormGroup, FormControlLabel, Checkbox, Typography, CircularProgress } from '@mui/material';
import PackingOutputBarChart from '../charts/PackingOutputBarChart';
import { ALL_MODELS } from '../../data/dataTables';
import { useWeekNavigation } from '../hooks/packingCharts/useWeekNavigation';
import { usePackingData } from '../hooks/packingCharts/usePackingData';

const API_BASE = process.env.REACT_APP_API_BASE;

const weeksToShow = 12; // Number of weeks to show in the weekly chart
const defaultModels = ['SXM4', 'SXM5']; // Default models to show in the charts

const PackingCharts = () => {
  const navigate = useNavigate();
  const { 
    currentISOWeekStart, 
    handlePrevWeek, 
    handleNextWeek, 
    weekRange 
  } = useWeekNavigation();
  
  const [selectedModels, setSelectedModels] = useState(defaultModels);
  const [showTrendLine, setShowTrendLine] = useState(false);
  const [showAvgLine, setShowAvgLine] = useState(true);

  const {
      dailyData,
      loadingDaily,
      errorDaily,
      weeklyData,
      loadingWeekly,
      errorWeekly
    } = usePackingData(API_BASE, selectedModels, currentISOWeekStart, weeksToShow);

  // Handle model checkbox change
  const handleModelChange = (model) => {
    setSelectedModels((prev) =>
      prev.includes(model)
        ? prev.filter((m) => m !== model)
        : [...prev, model]
    );
  };
  
  // Packing Charts
  return (
    <div style={{ padding: 32 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/packing')}
        sx={{ mb: 2 }}
      >
        Back to Packing
      </Button>

      <Typography variant="h4" gutterBottom>
        Packing Charts
      </Typography>

      {/* Model Filter */}
      <Box display="flex" alignItems="center" gap={4} mb={3}>
        <FormGroup row>
          {ALL_MODELS.map(model => (
            <FormControlLabel
              key={model.value}
              control={
                <Checkbox
                  checked={selectedModels.includes(model.value)}
                  onChange={() => handleModelChange(model.value)}
                />
              }
              label={model.label}
            />
          ))}
        </FormGroup>
      </Box>

      {/* ISO Week Navigation */}
      <Box display="flex" alignItems="center" gap={2} mb={1}>
        <Button variant="outlined" size="small" onClick={handlePrevWeek}>
          &lt; Prev Week
        </Button>
        <Typography variant="subtitle1">
          {weekRange.label}
        </Typography>
        <Button variant="outlined" size="small" onClick={handleNextWeek}>
          Next Week &gt;
        </Button>
      </Box>

      {/* Daily Chart */}
      {loadingDaily ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : errorDaily ? (
        <Typography color="error">{errorDaily}</Typography>
      ) : (
        <PackingOutputBarChart
          title="Daily Packing Output"
          data={dailyData}
        />
      )}

      {/* Weekly Chart Toggles */}
      <Box display="flex" alignItems="center" gap={2} mb={1}>
        <FormControlLabel
          control={
            <Checkbox
              checked={showAvgLine}
              onChange={e => setShowAvgLine(e.target.checked)}
            />
          }
          label="Show Average Line"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showTrendLine}
              onChange={e => setShowTrendLine(e.target.checked)}
            />
          }
          label="Show Trend Line"
        />
      </Box>

      {/* Weekly Chart */}
      {loadingWeekly ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : errorWeekly ? (
        <Typography color="error">{errorWeekly}</Typography>
      ) : (
        <PackingOutputBarChart
          title="Weekly Packing Output"
          data={weeklyData}
          color="#4caf50"
          showTrendLine={showTrendLine}
          showAvgLine={showAvgLine}
        />
      )}

      {/* Debug Chart */}
      <PackingOutputBarChart
        title="Fake Weekly Chart"
        data={[
          { label: 'A', value: 100 },
          { label: 'B', value: 200 },
          { label: 'C', value: 300 },
          { label: 'D', value: 400 },
          { label: 'E', value: 500 },
          { label: 'F', value: 600 },
          { label: 'G', value: 700 },
          { label: 'H', value: 800 },
          { label: 'I', value: 900 },
          { label: 'J', value: 1000 },
          { label: 'K', value: 1100 },
          { label: 'L', value: 1200 },
        ]}
        color="#1976d2"
        showTrendLine
        showAvgLine={false}
      />
    </div>
  );
};

export default PackingCharts;
