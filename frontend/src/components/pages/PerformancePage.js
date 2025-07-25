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
  Typography
} from '@mui/material';
import { DateRange } from '../pagecomp/DateRange';
import PChart from '../charts/PChart';

const PerformancePage = () => {
  // Date handling
  const normalizeStart = (date) => new Date(new Date(date).setHours(0, 0, 0, 0));
  const normalizeEnd = (date) => new Date(new Date(date).setHours(23, 59, 59, 999));
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 14); // 14 days back
    return normalizeStart(date);
  });
  const [endDate, setEndDate] = useState(normalizeEnd(new Date()));

  // Other state
  const [selectedModel, setSelectedModel] = useState('Tesla SXM4');
  const [selectedStation, setSelectedStation] = useState('BAT');
  const [loading, setLoading] = useState(true);
  const [pChartData, setPChartData] = useState([]);

  const API_BASE = process.env.REACT_APP_API_BASE;
  const availableModels = ['Tesla SXM4', 'Tesla SXM5'];
  const priorityStations = ['BAT', 'FCT', 'FI', 'VI1', 'VI2', 'FQC'];

  const fetchPChartData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const utcStartDate = new Date(startDate);
      const utcEndDate = new Date(endDate);
      
      params.append('startDate', utcStartDate.toISOString());
      params.append('endDate', utcEndDate.toISOString());
      params.append('model', selectedModel);
      params.append('station', selectedStation);

      const response = await fetch(`${API_BASE}/api/quality/pchart?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform data for PChart component
      const transformedData = data.map(point => ({
        date: point.date,
        fails: point.defects,
        passes: point.total - point.defects
      }));

      setPChartData(transformedData);
    } catch (error) {
      console.error('Error fetching P-Chart data:', error);
      setPChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPChartData();
  }, [startDate, endDate, selectedModel, selectedStation]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Quality Control Charts
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Statistical Process Control (SPC) Analysis using P-Charts
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Controls */}
      <Box sx={{ mb: 3 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <DateRange
            startDate={startDate}
            setStartDate={setStartDate}
            normalizeStart={normalizeStart}
            endDate={endDate}
            setEndDate={setEndDate}
            normalizeEnd={normalizeEnd}
          />
        </div>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={selectedModel}
                label="Model"
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={loading}
              >
                {availableModels.map((model) => (
                  <MenuItem key={model} value={model}>{model}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Station</InputLabel>
              <Select
                value={selectedStation}
                label="Station"
                onChange={(e) => setSelectedStation(e.target.value)}
                disabled={loading}
              >
                {priorityStations.map((station) => (
                  <MenuItem key={station} value={station}>{station}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Chart */}
      <Card>
        <CardHeader 
          title={`${selectedStation} Station P-Chart Analysis`}
          subheader={`Statistical Process Control for ${selectedModel}`}
        />
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <CircularProgress />
            </Box>
          ) : (
            <PChart
              data={pChartData}
              title={`${selectedStation} Quality Control Chart`}
              subtitle={`Analysis Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
              station={selectedStation}
              model={selectedModel}
            />
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default PerformancePage;