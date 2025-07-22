// CellThroughput.js
import React,{ useEffect, useState, useMemo, Children} from 'react';
import {
  Box, Paper, Typography, Modal, Pagination, Select, MenuItem, InputLabel, FormControl, OutlinedInput, Checkbox, ListItemText, TextField, Button, Menu,
} from '@mui/material';
//import DatePicker from 'react-datepicker';
//import 'react-datepicker/dist/react-datepicker.css';
import { useTheme } from '@mui/material';
import { exportSecureCSV, jsonExport } from '../../utils/exportUtils.js';
import { importQuery } from '../../utils/queryUtils.js';
import { sanitizeText } from '../../utils/textUtils.js';
import { MultiMenu } from '../pagecomp/MultiMenu.jsx';
import { MultiFilter } from '../pagecomp/MultiFilter.jsx';
import { DataTable } from '../pagecomp/snfn/DataTable.jsx';
import { useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

// Check for environment variable for API base
const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}
 
const CellThroughputPage = () => {
  // State initialization for date and time
  //const normalizeStart = (date) => new Date(new Date(date).setHours(0, 0, 0, 0));
  //const [startDate, setStartDate] = useState(normalizeStart(new Date()));
  const [startDate, setStartDate] = useState(() => dayjs().startOf('day').add(8,'hour'));
  const [startTime, setStartTime] = useState(() => dayjs().startOf('day').add(8,'hour'));
  const [endTime, setEndTime] = useState(() => dayjs().startOf('day').add(16,'hour'));

  function getOut(){
    console.log(startDate);
    //console.log(startTime);
    console.log(endTime);
  };

  return(
      <Box>
          {/* Page Header */}
          <Box sx={{ py: 4 }}>
              <Typography variant="h4" gutterBottom>
              Cell Throuhput Reports 
              </Typography>
              <Typography variant="body1" color="text.secondary">
              Daily Cell Aggregates
              </Typography>
          </Box>
          {/* Time and Date Selections */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => {
                if(!newValue)return;
                setStartDate(newValue.startOf('day').add(startDate.hour(),'hour').add(startDate.minute(),'minute'));
                //setStartTime(newValue.startOf('day').add(startTime.hour(),'hour').add(startTime.minute(),'minute'));
                setEndTime(newValue.startOf('day').add(endTime.hour(),'hour').add(endTime.minute(),'minute'));
              }}
              maxDate={dayjs()}            // prevents future dates
              renderInput={(params) => <TextField {...params} size="small" />}
            />
            <TimePicker
              label="Start Time"
              value={startDate}
              maxTime={endTime}
              onChange={(newValue) => {
                if(!newValue)return;
                setStartDate(newValue)
              }}
              renderInput={(params) => <TextField {...params} size="small" sx={{ ml: 2 }} />}
            />
            <TimePicker
              label="End Time"
              value={endTime}
              minTime={startDate}
              onChange={(newValue) => {
                if(!newValue)return;
                setEndTime(newValue)
              }}
              renderInput={(params) => <TextField {...params} size="small" sx={{ ml: 2 }} />}
            />
          </LocalizationProvider>
          <Button onClick={getOut}>Test</Button>
      </Box>
  );
}
export default CellThroughputPage;