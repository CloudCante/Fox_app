import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Box, Typography, Button, Divider, FormControl, InputLabel, Select, MenuItem, Fade, Paper } from '@mui/material';
import Papa from 'papaparse';
import { Header } from '../pagecomp/Header.jsx';
import { BoxChart } from '../charts/BoxChart.js';
import { ViolinChart } from '../charts/ViolinChart.js';
import { gridStyle, buttonStyle } from '../theme/themes.js';
import { importQuery } from '../../utils/queryUtils.js';
import { stationBuckets } from '../../data/dataTables';
import * as d3 from 'd3';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) console.error('REACT_APP_API_BASE is not set');

export const StationCycleTime = () => {
  const [rawData, setRawData] = useState([]);
  const fileInputRef = useRef(null);
  const [useBuckets, setUseBuckets] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('');

  const boxChartRef = useRef(null);
  const violinChartRef = useRef(null);

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = useCallback(async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: async results => {
        const sns = results.data.map(r => r.sn).filter(Boolean);
        if (!sns.length) return console.warn('No SNs found in CSV');
        try {
          const backendData = await importQuery(API_BASE, '/api/workstationRoutes/station-times', {}, 'POST', { sns });
          setRawData(backendData);
        } catch (err) {
          console.error('Fetch error:', err);
        }
      },
      error: err => console.error(err)
    });
    e.target.value = null;
  }, []);

  // Build lookup from stationBuckets[0]
  const stationBucketLookup = useMemo(() => {
    const lookup = {};
    const bucketsObj = stationBuckets || {};
    Object.entries(bucketsObj).forEach(([bucket, stations]) => {
      stations.forEach(st => lookup[st] = bucket);
    });
    return lookup;
  }, []);

  // bucketData: array of objects matching rawData schema
  const bucketData = useMemo(() => {
    const combinedData = Object.values(rawData.map(r => ({
        ...r,
        // overwrite workstation_name with its bucket (or 'Unbucketed')
        workstation_name: stationBucketLookup[r.workstation_name] || 'Unbucketed'
    })).reduce((acc,item)=>{
        const cKey = `${item.sn}-${item.workstation_name}`;
        if(!acc[cKey]){
            acc[cKey]={sn:item.sn,workstation_name:item.workstation_name,total_time:item.total_time};
        }
        acc[cKey].total_time+=item.total_time;
        return acc;
    },{}));

    //console.log("raw:",rawData);
    //console.log("combined:",combinedData);
    //console.log("key:",stationBucketLookup);
    return combinedData;
  }, [rawData, stationBucketLookup]);

  const data = useBuckets ? bucketData : rawData;

  const filterOptions = useMemo(
    () => [...new Set(data.map(r => r.workstation_name).filter(Boolean))],
    [data]
  );

  //const log = useMemo(()=> console.log("filter",filterOptions),[filterOptions]);

  const filteredData = useMemo(() => {
    if (!selectedFilter) return [];
    return data.filter(r => r.workstation_name === selectedFilter)
               .map(r => r.total_time)
               .filter(v => v != null);
  }, [data, selectedFilter]);

    const {stats} = useMemo(()=>{
        if(!filteredData.length) return{}
        const s = filteredData.slice().sort(d3.ascending);
        const stats = [
            {label : 'Minimum', value : Number(d3.min(s)).toFixed(2)},
            {label : 'Q1', value : Number(d3.quantile(s, 0.25)).toFixed(2)},
            {label : 'Median', value : Number(d3.quantile(s, 0.5)).toFixed(2)},
            {label : 'Q3', value : Number(d3.quantile(s, 0.75)).toFixed(2)},
            {label : 'Maximum', value : Number(d3.max(s)).toFixed(2)},
            {label : 'IQR', value : Number(d3.quantile(s, 0.75)).toFixed(2)-Number(d3.quantile(s, 0.25)).toFixed(2)},
            {label : 'Mean', value : Number(d3.mean(s)).toFixed(2)}
        ]
        return {stats}
  },[filteredData]);

    
  const handleExportSVG=(svgNode, filename, lowerBound,upperBound)=>{
    if(!svgNode) return;
    console.log("filename: ",filename);
    console.log("Minimum value: ",lowerBound);
    console.log("Maximum value: ",upperBound);
  }

  return (
    <Box>
      <Header title="Station Cycle Time" subTitle="Charting station cycle times" />
      <Box>
        <FormControl sx={{ minWidth: 200 }} disabled={!filterOptions.length}>
          <InputLabel>Filter</InputLabel>
          <Select value={selectedFilter} onChange={e => setSelectedFilter(e.target.value)}>
            {filterOptions.map((opt, i) => <MenuItem key={i} value={opt}>{opt}</MenuItem>)}
          </Select>
        </FormControl>
        <Button sx={buttonStyle} onClick={handleImportClick}>Import CSV</Button>
        <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
        <Button sx={buttonStyle} onClick={() => {
            setSelectedFilter('');
            setUseBuckets(prev => !prev);
            }}>
          {useBuckets ? 'Use Workstations' : 'Use Buckets'}
        </Button>
      </Box>
      <Divider />
      {!data.length ? (
        <Typography>No data available</Typography>
      ) : selectedFilter ? (
        <>
        <Fade in={true}>
          <Paper sx={{ mt: 2, p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Station Details (Hours)- {selectedFilter}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {stats.map(({ label, value }) => (
                    <Typography key={label} variant="body2">
                    <strong>{label}:</strong> {value}
                    </Typography>
                ))}
            </Box>
          </Paper>
        </Fade>
        <Box sx={gridStyle}>
          <BoxChart 
          ref = {boxChartRef}
          data = {filteredData} 
          width = {600} height = {400} 
          axisLabel = "Cycle Time in Hours"
          onExport = {(node,lb,ub)=>handleExportSVG((node,lb,ub),`${selectedFilter}-box`)}/>
          <ViolinChart 
          ref = {violinChartRef}
          data={filteredData} 
          width={600} height={400} 
          isHorizontal = {true}
          onExport = {node=>handleExportSVG(node,`${selectedFilter}-violin`)}/>
        </Box>
        </>
      ) : (
        <Typography>Select a filter to view charts</Typography>
      )}
    </Box>
  );
};

export default StationCycleTime;
