import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Alert
} from '@mui/material';
import { DateRange } from '../pagecomp/DateRange';
import PChart from '../charts/PChart';

const PerformancePage = () => {
  // Date handling - Default to 14 days back (15 days total including today)
  const normalizeStart = (date) => new Date(new Date(date).setHours(0, 0, 0, 0));
  const normalizeEnd = (date) => new Date(new Date(date).setHours(23, 59, 59, 999));
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 14); // 14 days back for 15 total days
    return normalizeStart(date);
  });
  const [endDate, setEndDate] = useState(normalizeEnd(new Date()));

  // Filter states (restored selectedPartNumber)
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedWorkstation, setSelectedWorkstation] = useState('');
  const [selectedServiceFlow, setSelectedServiceFlow] = useState('');
  const [selectedPartNumber, setSelectedPartNumber] = useState('');

  // Available options from API (restored availablePartNumbers)
  const [availableModels, setAvailableModels] = useState([]);
  const [availableWorkstations, setAvailableWorkstations] = useState([]);
  const [availableServiceFlows, setAvailableServiceFlows] = useState([]);
  const [availablePartNumbers, setAvailablePartNumbers] = useState([]);

  // Loading and data states
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [pChartData, setPChartData] = useState([]);
  const [error, setError] = useState('');

  const API_BASE = process.env.REACT_APP_API_BASE;

  // Validate date range for P-Chart requirements (updated for 4-day work week)
  const validateDateRange = () => {
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    return daysDiff >= 9; // Minimum 10 days total for 8 workdays (4-day work week * 2 weeks)
  };

  // Enhanced frontend consolidation function
  const consolidateDataByDate = (rawData) => {
    const consolidatedByDate = rawData.reduce((acc, point) => {
      const dateKey = point.date;
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: point.date,
          fails: 0,
          passes: 0,
          total: 0
        };
      }
      
      acc[dateKey].fails += point.fail_count;
      acc[dateKey].passes += point.pass_count;
      acc[dateKey].total += point.total_count;
      
      return acc;
    }, {});

    // Convert to array and sort by date
    let dailyData = Object.values(consolidatedByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Handle low-volume days (< 31 total parts) - merge into previous day
    const processedData = [];
    for (let i = 0; i < dailyData.length; i++) {
      const currentDay = dailyData[i];
      
      if (currentDay.total < 31 && processedData.length > 0) {
        // Merge into previous day
        const previousDay = processedData[processedData.length - 1];
        previousDay.fails += currentDay.fails;
        previousDay.passes += currentDay.passes;
        previousDay.total += currentDay.total;
        
        console.log(`Merged low-volume day ${currentDay.date} (${currentDay.total} parts) into ${previousDay.date}`);
      } else {
        // Add as new day
        processedData.push({
          date: currentDay.date,
          fails: currentDay.fails,
          passes: currentDay.passes,
          total: currentDay.total
        });
      }
    }

    return processedData;
  };

  // Fetch available filter options with cascading logic
  const fetchFilters = async (model = '', workstation = '') => {
    setFiltersLoading(true);
    try {
      const params = new URLSearchParams();
      if (model) params.append('model', model);
      if (workstation) params.append('workstation', workstation);

      const response = await fetch(`${API_BASE}/api/pchart/filters?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Filter API error: ${response.status}`);
      }

      const filters = await response.json();
      
      // Always update models
      setAvailableModels(filters.models || []);
      
      // Update workstations if model is selected
      if (model && filters.workstations) {
        setAvailableWorkstations(filters.workstations);
      } else {
        setAvailableWorkstations([]);
        setSelectedWorkstation('');
      }
      
      // Update service flows and part numbers if both model and workstation are selected
      if (model && workstation) {
        setAvailableServiceFlows(filters.serviceFlows || []);
        setAvailablePartNumbers(filters.partNumbers || []);
      } else {
        setAvailableServiceFlows([]);
        setAvailablePartNumbers([]);
        setSelectedServiceFlow('');
        setSelectedPartNumber('');
      }

    } catch (error) {
      console.error('Error fetching filters:', error);
      setError('Failed to load filter options');
    } finally {
      setFiltersLoading(false);
    }
  };

  // Fetch P-Chart data
  const fetchPChartData = async () => {
    if (!selectedModel || !selectedWorkstation) {
      setPChartData([]);
      return;
    }

    if (!validateDateRange()) {
      setError('P-Chart requires minimum 15 days of data. Please select a larger date range.');
      setPChartData([]);
      return;
    }

    setDataLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      params.append('startDate', startDate.toISOString().split('T')[0]);
      params.append('endDate', endDate.toISOString().split('T')[0]);
      params.append('model', selectedModel);
      params.append('workstation', selectedWorkstation);
      
      if (selectedServiceFlow) {
        params.append('serviceFlow', selectedServiceFlow);
      }
      if (selectedPartNumber) {
        params.append('pn', selectedPartNumber);
      }

      const response = await fetch(`${API_BASE}/api/pchart/data?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const rawData = await response.json();
      
      // Frontend consolidation: Group multiple part numbers per day (unless specific part number selected)
      let processedData;
      if (selectedPartNumber) {
        // If specific part number selected, use raw data
        processedData = rawData.map(point => ({
          date: point.date,
          fails: point.fail_count,
          passes: point.pass_count
        }));
      } else {
        // If no specific part number, consolidate all part numbers per day
        processedData = consolidateDataByDate(rawData);
      }

      // Validate we have enough data points after consolidation (updated for 4-day work week)
      if (processedData.length < 8) {
        setError(`P-Chart requires minimum 8 data points for 4-day work week. Found ${processedData.length} points after consolidation.`);
        setPChartData([]);
        return;
      }

      setPChartData(processedData);
      
    } catch (error) {
      console.error('Error fetching P-Chart data:', error);
      setError(error.message || 'Failed to fetch P-Chart data');
      setPChartData([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Handle model selection change
  const handleModelChange = (event) => {
    const newModel = event.target.value;
    setSelectedModel(newModel);
    setSelectedWorkstation('');
    setSelectedServiceFlow('');
    setSelectedPartNumber('');
    
    if (newModel) {
      fetchFilters(newModel);
    } else {
      setAvailableWorkstations([]);
      setAvailableServiceFlows([]);
      setAvailablePartNumbers([]);
    }
  };

  // Handle workstation selection change
  const handleWorkstationChange = (event) => {
    const newWorkstation = event.target.value;
    setSelectedWorkstation(newWorkstation);
    setSelectedServiceFlow('');
    setSelectedPartNumber('');
    
    if (newWorkstation && selectedModel) {
      fetchFilters(selectedModel, newWorkstation);
    } else {
      setAvailableServiceFlows([]);
      setAvailablePartNumbers([]);
    }
  };

  // Initial load - fetch models
  useEffect(() => {
    fetchFilters();
  }, []);

  // Fetch data when filters or dates change (restored selectedPartNumber dependency)
  useEffect(() => {
    if (selectedModel && selectedWorkstation) {
      fetchPChartData();
    }
  }, [startDate, endDate, selectedModel, selectedWorkstation, selectedServiceFlow, selectedPartNumber]);

  // Generate chart title and subtitle
  const getChartTitle = () => {
    let title = 'P-Chart Analysis';
    if (selectedWorkstation && selectedModel) {
      title = `${selectedWorkstation} Station - ${selectedModel}`;
    }
    return title;
  };

  const getChartSubtitle = () => {
    let subtitle = `Analysis Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    if (selectedServiceFlow) {
      subtitle += ` | Service Flow: ${selectedServiceFlow}`;
    }
    if (selectedPartNumber) {
      subtitle += ` | Part Number: ${selectedPartNumber}`;
    } else {
      subtitle += ` | All Part Numbers Combined`;
    }
    return subtitle;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Quality Control Charts
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Statistical Process Control (SPC) Analysis using P-Charts - Minimum 8 workdays required (4-day work week)
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Date Range Controls */}
      <Box sx={{ mb: 3 }}>
        <DateRange
          startDate={startDate}
          setStartDate={setStartDate}
          normalizeStart={normalizeStart}
          endDate={endDate}
          setEndDate={setEndDate}
          normalizeEnd={normalizeEnd}
        />
        
        {!validateDateRange() && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            P-Chart requires minimum 10 days for 8 workdays (4-day work week). Current range: {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1} days
          </Alert>
        )}
      </Box>

      {/* Filter Controls - Restored Part Number Filter */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Model *</InputLabel>
            <Select
              value={selectedModel}
              label="Model *"
              onChange={handleModelChange}
              disabled={filtersLoading}
            >
              <MenuItem value="">
                <em>Select Model</em>
              </MenuItem>
              {availableModels.map((model) => (
                <MenuItem key={model} value={model}>{model}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Workstation *</InputLabel>
            <Select
              value={selectedWorkstation}
              label="Workstation *"
              onChange={handleWorkstationChange}
              disabled={filtersLoading || !selectedModel || availableWorkstations.length === 0}
            >
              <MenuItem value="">
                <em>Select Workstation</em>
              </MenuItem>
              {availableWorkstations.map((workstation) => (
                <MenuItem key={workstation} value={workstation}>{workstation}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Service Flow</InputLabel>
            <Select
              value={selectedServiceFlow}
              label="Service Flow"
              onChange={(e) => setSelectedServiceFlow(e.target.value)}
              disabled={filtersLoading || !selectedWorkstation || availableServiceFlows.length === 0}
            >
              <MenuItem value="">
                <em>All Service Flows</em>
              </MenuItem>
              {availableServiceFlows.map((flow) => (
                <MenuItem key={flow} value={flow}>{flow}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Part Number</InputLabel>
            <Select
              value={selectedPartNumber}
              label="Part Number"
              onChange={(e) => setSelectedPartNumber(e.target.value)}
              disabled={filtersLoading || !selectedWorkstation || availablePartNumbers.length === 0}
            >
              <MenuItem value="">
                <em>All Part Numbers</em>
              </MenuItem>
              {availablePartNumbers.map((pn) => (
                <MenuItem key={pn} value={pn}>{pn}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Chart */}
      <Card>
        <CardHeader 
          title={getChartTitle()}
          subheader="Statistical Process Control Analysis"
        />
        <CardContent>
          {!selectedModel || !selectedWorkstation ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select Model and Workstation to View P-Chart
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a model first, then select from available workstations for that model
              </Typography>
            </Box>
          ) : dataLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <CircularProgress />
            </Box>
          ) : (
            <PChart
              data={pChartData}
              title={getChartTitle()}
              subtitle={getChartSubtitle()}
              station={selectedWorkstation}
              model={selectedModel}
            />
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default PerformancePage;