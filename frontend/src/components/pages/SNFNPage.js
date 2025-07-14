// Import required dependencies and components
import { useEffect, useState, useMemo, use } from 'react';
import {
  Box, Paper, Typography, Modal, Pagination,
  Select, MenuItem, InputLabel, FormControl,
  OutlinedInput, Checkbox, ListItemText, TextField,
  Button, Menu,
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { testSnFnData,codeDB } from '../../data/sampleData';
import { useTheme } from '@mui/material';


// Check for environment variable for API base
const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

const SnFnPage = () => {
  // State initialization for date range, modal, data, pagination, and filters
  const normalizeStart = (date) => new Date(new Date(date).setHours(0, 0, 0, 0));
  const normalizeEnd = (date) => new Date(new Date(date).setHours(23, 59, 59, 999));
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default to one week ago
    return normalizeStart(date);
  });
  const [endDate, setEndDate] = useState(normalizeEnd(new Date()));

  //  Modal and Pageination const
  const [modalInfo, setModalInfo] = useState([]); // Station data, Error data
  const [open, setOpen] = useState(false); // Modal closed/open state
  const [page, setPage] = useState(1); // Current pagination page

  // Data consts
  const [dataBase, setData] = useState([]); // Database of pulled data on staions and error codes
  const [errorCodeFilter, setErrorCodeFilter] = useState([]); // Array holding codes to filter for
  const [allErrorCodes, setAllErrorCodes] = useState([]); // Array holding error codes for filter list
  const [allCodeDesc, setCodeDesc] = useState([]); // Placeholder incase we need to read in desc vs static table
  const [stationFilter, setStationFilter] = useState([]); // Array holding stations to filter for
  const [allStationsCodes, setAllStations] = useState([]); // Array holding stations for filter list
  const [partsFilter, setPartsFilter] = useState([]); // Placeholder for PN filter
  const [allParts, setAllParts] = useState([]); // Placeholder for PN filter

  // UI consts
  const [itemsPerPage,setItemsPer] = useState(6); // Number of stations per page
  const [maxErrorCodes,setMaxErrors] = useState(5); // Number of error codes per station table
  const [sortAsc, setSortAsc] = useState(true); // true = ascending, false = descending
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Theme and style objects for consistent UI
  const theme = useTheme();
  const style = {
    border: 'solid',
    padding: '10px 8px',
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
    fontSize: '14px',
    left: 0,
    zIndex: 5,
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
  };
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
    outline: 0,
  };
  const tableStyle = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm:'1fr 1fr', md: '1fr 1fr 1fr' },
    gap: 3,
    maxWidth: '1600px',
    margin: '0 auto',
  };

  // Modal open/close handlers
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Store clicked modal row info
  const getClick = (row) => { // [stationData,codeData]
    setModalInfo(row);
    handleOpen();
  };

  // Modal rendering selected station and error code details
  const ModalContent = () => {
    const [stationData,codeData]=modalInfo;
    const codeDisc = (codeDB.find((x) => x[0] === codeData[0]) || [null, "NAN"])[1];
    return (
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        >
        <Box sx={modalStyle}>
            <Typography id="modal-title" variant="h5">Station {stationData?.[0][0]}</Typography>
            <Typography id="modal-sub-title" variant="h7">Station "{stationData?.[0][1]}"</Typography>
            <Typography id="modal-desc-summary" variant="body1">
            Error Code: {codeData?.[0]} — {codeData?.[2]?.length ?? 0} serial numbers
            </Typography>
            <Typography id="modal-desc-detail" variant="body2">
            Error Description: {codeDisc}
            </Typography>
            {codeData[2].map(([sn,pn], idx) => (
            <p key={sn}>SN: {sn}<br></br>- {pn}</p>
            ))}
        </Box>
      </Modal>
    );
  };

  const clearFilters = () => {
    const newStart = new Date();
    newStart.setDate(newStart.getDate() - 7);
    setStartDate(normalizeStart(newStart));
    setEndDate(normalizeEnd(new Date()));
    setErrorCodeFilter([]);
    setStationFilter([]);
    setPage(1);
  };

  // Get current time stamp for exporting
  const getTimestamp = () => {
    const now = new Date();
    return now.toISOString().replace(/:/g, '-').replace(/\..+/, '');
  };
  // Exporting
  const exportToCSV = () => {
    const rows = [];

    filteredData.forEach((station) => {
        const stationId = station[0];
        station.slice(1).forEach(([errorCode, count, snList]) => {
        snList.forEach((sn) => {
            rows.push([stationId, errorCode, count, sn]);
        });
        });
    });

    const header = ['Station', 'Error Code', 'Error Count', 'Serial Number'];
    const csvContent =
        [header, ...rows]
        .map((row) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `snfn_filtered_data_${getTimestamp()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const exportToJSON = () => {
    const jsonData = [];

    filteredData.forEach((station) => {
        const stationId = station[0];
        const errors = station.slice(1).map(([errorCode, count, snList]) => ({
        errorCode,
        count,
        serialNumbers: snList,
        }));
        jsonData.push({ station: stationId, errors });
    });

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: 'application/json;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `snfn_filtered_data_${getTimestamp()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleExportCSV = () => {
    exportToCSV();
    handleMenuClose();
  };
  const handleExportJSON = () => {
    exportToJSON();
    handleMenuClose();
  };

  // Fetch and process data initially and every 5 minutes
  useEffect(() => {
    const fetchAndSortData = async () => {
      const dataSet = testSnFnData; // Placeholder data
      const data = [];
      const codeSet = new Set();
      const stationSet = new Set();
      const partSet = new Set();

      dataSet.forEach((d) => {
        if (!Array.isArray(d) || d.length < 4) return;// catch for incorrect data structure
        // Currently pulls data as [FN(station number),SN(serial number),TN(count of error),EC(error code)]
        const [FN,SN,TN,EC,DT,PN,BT] = d //PN and BT are placeholder for PN(Part number) and BT(Dont know what this stands for just roll with it)
        
        const tPN = (PN === null || PN === undefined || PN === '') ? "NANPN" : PN;
        const tBT = (BT === null || BT === undefined || BT === '') ? "NANBT" : BT;
        
        // Validate date range
        const recordDate = new Date(DT);
        if (isNaN(recordDate) || recordDate < startDate || recordDate > endDate) {
            return;
        }

        if (TN == 0) return; // Skip if count is zero

        codeSet.add(EC); // Collect unique error codes
        stationSet.add(FN); //Collect unique Fixture numbers
        partSet.add(tPN); // Collect unique parts

        const idx = data.findIndex((x) => x[0][0] === FN);
        if (idx === -1) {
            // New station entry  [[FN,BT], [EC, Number(TN), [[SN,PN]]]
            data.push([[FN,tBT], [EC, Number(TN), [[SN,tPN]]]]);
        } else {
            // Update existing station entry
            const jdx = data[idx].findIndex((x)=>x[0]===EC);
            if(jdx === -1){ // New error code
                data[idx].push([EC, Number(TN), [[SN,tPN]]]);
            }else{ // Update existing error code
                const serials = data[idx][jdx][2]; // Array of SNs
                if (!serials.includes([SN,tPN])) { // checking for duplicate ec sn combonation
                    serials.push([SN,tPN]);
                }
                data[idx][jdx][1] += Number(TN); // currently still counts duplicate ec sn to tn
            }
        }
      });

      // Sort error codes for each station by count (descending)
      data.forEach((group) => {
        group.splice(1, group.length - 1, ...group.slice(1).sort((a, b) => b[1] - a[1]));
      });

      setAllErrorCodes([...codeSet]); // Populate filter list
      setAllStations([...stationSet]);
      setData(JSON.parse(JSON.stringify(data))); // Set main data
    };

    fetchAndSortData();
    const intervalId = setInterval(() => fetchAndSortData(), 300000); // Refresh every 5 min
    return () => clearInterval(intervalId);
  }, [startDate,endDate]);

  // Handle page change
  const handleChangePage = (event, value) => {
    setPage(value);
  };

  // Apply station and error code filter to data
  const filteredData = useMemo(()=> {
    return dataBase 
    .filter( // First remove stations not in filter (or allow all if no filter set)
      station => stationFilter.length === 0 || stationFilter.includes(station[0][0])
    )
    .map(station => {// within selected stations filter out errors
      const filteredCodes = station.slice(1).filter(
        code => errorCodeFilter.length === 0 || errorCodeFilter.includes(code[0])
      );
      return [station[0], ...filteredCodes];
    }) // Last removes stations with no errors left after filtering
    .filter(station => station.length > 1)// Sort by station name to prevent table shuffling
    .sort(
      (a,b)=> {
        const compare = String(a[0]).localeCompare(String(b[0]), undefined, { numeric: true, sensitivity: 'base' });
        return sortAsc ? compare : -compare;
      }
    ); 
  },[dataBase, stationFilter, errorCodeFilter, sortAsc]);

  // Paginate the filtered data
  const paginatedData = useMemo(() => {
    return filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [filteredData, page, itemsPerPage]);

  return (
    <Box p={1}>
      {/* Page Header */}
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          SNFN Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time Error Code Tracking
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {/* Date Filters */}
        <Box>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(normalizeStart(date))}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start Date"
            dateFormat="yyyy-MM-dd"
            isClearable
            maxDate={new Date()}
          />
          <br></br>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(normalizeEnd(date))}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="End Date"
            dateFormat="yyyy-MM-dd"
            isClearable
            maxDate={new Date()}
          />
        </Box>
        {/* Multi-select station filter */}
        <FormControl sx={{ minWidth: 200 }} size='small'>
        <InputLabel sx={{ fontSize: 14 }}>Stations</InputLabel>
            <Select
                multiple
                value={stationFilter}
                onChange={(e) => {
                const value = e.target.value;
                if (value.includes('__CLEAR__')) {
                    setStationFilter([]);
                } else {
                    setStationFilter(value);
                }
                }}
                input={<OutlinedInput label="Stations" />}
                renderValue={(selected) => selected.join(', ')}
            >
                <MenuItem value="__CLEAR__">
                <em>Clear All</em>
                </MenuItem>
                {allStationsCodes.map((code) => (
                <MenuItem key={code} value={code}>
                    <Checkbox checked={stationFilter.includes(code)} />
                    <ListItemText primary={code} />
                </MenuItem>
                ))}
            </Select>
        </FormControl>
        {/* Multi-select error code filter */}
        <FormControl sx={{ minWidth: 200 }} size='small'>
        <InputLabel sx={{ fontSize: 14 }}>Error Codes</InputLabel>
            <Select
                multiple
                value={errorCodeFilter}
                onChange={(e) => {
                const value = e.target.value;
                if (value.includes('__CLEAR__')) {
                    setErrorCodeFilter([]);
                } else {
                    setErrorCodeFilter(value);
                }
                }}
                input={<OutlinedInput label="Error Codes" />}
                renderValue={(selected) => selected.join(', ')}
            >
                <MenuItem value="__CLEAR__">
                <em>Clear All</em>
                </MenuItem>
                {allErrorCodes.map((code) => (
                <MenuItem key={code} value={code}>
                    <Checkbox checked={errorCodeFilter.includes(code)} />
                    <ListItemText primary={code} />
                </MenuItem>
                ))}
            </Select>
        </FormControl>


        {/* Fields to set tables per page and error codes per table */}
        <TextField size='small' type='number' label='# Tables'
            slotProps={{
                input: {min: 1, max:100 },
                htmlInput: { min: 1, max: 100},
            }} 
            defaultValue={itemsPerPage} onChange={(e) => {
                const value = Number(e.target.value);
                if (!isNaN(value) && value > 0) {
                setItemsPer(value);
                }
            }}/>
        <TextField size='small' type='number' label='# Error Codes' 
            slotProps={{
                input: {min: 1, max:100 },
                htmlInput: { min: 1, max: 100},
            }} 
            defaultValue={maxErrorCodes} onChange={(e) => {
                const value = Number(e.target.value);
                if (!isNaN(value) && value > 0) {
                setMaxErrors(value);
                }
            }}/>
        <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Sort Toggle Asc/Dsc */}
            <Button
              variant="outlined"
              sx={{ fontSize: 14 }}
              onClick={() => setSortAsc(prev => !prev)}
            >
              Sort: {sortAsc ? 'A → Z' : 'Z → A'}
            </Button>
            {/* Reset Filters */}
            <Button variant='outlined' sx={{ fontSize: 14 }} onClick={clearFilters}>Reset Filters</Button>
            {/* Exports */}
            <Button
                id="export-button"
                aria-controls={Boolean(anchorEl) ? 'export-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorEl)}
                onClick={handleMenuOpen}
                >
                Export
            </Button>
            {/* Exports Menu */}
            <Menu
                id="export-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                MenuListProps={{
                    'aria-labelledby': 'export-button',
                }}
                >
                <MenuItem onClick={handleExportCSV}>Export CSV</MenuItem>
                <MenuItem onClick={handleExportJSON}>Export JSON</MenuItem>
            </Menu>
        </Box>
      </Box>

      {/* Error code table for each station */}
      <Box sx={tableStyle}>
        {paginatedData.map((station, idx) => (
          <Paper key={station[0]} sx={{ p: 2 }}>
            <table>
              <thead>
                <tr
                title={`Station: "${station[0][1]}" — ${(station?.length??0)-1} unique error codes`}>
                  <th style={style}>Station {station[0][0]}</th>
                  <th style={style}>Count of Error Codes</th>
                </tr>
              </thead>
              <tbody>
                {station.slice(1, maxErrorCodes+1).map((codes, jdx) => (
                  <tr key={jdx} 
                  onClick={() => getClick([station, codes])}
                  title={`Error ${codes[0]} — ${codeDB.find((x) => x[0] === codes[0])[1] || ["NAN"]}`}>
                    <td style={style}>{codes[0]}</td>
                    <td style={style}>{codes[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        ))}
      </Box>

      {/* Pagination Controls */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={Math.ceil(filteredData.length / itemsPerPage)}
          page={page}
          onChange={handleChangePage}
          color="primary"
        />
      </Box>

      {/* Modal with detailed info */}
      {open && <ModalContent />}
    </Box>
  );
};

export default SnFnPage;
