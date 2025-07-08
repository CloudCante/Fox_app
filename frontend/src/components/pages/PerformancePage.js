import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Container,
} from '@mui/material';
import { PChart } from '../charts/PChart';

const PerformancePage = () => {
  const [dailyPChartData, setDailyPChartData] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [availableStations, setAvailableStations] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedModel, setSelectedModel] = useState('Tesla SXM4');
  const [selectedStation, setSelectedStation] = useState('BAT');
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_BASE;
  if (!API_BASE) {
    console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
  }

  // Available models and priority stations
  const availableModels = ['Tesla SXM4', 'Tesla SXM5'];
  const priorityStations = ['BAT', 'FCT', 'FI', 'VI1', 'VI2', 'FQC'];

  // Fetch available stations from database (optional enhancement)
  const fetchAvailableStations = async () => {
    try {
      // This could be enhanced to get stations dynamically from the database
      // For now, using the priority stations list
      setAvailableStations(priorityStations);
    } catch (error) {
      console.error('Error fetching stations:', error);
      setAvailableStations(priorityStations); // Fallback to default list
    }
  };

  // Fetch Station P-Chart data
  const fetchPChartData = async () => {
    setLoading(true);
    
    try {
      // First, get available weeks from weekly metrics
      const weeklyResponse = await fetch(`${API_BASE}/api/workstation/weekly-yield-metrics`);
      if (!weeklyResponse.ok) {
        throw new Error(`Weekly metrics API error: ${weeklyResponse.status}`);
      }
      
      const weeklyData = await weeklyResponse.json();
      const weeks = weeklyData.map(week => week._id).sort().reverse(); // Most recent first
      setAvailableWeeks(weeks);
      
      // Set default selected week to most recent if not already set
      const currentSelectedWeek = selectedWeek || (weeks.length > 0 ? weeks[0] : '');
      if (!selectedWeek && weeks.length > 0) {
        setSelectedWeek(currentSelectedWeek);
      }
      
      if (!currentSelectedWeek || !selectedModel || !selectedStation) {
        setDailyPChartData([]);
        setWeeklySummary([]);
        return;
      }
      
      // Fetch station-specific P-chart data
      console.log(`Fetching P-Chart data for ${selectedModel} ${selectedStation} in ${currentSelectedWeek}`);
      
      // Call the real API endpoint
      const pchartResponse = await fetch(`${API_BASE}/api/workstation/pchart/${currentSelectedWeek}/${selectedModel}/${selectedStation}`);
      
      if (!pchartResponse.ok) {
        throw new Error(`P-Chart API error: ${pchartResponse.status}`);
      }
      
      const pchartData = await pchartResponse.json();
      console.log(`P-Chart API Response:`, pchartData);
      
      // Transform to chart format
      const chartData = pchartData.dailyPoints.map(point => ({
        date: point.date,
        proportion: point.defectRate / 100, // Convert percentage to proportion
        sampleSize: point.sampleSize,
        successCount: point.sampleSize - point.defects, // Non-defective parts
        defects: point.defects,
        defectRate: point.defectRate,
        ucl: point.upperControlLimit / 100,
        lcl: point.lowerControlLimit / 100,
        centerLine: pchartData.centerLine / 100,
        inControl: !point.outOfControl
      }));

      setDailyPChartData(chartData);
      
      // Set summary data
      setWeeklySummary([{
        _id: currentSelectedWeek,
        stationSummary: {
          totalParts: pchartData.weeklyTotals.totalParts,
          defectRate: pchartData.weeklyTotals.defectRate,
          model: selectedModel,
          station: selectedStation
        }
      }]);

      console.log(`Loaded ${chartData.length} daily data points for ${selectedStation} station P-Chart`);
      
    } catch (error) {
      console.error('Error fetching P-Chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics for station defect rates
  const summaryStats = useMemo(() => {
    if (!dailyPChartData || dailyPChartData.length === 0) return null;
    
    const defectRates = dailyPChartData.map(d => d.defectRate);
    const totalParts = dailyPChartData.reduce((sum, d) => sum + d.sampleSize, 0);
    const totalDefects = dailyPChartData.reduce((sum, d) => sum + d.defects, 0);
    const outOfControlPoints = dailyPChartData.filter(d => !d.inControl).length;
    
    return {
      meanDefectRate: defectRates.reduce((sum, p) => sum + p, 0) / defectRates.length,
      overallDefectRate: (totalDefects / totalParts) * 100,
      minDefectRate: Math.min(...defectRates),
      maxDefectRate: Math.max(...defectRates),
      totalParts: totalParts,
      totalDefects: totalDefects,
      dataPoints: dailyPChartData.length,
      outOfControlPoints: outOfControlPoints,
      processInControl: outOfControlPoints === 0
    };
  }, [dailyPChartData]);

  // Load data on component mount and when selections change
  useEffect(() => {
    fetchPChartData();
  }, [selectedWeek, selectedModel, selectedStation]);

  // Initialize available stations on component mount
  useEffect(() => {
    fetchAvailableStations();
  }, []);

  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value);
  };

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const handleStationChange = (event) => {
    setSelectedStation(event.target.value);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Performance Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Real-time manufacturing performance metrics and statistical process control.
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Station P-Chart Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Statistical process control for station-specific defect rates. P-charts detect when a station's daily defect rate goes out of control.
        </Typography>
        
        {/* Selection Controls */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Week</InputLabel>
              <Select
                value={selectedWeek}
                label="Week"
                onChange={handleWeekChange}
                disabled={loading}
              >
                {availableWeeks.map((week) => (
                  <MenuItem key={week} value={week}>
                    {week}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={selectedModel}
                label="Model"
                onChange={handleModelChange}
                disabled={loading}
              >
                {availableModels.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Station</InputLabel>
              <Select
                value={selectedStation}
                label="Station"
                onChange={handleStationChange}
                disabled={loading}
              >
                {availableStations.map((station) => (
                  <MenuItem key={station} value={station}>
                    {station}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary" sx={{ ml: 2 }}>
            Loading daily data for selected week...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Main P-Chart */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardHeader 
                title={`Daily Completion FPY P-Chart - ${selectedWeek || 'No Week Selected'}`}
                subheader="Daily completion FPY within selected week with historical control limits"
                titleTypographyProps={{ variant: 'h6' }}
                subheaderTypographyProps={{ variant: 'body2' }}
              />
              <CardContent>
                <Box sx={{ height: 450 }}>
                  <PChart 
                    data={dailyPChartData}
                    title={`${selectedStation} Station Defect Rate P-Chart - ${selectedModel} (${selectedWeek})`}
                    subtitle={`Daily defect rates with control limits. Center line: ${dailyPChartData.length > 0 ? (dailyPChartData[0].centerLine * 100).toFixed(2) : 0}%`}
                    yAxisLabel="Defect Rate (%)"
                    chartType="defectRate"
                    station={selectedStation}
                    model={selectedModel}
                    week={selectedWeek}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Summary Statistics */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardHeader 
                title={`P-Chart Summary - ${selectedWeek || 'No Week Selected'}`}
                titleTypographyProps={{ variant: 'h6' }}
              />
              <CardContent>
                {summaryStats && (
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="error.main">
                          {summaryStats.overallDefectRate ? summaryStats.overallDefectRate.toFixed(1) : '--'}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Overall Defect Rate
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          {summaryStats.totalDefects ? summaryStats.totalDefects.toLocaleString() : '--'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Defects
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">
                          {summaryStats.totalParts ? summaryStats.totalParts.toLocaleString() : '--'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Parts Tested
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: summaryStats?.processInControl ? 'success.light' : 'error.light' }}>
                        <Typography variant="h4" color={summaryStats?.processInControl ? 'success.dark' : 'error.dark'}>
                          {summaryStats?.processInControl ? '✓' : '⚠'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Process {summaryStats?.processInControl ? 'In Control' : 'Out of Control'}
                        </Typography>
                        {summaryStats?.outOfControlPoints > 0 && (
                          <Typography variant="caption" color="error.main">
                            {summaryStats.outOfControlPoints} out-of-control points
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Selected Week Summary */}
          {weeklySummary.length > 0 && (
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardHeader 
                  title={`Week ${selectedWeek} Summary`}
                  subheader="Complete weekly metrics for selected week"
                  titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                  {weeklySummary.map((week) => (
                    <Grid container spacing={2} key={week._id}>
                      <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h5" color="primary">
                            {week.stationSummary?.defectRate?.toFixed(1) || '--'}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Defect Rate
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h5" color="secondary">
                            {week.stationSummary?.totalParts?.toLocaleString() || '--'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Parts
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Success Note */}
      <Box sx={{ mt: 4, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
        <Typography variant="body2" color="success.contrastText">
          <strong>✅ Live P-Chart:</strong> Daily data points within selected week with control limits from historical data. 
          Week selector provides focused analysis while maintaining statistical process control.
          {!loading && selectedWeek && ` Currently showing ${dailyPChartData.length} days from ${selectedWeek}.`}
        </Typography>
      </Box>
    </Container>
  );
};

export default PerformancePage; 