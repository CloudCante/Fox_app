import React, { useEffect, useState, useRef } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import 'react-datepicker/dist/react-datepicker.css';
import { TestStationChart } from '../charts/TestStationChart';
//import { ParetoChart } from '../charts/ParetoChart';
import { FixtureFailParetoChart } from '../charts/FixtureFailParetoChart';
import { dataCache } from '../../utils/cacheUtils';
// Page Components
import { Header } from '../pagecomp/Header.jsx';
import { DateRange } from '../pagecomp/DateRange.jsx';
// Utils and Styles
import { gridStyle} from '../theme/themes.js';
import { fetchFixtureQuery, fetchWorkstationQuery } from '../../utils/queryUtils.js';

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
  //const [failStationsData, setFailStationsData] = useState([]);
  //const [defectCodesData, setDefectCodesData] = useState([]);
  const normalizeStart = (date) => new Date(new Date(date).setHours(0, 0, 0, 0));
  const normalizeEnd = (date) => new Date(new Date(date).setHours(23, 59, 59, 999));
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return normalizeStart(date);
  });
  const [endDate, setEndDate] = useState(normalizeEnd(new Date()));
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    setLoading(true);

    const fetchSXM5 = () => 
      fetchWorkstationQuery({
        parameters: [{ id: 'model', value: 'Tesla SXM5' }],
        startDate,
        endDate,
        key: 'sxm5',
        setDataCache: setTestStationData,
        API_BASE,
        API_Route: '/api/functional-testing/station-performance?'
      });

    const fetchSXM4 = () => 
      fetchWorkstationQuery({
        parameters: [{ id: 'model', value: 'Tesla SXM4' }],
        startDate,
        endDate,
        key: 'sxm4',
        setDataCache: setTestStationDataSXM4,
        API_BASE,
        API_Route: '/api/functional-testing/station-performance?'
      });

    const fetchFixtures = () => 
      fetchFixtureQuery({
        startDate,
        endDate,
        key: 'fixtures',
        setDataCache: setTopFixturesData,
        API_BASE,
        API_Route: '/api/functional-testing/fixture-performance?'
      });

    // const fetchFailStations = () => {
    //   const params = new URLSearchParams();
    //   if (startDate) {
    //     const utcStartDate = new Date(startDate);
    //     utcStartDate.setUTCHours(0, 0, 0, 0);
    //     params.append('startDate', utcStartDate.toISOString());
    //   }
    //   if (endDate) {
    //     const utcEndDate = new Date(endDate);
    //     utcEndDate.setUTCHours(23, 59, 59, 999);
    //     params.append('endDate', utcEndDate.toISOString());
    //   }

    //   const cacheKey = `failStations_${params.toString()}`;

    //   const cachedData = dataCache.get(cacheKey);
    //   if (cachedData) {
    //     setFailStationsData(cachedData);
    //     return Promise.resolve(cachedData);
    //   }

    //   return fetch(`${API_BASE}/api/defect-records/fail-stations?${params.toString()}`)
    //     .then(res => res.json())
    //     .then(data => {
    //       setFailStationsData(data);
    //       dataCache.set(cacheKey, data);
    //       return data;
    //     })
    //     .catch(() => {
    //       setFailStationsData([]);
    //       return [];
    //     });
    // };

    // const fetchDefectCodes = () => {
    //   const params = new URLSearchParams();
    //   if (startDate) {
    //     const utcStartDate = new Date(startDate);
    //     utcStartDate.setUTCHours(0, 0, 0, 0);
    //     params.append('startDate', utcStartDate.toISOString());
    //   }
    //   if (endDate) {
    //     const utcEndDate = new Date(endDate);
    //     utcEndDate.setUTCHours(23, 59, 59, 999);
    //     params.append('endDate', utcEndDate.toISOString());
    //   }

    //   const cacheKey = `defectCodes_${params.toString()}`;

    //   const cachedData = dataCache.get(cacheKey);
    //   if (cachedData) {
    //     setDefectCodesData(cachedData);
    //     return Promise.resolve(cachedData);
    //   }

    //   return fetch(`${API_BASE}/api/defect-records/defect-codes?${params.toString()}`)
    //     .then(res => res.json())
    //     .then(data => {
    //       setDefectCodesData(data);
    //       dataCache.set(cacheKey, data);
    //       return data;
    //     })
    //     .catch(() => {
    //       setDefectCodesData([]);
    //       return [];
    //     });
    // };

    Promise.all([fetchSXM4(), fetchSXM5(), fetchFixtures()])
      .then(() => setLoading(false)) 
      .catch(error => {
        console.error("Error fetching dashboard data:", error);
        setLoading(false); 
      });

    const interval = setInterval(() => {
      dataCache.clear();

      Promise.all([fetchSXM4(), fetchSXM5(), fetchFixtures()])
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
        <TestStationChart 
          label="SXM5 Test Station Performance"
          data={testStationData}
          loading={loading} />
        <TestStationChart 
          label={"SXM4 Test Station Performance"}
          data={testStationDataSXM4} 
          loading={loading}/>
        <FixtureFailParetoChart 
          label={"Fixture Performance"}
          data={topFixturesData}
          loading={loading} />
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