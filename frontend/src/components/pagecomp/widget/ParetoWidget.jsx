// Widget for TestStation Reports
import React,{useState, useEffect, useContext} from 'react';
import { Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import { Header } from '../Header.jsx'
import { buttonStyle, gridStyle, paperStyle } from '../../theme/themes.js';
import { ParetoChart } from '../../charts/ParetoChart.js'
import { fetchErrorQuery } from '../../../utils/queryUtils.js';
import { GlobalSettingsContext } from '../../../data/GlobalSettingsContext.js';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}
const modelKeys = [
    {id:"All", model:"ALL", key:"sxm4"},
    {id:"Tesla SXM4", model:"Tesla SXM4", key:"sxm4"},
    {id:"Tesla SXM5", model:"Tesla SXM5", key:"sxm5"},
    {id:"Tesla SXM6", model:"SXM6", key:"sxm6"}
]
const options =  modelKeys.map(w => w.id);
// label, data ,loading
export function ParetoWidget() {
    const { startDate, endDate,barLimit} = useContext(GlobalSettingsContext);
    const [data, setData] = useState([]);
    const [model,setModel]= useState([]);
    const [key,setKey]= useState([]);
    const [loading, setLoading] = useState(true); 
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!loaded) return;
        let isActive = true;
        const fetchData = async () => {
            setLoading(true);
            try {
            await fetchErrorQuery({
                parameters: [{ id: 'model', value: model }],
                startDate,
                endDate,
                key,
                setDataCache: data => {
                if (isActive) setData(data);
                },
                API_BASE,
                API_Route: '/api/snfn/model-errors?'
            });
            } catch (err) {
            console.error('Error fetching data', err);
            setLoaded(false);
            if (isActive) setData([]);
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
    }, [model, key, startDate, endDate, loaded]);


    const handleSetModelKey= e => {
        const selectedId = e.target.value;
        const entry = modelKeys.find(mk => mk.id === selectedId);
        if (entry) {
        setModel(entry.model);
        setKey(entry.key);
        setData([]); // reset data
        }
    };

    if (!loaded){
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
                    {model.length > 0 && (
                        <Button sx={buttonStyle} onClick={() => setLoaded(true)}>Load Chart</Button>
                    )}
                </Box>
            </Paper>
        );
    }
    return (
        <ParetoChart
          label={`${model} Test Station Pareto`}
          data={data} 
          loading={loading}
          limit={barLimit}/>
    );
}
