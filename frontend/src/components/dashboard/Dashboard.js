import React, { useEffect, useState, useRef } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TestStationChart } from '../charts/TestStationChart';
import { ParetoChart } from '../charts/ParetoChart';
import { toUTCDateString } from '../../utils/dateUtils';
import { dataCache } from '../../utils/cacheUtils';

const ReadOnlyInput = React.forwardRef((props, ref) => (
  <input {...props} ref={ref} readOnly />
));
const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}
console.log('API_BASE:', API_BASE);

export const Dashboard = () => {
  const [testStationData, setTestStationData] = useState([]);
  const [testStationDataSXM4, setTestStationDataSXM4] = useState([]);
  const [topFixturesData, setTopFixturesData] = useState([]);
  const [failStationsData, setFailStationsData] = useState([]);
  const [defectCodesData, setDefectCodesData] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    // Default to last 7 days
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date()); // Default to today
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Set loading state at the beginning of data fetch
    setLoading(true);

    // Convert fetch functions to return their promises so we can use Promise.all
    const fetchSXM5 = () => {
      const params = new URLSearchParams();
      params.append('model', 'Tesla SXM5');
      if (startDate) {
        const utcStartDate = new Date(startDate);
        utcStartDate.setUTCHours(0, 0, 0, 0);
        params.append('startDate', utcStartDate.toISOString());
      }
      if (endDate) {
        const utcEndDate = new Date(endDate);
        utcEndDate.setUTCHours(23, 59, 59, 999);
        params.append('endDate', utcEndDate.toISOString());
      }

      // Generate cache key based on parameters
      const cacheKey = `sxm5_${params.toString()}`;

      // Check cache first
      const cachedData = dataCache.get(cacheKey);
      if (cachedData) {
        setTestStationData(cachedData);
        return Promise.resolve(cachedData);
      }

      // If not in cache, fetch from API
      return fetch(`${API_BASE}/api/functional-testing/station-performance?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          setTestStationData(data);
          // Store in cache
          dataCache.set(cacheKey, data);
          return data;
        })
        .catch(() => {
          setTestStationData([]);
          return [];
        });
    };

    const fetchSXM4 = () => {
      const params = new URLSearchParams();
      params.append('model', 'Tesla SXM4');
      if (startDate) {
        const utcStartDate = new Date(startDate);
        utcStartDate.setUTCHours(0, 0, 0, 0);
        params.append('startDate', utcStartDate.toISOString());
      }
      if (endDate) {
        const utcEndDate = new Date(endDate);
        utcEndDate.setUTCHours(23, 59, 59, 999);
        params.append('endDate', utcEndDate.toISOString());
      }

      // Generate cache key based on parameters
      const cacheKey = `sxm4_${params.toString()}`;

      // Check cache first
      const cachedData = dataCache.get(cacheKey);
      if (cachedData) {
        setTestStationDataSXM4(cachedData);
        return Promise.resolve(cachedData);
      }

      return fetch(`${API_BASE}/api/functional-testing/station-performance?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          setTestStationDataSXM4(data);
          // Store in cache
          dataCache.set(cacheKey, data);
          return data;
        })
        .catch(() => {
          setTestStationDataSXM4([]);
          return [];
        });
    };

    const fetchFixtures = () => {
      const params = new URLSearchParams();
      if (startDate) {
        const utcStartDate = new Date(startDate);
        utcStartDate.setUTCHours(0, 0, 0, 0);
        params.append('startDate', utcStartDate.toISOString());
      }
      if (endDate) {
        const utcEndDate = new Date(endDate);
        utcEndDate.setUTCHours(23, 59, 59, 999);
        params.append('endDate', utcEndDate.toISOString());
      }

      // Generate cache key based on parameters
      const cacheKey = `fixtures_${params.toString()}`;

      // Check cache first
      const cachedData = dataCache.get(cacheKey);
      if (cachedData) {
        setTopFixturesData(cachedData);
        return Promise.resolve(cachedData);
      }

      return fetch(`${API_BASE}/api/test-records/top-fixtures?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          const mapped = data.map(item => ({
            station: item._id || item.fixture,
            pass: item.total - item.fail,
            fail: item.fail,
            failurerate: item.failurerate
          }));
          setTopFixturesData(mapped);
          // Store in cache
          dataCache.set(cacheKey, mapped);
          return mapped;
        })
        .catch(() => {
          setTopFixturesData([]);
          return [];
        });
    };

    const fetchFailStations = () => {
      const params = new URLSearchParams();
      if (startDate) {
        const utcStartDate = new Date(startDate);
        utcStartDate.setUTCHours(0, 0, 0, 0);
        params.append('startDate', utcStartDate.toISOString());
      }
      if (endDate) {
        const utcEndDate = new Date(endDate);
        utcEndDate.setUTCHours(23, 59, 59, 999);
        params.append('endDate', utcEndDate.toISOString());
      }

      // Generate cache key based on parameters
      const cacheKey = `failStations_${params.toString()}`;

      // Check cache first
      const cachedData = dataCache.get(cacheKey);
      if (cachedData) {
        setFailStationsData(cachedData);
        return Promise.resolve(cachedData);
      }

      return fetch(`${API_BASE}/api/defect-records/fail-stations?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          setFailStationsData(data);
          // Store in cache
          dataCache.set(cacheKey, data);
          return data;
        })
        .catch(() => {
          setFailStationsData([]);
          return [];
        });
    };

    const fetchDefectCodes = () => {
      const params = new URLSearchParams();
      if (startDate) {
        const utcStartDate = new Date(startDate);
        utcStartDate.setUTCHours(0, 0, 0, 0);
        params.append('startDate', utcStartDate.toISOString());
      }
      if (endDate) {
        const utcEndDate = new Date(endDate);
        utcEndDate.setUTCHours(23, 59, 59, 999);
        params.append('endDate', utcEndDate.toISOString());
      }

      // Generate cache key based on parameters
      const cacheKey = `defectCodes_${params.toString()}`;

      // Check cache first
      const cachedData = dataCache.get(cacheKey);
      if (cachedData) {
        setDefectCodesData(cachedData);
        return Promise.resolve(cachedData);
      }

      return fetch(`${API_BASE}/api/defect-records/defect-codes?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          setDefectCodesData(data);
          // Store in cache
          dataCache.set(cacheKey, data);
          return data;
        })
        .catch(() => {
          setDefectCodesData([]);
          return [];
        });
    };

    // Initial data load - fetch all data in parallel
    Promise.all([fetchSXM4(), fetchSXM5(), fetchFixtures(), fetchFailStations(), fetchDefectCodes()])
      .then(() => setLoading(false)) // Turn off loading state when done
      .catch(error => {
        console.error("Error fetching dashboard data:", error);
        setLoading(false); // Turn off loading even on error
      });

    // Set up refresh interval
    const interval = setInterval(() => {
      // Don't show loading indicator on background refresh
      // Clear cache and re-fetch on interval
      dataCache.clear();

      // Refresh all data in parallel
      Promise.all([fetchSXM4(), fetchSXM5(), fetchFixtures(), fetchFailStations(), fetchDefectCodes()])
        .catch(error => console.error("Error refreshing dashboard data:", error));
    }, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [startDate, endDate]);

  return (
    <Box p={1}>
    <Typography>this is a test</Typography>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>

        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
          dateFormat="yyyy-MM-dd"
          customInput={<ReadOnlyInput />}
        />
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="End Date"
          dateFormat="yyyy-MM-dd"
          customInput={<ReadOnlyInput />}
        />
      </div>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { md: '1fr 1fr' },
        gap: 3,
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            position: 'relative',
            width: '100%'
          }}>
            <Typography
              variant="h6"
              sx={{
                width: '100%',
                textAlign: 'center',
                fontSize: {
                  xs: '1rem',
                  sm: '1.1rem',
                  md: '1.25rem',
                },
                mr: {
                  xs: '0',
                  sm: '0',
                  md: '0',
                }
              }}
            >
              SXM5 Test Station Performance
            </Typography>
          </Box>
          <Box sx={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <TestStationChart data={testStationData} />
            )}
          </Box>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            position: 'relative',
            width: '100%'
          }}>
            <Typography
              variant="h6"
              sx={{
                width: '100%',
                textAlign: 'center',
                fontSize: {
                  xs: '1rem',
                  sm: '1.1rem',
                  md: '1.25rem',
                },
                mr: {
                  xs: '0',
                  sm: '0',
                  md: '0',
                }
              }}
            >
              SXM4 Test Station Performance
            </Typography>
          </Box>
          <Box sx={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <TestStationChart data={testStationDataSXM4} />
            )}
          </Box>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            position: 'relative',
            width: '100%'
          }}>
            <Typography
              variant="h6"
              sx={{
                width: '100%',
                textAlign: 'center',
                fontSize: {
                  xs: '1rem',
                  sm: '1.1rem',
                  md: '1.25rem',
                },
                mr: {
                  xs: '0',
                  sm: '0',
                  md: '0',
                }
              }}
            >
              Most Common Fail Stations
            </Typography>
          </Box>
          <Box sx={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <ParetoChart data={topFixturesData} />
            )}
          </Box>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            position: 'relative',
            width: '100%'
          }}>
            <Typography
              variant="h6"
              sx={{
                width: '100%',
                textAlign: 'center',
                fontSize: {
                  xs: '1rem',
                  sm: '1.1rem',
                  md: '1.25rem',
                },
                mr: {
                  xs: '0',
                  sm: '0',
                  md: '0',
                }
              }}
            >
              Defect Fail Stations
            </Typography>
          </Box>
          <Box sx={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <ParetoChart data={failStationsData} lineLabel="Cumulative %" />
            )}
          </Box>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            position: 'relative',
            width: '100%'
          }}>
            <Typography
              variant="h6"
              sx={{
                width: '100%',
                textAlign: 'center',
                fontSize: {
                  xs: '1rem',
                  sm: '1.1rem',
                  md: '1.25rem',
                },
                mr: {
                  xs: '0',
                  sm: '0',
                  md: '0',
                }
              }}
            >
              Most Common Defects
            </Typography>
          </Box>
          <Box sx={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <ParetoChart data={defectCodesData} lineLabel="Cumulative %" />
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}; 