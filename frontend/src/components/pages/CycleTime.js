import React,{useState, useCallback, useRef, useMemo } from 'react';
import { Box, Typography, Button, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Papa from 'papaparse';
import { Header } from '../pagecomp/Header.jsx';
import { sampleViolinData } from '../../data/sampleData.js';
import { BoxChart } from '../charts/BoxChart.js';
import { ViolinChart } from '../charts/ViolinChart.js';
import { gridStyle } from '../theme/themes.js';
import { buttonStyle } from '../theme/themes.js';
import { importQuery } from '../../utils/queryUtils.js';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

export const StationCycleTime =() => {

    const [data, setData] = useState([]);
    const fileInputRef = useRef(null);

    const [filter, setFilter] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('');

    const handleImportClick = () => {
        if(fileInputRef.current){
            fileInputRef.current.click();
        }
    }

    const handleFileChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: async (results) => {
            console.log('Parsed CSV:', results.data);

            // Grab SNs from the first column (assuming header "sn")
            const sns = results.data
                .map(row => row?.sn)
                .filter(v => v !== undefined && v !== null && v !== "");

            if (sns.length === 0) {
                console.warn("No serial numbers found in CSV");
                return;
            }

            try {
                // Call backend using importQuery (POST)
                const backendData = await importQuery(
                API_BASE,
                "/station-times",
                {},            // GET params not needed
                "POST",
                { sns }        // Body of the POST
                );

                console.log("Backend data:", backendData);
                setData(backendData);  // Store backend query results
            } catch (err) {
                console.error("Failed to fetch station-times:", err);
            }
            },
            error: (err) => {
            console.error('Error parsing CSV: ', err);
            }
        });

        e.target.value = null;
        }, []);


    const filterOptions = useMemo(() => {
        if (!data || data.length === 0) return [];
        return [...new Set(data.map(row => row.workstation_name).filter(Boolean))];
    }, [data]);

    const filteredData = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) return [];
        if (!selectedFilter) return [];

        return data
            .filter(row => row.workstation_name === selectedFilter)
            .map(row => row.total_time)
            .filter(v => v !== undefined && v !== null && v !== "");
    }, [data, selectedFilter]);


    // Filter block for data processing
    // Compute filtered dataset for BoxChart based on selected filter
    // const filteredData = useMemo(() => {
    //     if (!Array.isArray(data) || data.length === 0) return [];
    //     if (!selectedFilter) return [];

    //     const keys = Object.keys(data[0] || {});
    //     if (keys.length < 3) return [];

    //     const filterCol = keys[1]; // column 2
    //     const valueCol = keys[2];  // column 3

    //     return data
    //         .filter(row => row?.[filterCol] === selectedFilter)
    //         .map(row => row?.[valueCol])   // <-- just column 3 values
    //         .filter(v => v !== undefined && v !== null && v !== "");
    // }, [data, selectedFilter]);

    return(
        <Box>
            <Header title="Station Cycle Time" subTitle="Charting station cycle times for shipped items" />
            <Box>
                {/* Filter placeholder */}
                <FormControl sx={{ minWidth: 200 }} disabled={filterOptions.length === 0}>
                    <InputLabel>Filter</InputLabel>
                    <Select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                    >
                        {filterOptions.map((option, idx) => (
                        <MenuItem key={idx} value={option}>
                            {option}
                        </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* Button to load data */}
                <Button style={buttonStyle} onClick={ handleImportClick }>
                    Import Serial Numbers (CSV)
                </Button>
                <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{display:'none'}}
                />
            </Box>
            <Divider/>
            
                {data && data.length > 0 && selectedFilter ? (
            <Box sx={gridStyle}>
                <BoxChart
                    data={filteredData}
                    width={600}
                    height={400}/>
                <ViolinChart
                    data={filteredData}
                    width={600}
                    height={400}
                    isHorizontal={true}/>
            </Box>):<Typography>No data available</Typography>}
        </Box>
    )
}
export default StationCycleTime;