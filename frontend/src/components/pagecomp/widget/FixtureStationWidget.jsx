// Widget for Fixture Reports
import React,{useState, useEffect, useMemo, useContext} from 'react';
import { FixtureFailParetoChart } from '../../charts/FixtureFailParetoChart.js'
import { fetchFixtureQuery } from '../../../utils/queryUtils.js';
import { useGlobalSettings } from '../../../data/GlobalSettingsContext.js';
import { Paper,Box,  } from '@mui/material';
import { paperStyle } from '../../theme/themes.js';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

// label, data ,loading
export function FixtureStationWidget({widgetId}) {
    
    const { state, dispatch } = useGlobalSettings();
    const { 
        startDate,endDate
     } = state;
    if (!state) {
        return <Paper sx={paperStyle}><Box sx={{ p: 2 }}>Loading global state...</Box></Paper>;
    }    
    if (!widgetId) {
        return <Paper sx={paperStyle}><Box sx={{ p: 2 }}>Widget ID missing</Box></Paper>;
    }    
    const widgetSettings = (state.widgetSettings && state.widgetSettings[widgetId]) || {};

    // Initialize widget settings if they don't exist
    useEffect(() => {
        if (!state.widgetSettings || !state.widgetSettings[widgetId]) {
            dispatch({
                type: 'UPDATE_WIDGET_SETTINGS',
                widgetId,
                settings: {}
            });
        }
    }, [widgetId, state.widgetSettings, dispatch]);
    //const { startDate, endDate,barLimit} = useContext(GlobalSettingsContext);
    const [fixtureData, setFixtureData] = useState([]);
    //const [model,setModel]= useState([]);
    //const [key,setKey]= useState([]);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        //if (!model || !key) return;
        let isActive = true;
        const fetchData = async () => {
            setLoading(true);
            try {
            await fetchFixtureQuery({
                startDate,
                endDate,
                key: 'fixtures',
                setDataCache: data => {
                if (isActive) setFixtureData(data);
                },
                API_BASE,
                API_Route: '/api/functional-testing/fixture-performance?'
            });
            } catch (err) {
            console.error('Error fetching data', err);
            if (isActive) setFixtureData([]);
            } finally {
            if (isActive) setLoading(false);
            }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 300000);
    return () => {
        isActive = false;
        clearInterval(intervalId);
    };
    }, [ startDate, endDate]);



    return (
        <FixtureFailParetoChart
          label={`Fixture Performance`}
          data={fixtureData} 
          loading={loading}/>
    );
}
