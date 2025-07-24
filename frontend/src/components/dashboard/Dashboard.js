import React, { useEffect, useState, useRef } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { TestStationChart } from '../charts/TestStationChart';
import { ParetoChart } from '../charts/ParetoChart';
import { FixtureFailParetoChart } from '../charts/FixtureFailParetoChart';
import { toUTCDateString } from '../../utils/dateUtils';
import { dataCache } from '../../utils/cacheUtils';
// Page Components
import { Header } from '../pagecomp/Header.jsx';
import { DateRange } from '../pagecomp/DateRange.jsx';

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
  const normalizeStart = (date) => new Date(new Date(date).setHours(0, 0, 0, 0));
  const normalizeEnd = (date) => new Date(new Date(date).setHours(23, 59, 59, 999));
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return normalizeStart(date);
  });
  const [endDate, setEndDate] = useState(normalizeEnd(new Date()));
  const [loading, setLoading] = useState(true); 
  
  const boxStyle = { height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }
  const flexStyle = { display: 'flex', alignItems: 'center', mb: 2, position: 'relative', width: '100%'};
  const typeStyle =  {width: '100%', textAlign: 'center', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem', }, mr: { xs: '0', sm: '0', md: '0', } }
  const gridStyle = { display: 'grid', gridTemplateColumns: { sm: '1fr', md: '1fr 1fr' }, gap: 3, maxWidth: '1600px', margin: '0 auto'}

  useEffect(() => {
    setLoading(true);

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

      const cacheKey = `sxm5_${params.toString()}`;

      const cachedData = dataCache.get(cacheKey);
      if (cachedData) {
        setTestStationData(cachedData);
        return Promise.resolve(cachedData);
      }

      return fetch(`${API_BASE}/api/functional-testing/station-performance?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          const mapped = Array.isArray(data)
            ? data.map(row => ({
                station: row.workstation_name,
                pass: row.pass,
                fail: row.fail,
                failurerate: parseFloat(row.failurerate)
              }))
            : [];
          setTestStationData(mapped);
          dataCache.set(cacheKey, mapped);
          return mapped;
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

      const cacheKey = `sxm4_${params.toString()}`;

      const cachedData = dataCache.get(cacheKey);
      if (cachedData) {
        setTestStationDataSXM4(cachedData);
        return Promise.resolve(cachedData);
      }

      return fetch(`${API_BASE}/api/functional-testing/station-performance?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          const mapped = Array.isArray(data)
            ? data.map(row => ({
                station: row.workstation_name,
                pass: row.pass,
                fail: row.fail,
                failurerate: parseFloat(row.failurerate)
              }))
            : [];
          setTestStationDataSXM4(mapped);
          dataCache.set(cacheKey, mapped);
          return mapped;
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

      const cacheKey = `fixtures_${params.toString()}`;

      const cachedData = dataCache.get(cacheKey);
      if (cachedData) {
        setTopFixturesData(cachedData);
        return Promise.resolve(cachedData);
      }

      return fetch(`${API_BASE}/api/functional-testing/fixture-performance?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          const mapped = Array.isArray(data)
            ? data.map(item => ({
                station: item.fixture_no,
                pass: parseInt(item.pass),
                fail: parseInt(item.fail),
                failurerate: parseFloat(item.failurerate),
                fail_percent_of_total: parseFloat(item.fail_percent_of_total)
              }))
            : [];
          setTopFixturesData(mapped);
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

      const cacheKey = `failStations_${params.toString()}`;

      const cachedData = dataCache.get(cacheKey);
      if (cachedData) {
        setFailStationsData(cachedData);
        return Promise.resolve(cachedData);
      }

      return fetch(`${API_BASE}/api/defect-records/fail-stations?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          setFailStationsData(data);
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

      const cacheKey = `defectCodes_${params.toString()}`;

      const cachedData = dataCache.get(cacheKey);
      if (cachedData) {
        setDefectCodesData(cachedData);
        return Promise.resolve(cachedData);
      }

      return fetch(`${API_BASE}/api/defect-records/defect-codes?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          setDefectCodesData(data);
          dataCache.set(cacheKey, data);
          return data;
        })
        .catch(() => {
          setDefectCodesData([]);
          return [];
        });
    };

    Promise.all([fetchSXM4(), fetchSXM5(), fetchFixtures(), fetchFailStations(), fetchDefectCodes()])
      .then(() => setLoading(false)) 
      .catch(error => {
        console.error("Error fetching dashboard data:", error);
        setLoading(false); 
      });

    const interval = setInterval(() => {
      dataCache.clear();

      Promise.all([fetchSXM4(), fetchSXM5(), fetchFixtures(), fetchFailStations(), fetchDefectCodes()])
        .catch(error => console.error("Error refreshing dashboard data:", error));
    }, 60000);

    return () => clearInterval(interval); 
  }, [startDate, endDate]);

  return (
    <Box p={1}>
      <Header title="Dashboard" />
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
      <Box sx={gridStyle}>
        <Paper sx={{ p: 2 }}>
          <Box sx={flexStyle}>
            <Typography variant="h6" sx={typeStyle} >
              SXM5 Test Station Performance
            </Typography>
          </Box>
          <Box sx={boxStyle}>
            {loading ? (
              <CircularProgress />
            ) : (
              <TestStationChart data={testStationData} />
            )}
          </Box>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Box sx={flexStyle}>
            <Typography variant="h6" sx={typeStyle} >
              SXM4 Test Station Performance
            </Typography>
          </Box>
          <Box sx={boxStyle}>
            {loading ? (
              <CircularProgress />
            ) : (
              <TestStationChart data={testStationDataSXM4} />
            )}
          </Box>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Box sx={flexStyle}>
            <Typography variant="h6" sx={typeStyle} >
              Fixture Performance
            </Typography>
          </Box>
          <Box sx={boxStyle}>
            {loading ? (
              <CircularProgress />
            ) : (
              <FixtureFailParetoChart data={topFixturesData} />
            )}
          </Box>
        </Paper>
        {/* <Paper sx={{ p: 2 }}>
          <Box sx={flexStyle}>
            <Typography variant="h6" sx={typeStyle} >
              Defect Fail Stations
            </Typography>
          </Box>
          <Box sx={boxStyle}>
            {loading ? (
              <CircularProgress />
            ) : (
              <ParetoChart data={failStationsData} lineLabel="Cumulative %" />
            )}
          </Box>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Box sx={flexStyle}>
            <Typography variant="h6" sx={typeStyle} >
              Most Common Defects
            </Typography>
          </Box>
          <Box sx={boxStyle}>
            {loading ? (
              <CircularProgress />
            ) : (
              <ParetoChart data={defectCodesData} lineLabel="Cumulative %" />
            )}
          </Box>
        </Paper> */}
      </Box>
    </Box>
  );
}; 