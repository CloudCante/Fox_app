// React Core
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
// Material UI Components
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
// Third Party Libraries
import 'react-datepicker/dist/react-datepicker.css';
// Custom Charts
import { TestStationChart } from '../charts/TestStationChart';
import { FixtureFailParetoChart } from '../charts/FixtureFailParetoChart';
//import { ParetoChart } from '../charts/ParetoChart';
// Page Components
import { Header } from '../pagecomp/Header.jsx';
import { DateRange } from '../pagecomp/DateRange.jsx';
// Custom Hooks
import { useDashboardData } from '../hooks/dashboard/useDashboardData.js';
// Utilities and Helpers
import { normalizeDate, getInitialStartDate } from '../../utils/dateUtils.js';
import { dataCache } from '../../utils/cacheUtils';
import { gridStyle } from '../theme/themes.js';

const ReadOnlyInput = React.forwardRef((props, ref) => (
  <input {...props} ref={ref} readOnly />
));
const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}
console.log('API_BASE:', API_BASE);

const refreshInterval = 300000; // 5 minutes

export const Dashboard = () => {
  const [startDate, setStartDate] = useState(getInitialStartDate());
  const [endDate, setEndDate] = useState(normalizeDate.end(new Date()));
  const handleStartDateChange = useCallback((date) => {
    setStartDate(normalizeDate.start(date));
  }, []);
  const handleEndDateChange = useCallback((date) => {
    setEndDate(normalizeDate.end(date));
  }, []);

  const { state, refreshData } = useDashboardData(API_BASE, startDate, endDate);
  const { testStationData, testStationDataSXM4, topFixturesData, loading } = state;

  // Setup refresh interval
  useEffect(() => {
    refreshData();
    
    const interval = setInterval(() => {
      dataCache.clear();
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshData]);

  // Memoize child components
  const memoizedTestStationSXM5 = useMemo(() => (
    <TestStationChart 
      label="SXM5 Test Station Performance"
      data={testStationData}
      loading={loading}
    />
  ), [testStationData, loading]);
  const memoizedTestStationSXM4 = useMemo(() => (
    <TestStationChart 
      label="SXM4 Test Station Performance"
      data={testStationDataSXM4}
      loading={loading}
    />
  ), [testStationDataSXM4, loading]);
  const memoizedFixtureFail = useMemo(() => (
    <FixtureFailParetoChart 
      label="Fixture Performance"
      data={topFixturesData}
      loading={loading}
    />
  ), [topFixturesData, loading]);

  return (
    <Box p={1}>
      <Header title="Dashboard" />
      <DateRange
        startDate={startDate}
        setStartDate={handleStartDateChange}
        normalizeStart={normalizeDate.start}
        endDate={endDate}
        setEndDate={handleEndDateChange}
        normalizeEnd={normalizeDate.end}
      />
      <Box sx={gridStyle}>
        {memoizedTestStationSXM5}
        {memoizedTestStationSXM4}
        {memoizedFixtureFail}
      </Box>
    </Box>
  );
};