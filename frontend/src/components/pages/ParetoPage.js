// React Core
import React, { useEffect, useState, useRef } from 'react';
// Material UI Components
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
// Third Party Libraries
import 'react-datepicker/dist/react-datepicker.css';
// Custom Charts
import { TestStationChart } from '../charts/TestStationChart.js';
import { FixtureFailParetoChart } from '../charts/FixtureFailParetoChart.js';
//import { ParetoChart } from '../charts/ParetoChart';
// Page Components
import { Header } from '../pagecomp/Header.jsx';
import { DateRange } from '../pagecomp/DateRange.jsx';
// Utilities and Helpers
import { dataCache } from '../../utils/cacheUtils.js';
import { gridStyle } from '../theme/themes.js';
import { fetchFixtureQuery, fetchWorkstationQuery, fetchErrorQuery } from '../../utils/queryUtils.js';
import { ParetoChart } from '../charts/ParetoChart.js';

const ReadOnlyInput = React.forwardRef((props, ref) => (
  <input {...props} ref={ref} readOnly />
));
const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}
console.log('API_BASE:', API_BASE);

const refreshInterval = 300000; // 5 minutes

export const ParetoPage = () => {
  const [errorcodeDataSXM4, setErrorcodeDataSXM4] = useState([]);
  const [errorcodeDataSXM5, setErrorcodeDataSXM5] = useState([]);
  const [errorcodeDataSXM6, setErrorcodeDataSXM6] = useState([]);
  const [errocodeDataAll,setErrorcodeDataAll] = useState([]);
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

    const fetchErrorData = ({ value, key, setter }) =>
      fetchErrorQuery({
        parameters: [{ id: 'model', value: value }],
        startDate,
        endDate,
        key,
        setDataCache: setter,
        API_BASE,
        API_Route: '/api/snfn/model-errors?'
      });

    const codesSXM4 = () => fetchErrorData({value:'Tesla SXM4',key:'sxm4',setter: setErrorcodeDataSXM4});
    const codesSXM5 = () => fetchErrorData({value:'Tesla SXM5',key:'sxm5',setter: setErrorcodeDataSXM5});
    const codesSXM6 = () => fetchErrorData({value:'SXM6',key:'sxm6',setter: setErrorcodeDataSXM6});


    const fetchFixtures = () => 
      fetchFixtureQuery({
        startDate,
        endDate,
        key: 'fixtures',
        setDataCache: setTopFixturesData,
        API_BASE,
        API_Route: '/api/functional-testing/fixture-performance?'
      });

    Promise.all([codesSXM4(), codesSXM5(), codesSXM6(), fetchFixtures()])
      .then(() => setLoading(false)) 
      .catch(error => {
        console.error("Error fetching dashboard data:", error);
        setLoading(false); 
      });

    const interval = setInterval(() => {
      dataCache.clear();

      Promise.all([codesSXM4(), codesSXM5(), codesSXM6, fetchFixtures()])
        .catch(error => console.error("Error refreshing dashboard data:", error));
    }, refreshInterval);

    return () => clearInterval(interval); 
  }, [startDate, endDate]);

  return (
    <Box p={1}>
      <Header title="Pareto Charts" subTitle="Pareto error codes" />
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <DateRange
          startDate={startDate}
          setStartDate={setStartDate}
          normalizeStart={normalizeStart}
          endDate={endDate}
          setEndDate={setEndDate}
          normalizeEnd={normalizeEnd}
          inline= {true}
        />
      </div>
      <Box sx={gridStyle}>
        <ParetoChart 
          label={"SXM4 Test Station Performance"}
          data={errorcodeDataSXM4} 
          loading={loading}/>
        <ParetoChart 
          label="SXM5 Test Station Performance"
          data={errorcodeDataSXM5}
          loading={loading} />
        <ParetoChart 
          label="SXM6 Test Station Performance"
          data={errorcodeDataSXM6}
          loading={loading} />
        <FixtureFailParetoChart 
          label={"Fixture Performance"}
          data={topFixturesData}
          loading={loading} />
      </Box>
    </Box>
  );
};

export default ParetoPage;