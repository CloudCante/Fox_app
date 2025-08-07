// Widget for Fixture Reports
import React,{useState, useEffect, useMemo} from 'react';
import { FixtureFailParetoChart } from '../../charts/FixtureFailParetoChart.js'
import { fetchFixtureQuery } from '../../../utils/queryUtils.js';
import { getInitialStartDate, normalizeDate } from '../../../utils/dateUtils.js';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

// label, data ,loading
export function FixtureStationWidget({ 
    label,
    startDate = getInitialStartDate(7),
    endDate = normalizeDate.end(new Date()),
    limit = 7,
    useGlobal = false
}) {
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
          label={label?label:`Fixture Performance`}
          data={fixtureData} 
          loading={loading}/>
    );
}
