// Widget for TestStation Reports
import React,{useState, useEffect, useMemo} from 'react';
import { Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import { Header } from '../../pagecomp/Header.jsx'
import { gridStyle, paperStyle } from '../../theme/themes.js';
import { TestStationChart } from '../../charts/TestStationChart.js'
import { fetchWorkstationQuery } from '../../../utils/queryUtils.js';
import { getInitialStartDate, normalizeDate } from '../../../utils/dateUtils.js';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}
const modelKeys = [
    {id:"Tesla SXM4", model:"Tesla SXM4", key:"sxm4"},
    {id:"Tesla SXM5", model:"Tesla SXM5", key:"sxm5"},
    {id:"Tesla SXM6", model:"SXM6", key:"sxm6"}
]
const options =  modelKeys.map(w => w.id);
// label, data ,loading
export function TestStationWidget({ 
    label,
    startDate = getInitialStartDate(7),
    endDate = normalizeDate.end(new Date()),
    limit = 7,
}) {
    const [testStationData, setTestStationData] = useState([]);
    const [model,setModel]= useState([]);
    const [key,setKey]= useState([]);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        if (!model || !key || model.length === 0) return;
        let isActive = true;
        const fetchData = async () => {
            setLoading(true);
            try {
            await fetchWorkstationQuery({
                parameters: [{ id: 'model', value: model }],
                startDate,
                endDate,
                key: key,
                setDataCache: data => {
                if (isActive) setTestStationData(data);
                },
                API_BASE,
                API_Route: '/api/functional-testing/station-performance?'
            });
            } catch (err) {
            console.error('Error fetching data', err);
            if (isActive) setTestStationData([]);
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
    }, [model, key, startDate, endDate]);


    const handleSetModelKey= e => {
        const selectedId = e.target.value;
        const entry = modelKeys.find(mk => mk.id === selectedId);
        if (entry) {
        setModel(entry.model);
        setKey(entry.key);
        setTestStationData([]); // reset data
        }
    };

    if (model.length === 0 || key.length === 0 ){
        return(
            <Paper sx={paperStyle}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Header
                    title="Select Model"
                    subTitle="Choose a model to chart"
                    titleVariant="h6"
                    subTitleVariant="body2"
                    titleColor="text.secondary"
                    />
                    <FormControl fullWidth>
                        <InputLabel id="model-select-label">Choose Model</InputLabel>
                        <Select
                        label="Choose Model"
                        value = {modelKeys.find(mk => mk.model === model)?.id || ''}
                        onChange={handleSetModelKey}
                        >
                        {modelKeys.map(mk =>(
                            <MenuItem key={mk.id}value={mk.id}>
                            {mk.id}
                            </MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>
        );
    }
    return (
        <TestStationChart
          label={label?label:`${model} Test Station Performance`}
          data={testStationData} 
          loading={loading}/>
    );
}
