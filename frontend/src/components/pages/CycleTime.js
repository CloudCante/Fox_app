import React,{useState, useCallback} from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { Header } from '../pagecomp/Header.jsx';
import { sampleViolinData } from '../../data/sampleData.js';
import { BoxChart } from '../charts/BoxChart.js';
import { ViolinChart } from '../charts/ViolinChart.js';
import { gridStyle } from '../theme/themes.js';
import { buttonStyle } from '../theme/themes.js';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

export const StationCycleTime =() => {

    const [data, setData] = useState([]);

    const [filter, setFilter] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState([]);

    const handleLoadData = useCallback(async () => {
        try {
            // Fetch data 
        } catch (error) {
            console.error('Error fetching cycle time data:', error);
        }
    }, []);

    // Filter block for data processing

    return(
        <Box>
            <Header title="Station Cycle Time" subTitle="Charting station cycle times for shipped items" />
            <Box>
                {/* Filter placeholder */}
                {/* Button to load data */}
                <Button style={buttonStyle} onClick={() =>{ handleLoadData }}>
                    Import Serial Numbers
                </Button>
            </Box>
            <Divider/>
            <Box sx={gridStyle}>
                <BoxChart
                    data={sampleViolinData}
                    width={600}
                    height={400}/>
                <ViolinChart
                    data={sampleViolinData}
                    width={600}
                    height={400}
                    isHorizontal={true}/>
            </Box>
        </Box>
    )
}
export default StationCycleTime;