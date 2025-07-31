import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import Papa from 'papaparse';
import { Header } from '../pagecomp/Header.jsx';
import { BoxChart } from '../charts/BoxChart.js';
import { ViolinChart } from '../charts/ViolinChart.js';
import { buttonStyle } from '../theme/themes.js';
import { DateRange } from '../pagecomp/DateRange.jsx';
import { getInitialStartDate, normalizeDate } from '../../utils/dateUtils.js';
import { importQuery } from '../../utils/queryUtils.js';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

export const MostRecentFail = () => {
  // Date range state
  const [startDate, setStartDate] = useState(getInitialStartDate());
  const [endDate, setEndDate] = useState(normalizeDate.end(new Date()));
  const handleStartDateChange = useCallback(date => setStartDate(normalizeDate.start(date)), []);
  const handleEndDateChange = useCallback(date => setEndDate(normalizeDate.end(date)), []);

  // Data states: csvData holds imported CSV rows, codeData holds backend results
  const [csvData, setCsvData] = useState([]);
  const [codeData, setCodeData] = useState([]);

  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback(async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: async results => {
        console.log('Parsed CSV:', results.data);

        // Store raw CSV rows
        setCsvData(results.data);

        // Extract SNS
        const sns = results.data
          .map(row => row.sn)
          .filter(v => v !== undefined && v !== null && v !== '');

        if (sns.length === 0) {
          console.warn('No serial numbers found in CSV');
          return;
        }

        try {
          // Fetch backend results
            const qs = `?startDate=${encodeURIComponent(startDate.toISOString())}&endDate=${encodeURIComponent(endDate.toISOString())}`;
            console.log('>> Request URL:', API_BASE + '/api/testboardRecords/most-recent-fail' + qs);
            console.log('>> Request body:', { sns });
          
          const backendData = await importQuery(
            API_BASE,
            '/api/testboardRecords/most-recent-fail',
            {  },
            'POST',
            { sns,startDate, endDate }
          );
          console.log('Backend data:', backendData);

          // Store backend query results
          setCodeData(backendData);
        } catch (err) {
          console.error('Failed to fetch error codes:', err);
        }
      },
      error: err => console.error('Error parsing CSV:', err)
    });

    e.target.value = null;
  }, [startDate, endDate]);

  return (
    <Box>
      <Header title="Station Cycle Time" subTitle="Charting station cycle times for shipped items" />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <DateRange
          startDate={startDate}
          endDate={endDate}
          setStartDate={handleStartDateChange}
          setEndDate={handleEndDateChange}
          normalizeStart={normalizeDate.start}
          normalizeEnd={normalizeDate.end}
        />

        <Button sx={buttonStyle} onClick={handleImportClick}>
          Import Serial Numbers (CSV)
        </Button>
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </Box>

      <Divider />

      {codeData.length > 0 ? (
        <>
            <Typography>Data accepted.</Typography>
            {codeData.map(row => (
                <Typography>{row[0]}: {row[1]}</Typography>
            ))}
        </>
      ) : (
        <Typography>No data available. Import a CSV to get started.</Typography>
      )}
    </Box>
  );
};

export default MostRecentFail;
