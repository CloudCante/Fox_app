import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Box, Typography, Button, Divider, TextField, useTheme } from '@mui/material';
import Papa from 'papaparse';
import { Header } from '../pagecomp/Header.jsx';
import { buttonStyle } from '../theme/themes.js';
import { DateRange } from '../pagecomp/DateRange.jsx';
import { getInitialStartDate, normalizeDate } from '../../utils/dateUtils.js';
import { importQuery } from '../../utils/queryUtils.js';
import { exportSecureCSV } from '../../utils/exportUtils.js';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

export const ByErrorCode = () => {
  // Date range state
  const [startDate, setStartDate] = useState(getInitialStartDate());
  const [endDate, setEndDate] = useState(normalizeDate.end(new Date()));
  const handleStartDateChange = useCallback(date => setStartDate(normalizeDate.start(date)), []);
  const handleEndDateChange = useCallback(date => setEndDate(normalizeDate.end(date)), []);

  // Data states: csvData holds imported CSV rows, codeData holds backend results
  const [data, setData] = useState([]);
  const [codeCheck,setCodeCheck]=useState('')
//   const [codeData, setCodeData] = useState([]);
//   const [passCheck, setPassCheck] = useState('');
//   const [passData, setPassData] = useState([]);
//   const [snData, setSnData] = useState([]);

    const theme = useTheme();

    useEffect(()=>{
        if(!!codeCheck)return;
        try{
            console.log('Checking on: ',codeCheck)
            const checkArray = codeCheck
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
            const backendData = importQuery(
                API_BASE,
                '/api/testboardRecords/by-error',
                {  },
                'POST',
                { checkArray,startDate, endDate, }
            );
            console.log('Backend query results: ',backendData)
            setData(backendData);
        }
        catch(err){ console.error('Failed to fetch Sn:', err); }
    },[codeCheck,startDate,endDate])

    const getTimestamp = () => {
        const now = new Date();
        return now.toISOString().replace(/:/g, '-').replace(/\..+/, '');
    };

    const exportToCSV = useCallback(() => { 
        try {
          const rows = [];
          data.forEach((row) => {
              rows.push([row[`sn`],row[`pn`]
                , row['error_code']
              ]);
          });
          const headers = [
            'Serial Number',
            'Part Number',
            'Error Code'
          ];
          const filename = `SNPN_ByError${getTimestamp()}.csv`;
          // Use secure export function
          exportSecureCSV(rows, headers, filename);
        } 
        catch (error) {
          console.error('Export failed:', error);
          alert('Export failed. Please try again.');
        };
    }, [date]);

    function handleExportCSV() {
        if (exportCooldown) return;
        setExportCooldown(true);
        try {
        exportToCSV();
        } catch(err) {
        console.error(err);
        alert('Export failed');
        } finally {
        // always clear cooldown
        setTimeout(()=>setExportCooldown(false),3000);
        }
    }

    const getBG = (status) => {
      const key = String(status || '').toLowerCase();

      const MAP = {
        passed: theme.palette.mode === 'dark'? theme.palette.info.dark:theme.palette.info.light,
        pending: theme.palette.mode === 'dark'? '#A29415':'#E9DB5D',
        missing: theme.palette.mode === 'dark'? '#e65100':'#ff9800',
      };

      return MAP[key] || (theme.palette.mode === 'dark'? theme.palette.error.dark:theme.palette.error.light);
    };

  return (
    <Box>
      <Header title="Get Serial number and Part number by Error code" subTitle="Retreive Serial number and Partnumber of all parts in a range that failed a certain Error code" />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <DateRange
          startDate={startDate}
          endDate={endDate}
          setStartDate={handleStartDateChange}
          setEndDate={handleEndDateChange}
          normalizeStart={normalizeDate.start}
          normalizeEnd={normalizeDate.end}
        />
        <TextField 
          id="ErrorCodeField" 
          label="Errorcode" 
          variant="outlined" 
          value={codeCheck}
          onChange={(e)=>setCodeCheck(e.target.value)}
        />
        {date.length>0 ?(
        <Button sx={buttonStyle} onClick={handleExportCSV}>
          Export Data (CSV)
        </Button>):
        <></>}
      </Box>

      <Divider />

      {mergedDate.length > 0 ? (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Typography>Data accepted.</Typography>
            <Typography>Total SN: {date.length}</Typography>
          </Box>
          {date.map(row => (
              <Typography sx={{/*backgroundColor:getBG(row['error_code'])*/}}>{row['sn']}: {row['pn']}: {row['error_code']}</Typography>
          ))}
        </>
      ) : (
        <Typography>No data available. Import a CSV to get started.</Typography>
      )}
    </Box>
  );
};

export default ByErrorCode;
