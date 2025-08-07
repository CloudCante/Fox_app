// Widget for TestStation Reports
import React,{useState, useEffect, useContext} from 'react';
import { Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, Paper, CircularProgress } from '@mui/material';
import { Header } from '../../pagecomp/Header.jsx'
import { gridStyle, paperStyle } from '../../theme/themes.js';
import { getInitialStartDate, normalizeDate } from '../../../utils/dateUtils.js';
import  PackingOutputBarChart  from '../../charts/PackingOutputBarChart.js';
import { buttonStyle } from '../../theme/themes.js';
import { usePackingData } from '../../hooks/packingCharts/usePackingData.js';
import { useWeekNavigation } from '../../hooks/packingCharts/useWeekNavigation.js';
import { GlobalSettingsContext } from '../../../data/GlobalSettingsContext.js';

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
export function PackingChartWidget() {
    const { startDate, endDate, weekRange, barLimit, currentISOWeekStart} = useContext(GlobalSettingsContext);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(true); 

    const [model,setModel]= useState('');
    const [timeFrame,setTimeFrame]= useState('');
    const [showTrend,setShowTrend]= useState(false);
    const [showAvg,setShowAvg]= useState(false);
    const [color,setColor]= useState(false);

    const [loaded,setLoaded] = useState(false);

    const {
        dailyData,
        loadingDaily,
        errorDaily,
        weeklyData,
        loadingWeekly,
        errorWeekly
    } = usePackingData(API_BASE, model||"Tesla SXM4", currentISOWeekStart, barLimit);

    useEffect(() => {
        if (!loaded) return;
        if(timeFrame === "Daily"){
            setData(dailyData);
            setLoading(loadingDaily);
            setError(errorDaily);
        }
        else{
            setData(weeklyData);
            setLoading(loadingWeekly);
            setError(errorWeekly);
        }
    }, [model, timeFrame, startDate, endDate, loaded]);


    const handleSetModelKey= e => {
        const selectedId = e.target.value;
        const entry = modelKeys.find(mk => mk.id === selectedId);
        if (entry) {
        setModel(entry.model);
        setData([]); // reset data
        }
    };
    const handleSetTimeFrame= e => {
        const selectedId = e.target.value;
        setTimeFrame(selectedId);
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
                    <FormControl fullWidth>
                        <InputLabel id="model-select-label">Select Time Frame</InputLabel>
                        <Select
                        label="Choose Timeframe"
                        value = {timeFrame}
                        onChange={handleSetTimeFrame}
                        >
                            <MenuItem value={'Daily'}>
                            Daily
                            </MenuItem>
                            <MenuItem value={'Weekly'}>
                            Weekly
                            </MenuItem>
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center',}}>
                        <Button sx={buttonStyle}variant="contained" size='small'
                        onClick={()=>setShowTrend(!showTrend)}>{showTrend?"Don't show Trendline":'Show Trendline'}</Button>
                        
                        <Button sx={buttonStyle}variant="contained" size='small'
                        onClick={()=>setShowAvg(!showAvg)}>{showAvg?"Don't show Avg line":'Show Avg line'}</Button>
                    </Box>
                    {(model.length > 0 & timeFrame.length > 0) && (
                        <Button sx={buttonStyle} onClick={() => setLoaded(true)}>Load Chart</Button>
                    )}
                </Box>
            </Paper>
        );
    }
    if(data.length === 0){return <Typography color="error">Error: Data failed to load</Typography>}
    //console.log(data)
    return (
        <>
            {loading ? <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress />
                </Box> :
            error ? <Typography color="error">{error}</Typography> :
            <PackingOutputBarChart
                title={`${timeFrame} Packing Output for ${model}`}
                data={data}
                color="#4caf50"
                showTrendLine={showTrend}
                showAvgLine={showAvg}
            />}
        </>
        // <PackingOutputBarChart
        //  title={`${timeFrame} Packing Output for ${model}`}
        //  data={data}
        //  color="#4caf50"
        //  showTrendLine={showTrend}
        //  showAvgLine={showAvg}
        //  />

    );
}
