// Import required dependencies and components
import { useEffect, useState, useMemo} from 'react';
import {
  Box, Paper, Typography, Modal, Pagination, Select, MenuItem, InputLabel, FormControl, OutlinedInput, Checkbox, ListItemText, TextField, Button, Menu,
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTheme } from '@mui/material';
import { exportSecureCSV, jsonExport } from '../../utils/exportUtils';
import { importQuery } from '../../utils/queryUtils';
import { sanitizeText } from '../../utils/textUtils.js';
import { MultiMenu } from '../pagecomp/MultiMenu.jsx';
import { MultiFilter } from '../pagecomp/MultiFilter.jsx';
import { DataTable } from '../pagecomp/snfn/DataTable.jsx';
import { useCallback } from 'react';


// Check for environment variable for API base
const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

// Page Details
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
  const [exportCooldown,setExportCooldown] = useState(false);

  // Data consts
  const [dataBase, setData] = useState([]); // Database of pulled data on staions and error codes
  const [errorCodeFilter, setErrorCodeFilter] = useState([]); // Array holding codes to filter for
  const [allErrorCodes, setAllErrorCodes] = useState([]); // Array holding error codes for filter list
  const [allCodeDesc, setCodeDesc] = useState([]); // Placeholder incase we need to read in desc vs static table
  const codeDescMap = useMemo(() => new Map(allCodeDesc), [allCodeDesc]);
  const [stationFilter, setStationFilter] = useState([]); // Array holding stations to filter for
  const [allStationsCodes, setAllStations] = useState([]); // Array holding stations for filter list
  const [modelFilter, setModelFilter] = useState([]); // 
  const [allModels, setAllModels] = useState([]); // 
  const [searchStations, setSearchStations] = useState('');
  const [searchErrorCodes, setSearchErrorCodes] = useState('');
  const [searchModels, setSearchModels] = useState('');

  // UI consts
  const [itemsPerPage,setItemsPer] = useState(6); // Number of stations per page
  const [maxErrorCodes,setMaxErrors] = useState(5); // Number of error codes per station table
  const [sortAsc, setSortAsc] = useState(true); // true = ascending, false = descending
  const [sortByCount, setByCount] = useState(false); // sort by EC count or station ID
  const [groupByWorkstation, setGroupByWorkstation] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const sortMenuOpen = useCallback(e => setSortAnchorEl(e.currentTarget), []);
  const sortMenuClose = useCallback(() => setSortAnchorEl(null), []);
  const openExport = useCallback(e => setExportAnchor(e.currentTarget),[]);
  const closeExport = useCallback(() => setExportAnchor(null),[]);
  const toggleGroup = useCallback(() => setGroupByWorkstation(x => !x),[])
  const toggleAsc = useCallback(() => setSortAsc(x => !x),[])
  const toggleByCount = useCallback(() => setByCount(x => !x),[])
  const onStationChange = useCallback(e => {
    const v = e.target.value;
    if (v.includes('__CLEAR__')) setStationFilter([]);
    else setStationFilter(v);
  }, []);
  const onSearchStations = useCallback(e => {
    setSearchStations(e.target.value);
  }, []);
  const onErrorCodeChange = useCallback(e => {
    const v = e.target.value;
    if (v.includes('__CLEAR__')) setErrorCodeFilter([]);
    else setErrorCodeFilter(v);
  }, []);
  const onSearchErrorCodes = useCallback(e => {
    setSearchErrorCodes(e.target.value);
  }, []);
  const onModelChange = useCallback(e => {
    const v = e.target.value;
    if (v.includes('__CLEAR__')) setModelFilter([]);
    else setModelFilter(v);
  }, []);
  const onSearchModels = useCallback(e => {
    setSearchModels(e.target.value);
  }, []);
  const filters = [
    [
      groupByWorkstation ? 'Workstations' : 'Fixtures',
      allStationsCodes,
      stationFilter,
      onStationChange,
      searchStations,
      onSearchStations
    ],
    [
      'Error Codes',
      allErrorCodes,
      errorCodeFilter,
      onErrorCodeChange,
      searchErrorCodes,
      onSearchErrorCodes
    ],
    [
      'Models',
      allModels,
      modelFilter,
      onModelChange,
      searchModels,
      onSearchModels
    ]
  ];
  const sortOptions = [
    [toggleGroup,(groupByWorkstation ? 'Workstation' : 'Fixture')],
    [toggleAsc,(sortAsc ? 'Asc' : 'Dec')],
    [toggleByCount,(sortByCount ? 'Count' : 'Station')]
  ];
  const exportOptions = [
    [handleExportCSV,"Export CSV"],
    [handleExportJSON,"Export Json"]
  ];
  const scrollThreshold = 5;
  const autoRefreshInterval = 300000; // in ms, 5 min

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
    //const codeDisc = (codeDB.find((x) => x[0] === codeData[0]) || [null, "NAN"])[1];
    const codeDisc = allCodeDesc.find((x) => x[0] === stationData[0][0]+codeData[0])?.[1] ?? "NAN";
    return (
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        >
        <Box sx={modalStyle}>
            <Typography id="modal-title" variant="h5">
              {groupByWorkstation ? `Workstation ${stationData?.[0][1]}` : `Fixture ${stationData?.[0][0]}`}
            </Typography>
            <Typography id="modal-sub-title" variant="h7">
              {groupByWorkstation ? `Fixture "${stationData?.[0][0]}"` : `Workstation "${stationData?.[0][1]}"`}
            </Typography>
            <Typography id="modal-desc-summary" variant="body1">
            Error Code: {codeData?.[0]} — {codeData?.[2]?.length ?? 0} serial numbers
            </Typography>
            <Box sx={{ 
              maxHeight: 200, // adjust as needed
              overflowY: 'auto',
              mt: 2,
              pr: 1 // optional: avoid scrollbar overlap
              }}>
              <Typography id="modal-desc-detail" variant="body2">
              Error Description: {sanitizeText(codeDisc)}
              </Typography>
            </Box>
           <Box sx={{ 
              maxHeight: 300, // adjust as needed
              overflowY: codeData[2].length > scrollThreshold ? 'auto' : 'visible',
              mt: 2,
              pr: 1 // optional: avoid scrollbar overlap
            }}>
              {codeData[2].map(([sn, pn], idx) => (
                <Box key={sn} mb={1}>
                  <strong>SN:</strong> {sn}<br />
                  - {pn}
                </Box>
              ))}
            </Box>
        </Box>
      </Modal>
    );
  };

  // Reset Filters to default
  const clearFilters = () => {
    const newStart = new Date();
    newStart.setDate(newStart.getDate() - 7);
    setStartDate(normalizeStart(newStart));
    setEndDate(normalizeEnd(new Date()));
    setErrorCodeFilter([]);
    setStationFilter([]);
    setModelFilter([]);
    setPage(1);
  };

  // Get current time stamp for exporting
  const getTimestamp = () => {
    const now = new Date();
    return now.toISOString().replace(/:/g, '-').replace(/\..+/, '');
  };
  
  // Exporting
  const exportToCSV = () => {
    try {
      const rows = [];
      filteredData.forEach((station) => {
          const stationId = station[0][0];
          const stationSecondaryId = station[0][1];
          station.slice(1).forEach(([errorCode, count, snList]) => {
          snList.forEach((sn) => {
              rows.push([`'${stationId}'`,`'${stationSecondaryId}'`, errorCode, count, sn[0],sn[1],sn[2]]);
          });
          });
      });
      const headers = [
        groupByWorkstation ? 'Workstation' : 'Fixture',
        groupByWorkstation ? 'Fixture' : 'Workstation',
        'Error Code',
        'Error Count',
        'Serial Number',
        'Part Number',
        'Model'
      ];
      const filename = `snfn_filtered_data_${getTimestamp()}.csv`;
      // Use secure export function
      exportSecureCSV(rows, headers, filename);
    } 
    catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    };
  };
  const exportToJSON = () => {
    try{
      const jsonData = [];
      filteredData.forEach((station) => {
          const stationId = station[0];
          const errors = station.slice(1).map(([errorCode, count, snList]) => ({
          errorCode,
          count,
          serialNumbers: snList,
          }));
          jsonData.push({
            [groupByWorkstation ? 'workstation' : 'fixture']: stationId,
            errors
          });
      });
      const filename = `snfn_filtered_data_${getTimestamp()}.json`
      jsonExport(jsonData,null,2,filename);
    } 
    catch(error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    };
  };
  // Export handlers
  const handleExportCSV = () => {
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
  };
  const handleExportJSON = () => {
    if (exportCooldown) return;
    setExportCooldown(true);
    setTimeout(()=>setExportCooldown(false),3000);
    exportToJSON();
    handleMenuClose();
  };

  // Fetch and process data initially and every 5 minutes
  useEffect(() => {
    const fetchAndSortData = async () => {
      //const dataSet = testSnFnData; // Placeholder data
      let dataSet = [];
      try {
        dataSet = await importQuery(API_BASE,'/api/snfn/station-errors?',{
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
      } catch (err) {
        console.error('Failed to fetch SNFN data:', err);
        return; // exit the function early or set fallback data
      }
      // consts for data and sets
      const data = [];
      const codeSet = new Set();
      const stationSet = new Set();
      const modelSet = new Set();
      const discMap = new Map();

      if (!Array.isArray(dataSet)){
        console.error('API response is not an array: ', dataSet);
        return;
      }

      dataSet.forEach((d) => {
        const {
          fixture_no: FN,
          sn: SN,
          error_code: EC,
          code_count: TN,
          pn: PN,
          workstation_name: BT,
          normalized_end_time: DT,
          model:MD,
          error_disc:ED
        } = d;
        // Validate date range
        const recordDate = new Date(DT);
        if (isNaN(recordDate) || recordDate < startDate || recordDate > endDate) {return;}

        if (TN == 0) return; // Skip if count is zero

        const groupKey = groupByWorkstation ? BT : FN;
        const secondaryLabel = groupByWorkstation ? FN : BT; // For tooltips and UI clarity
        const idx = data.findIndex((x) => x[0][0] === groupKey);

        codeSet.add(EC); // Collect unique error codes
        stationSet.add(groupKey); //Collect unique Fixtures/Workstation 
        if(MD)modelSet.add(MD); // Collect unique models

        const dKey = groupKey+EC;
        if (!discMap.has(dKey)) {
          discMap.set(dKey, new Set());
        }
        discMap.get(dKey).add(ED);

        
        if (idx === -1) {
            // New station entry  [[FN,BT], [EC, Number(TN), [[SN,PN]]]
            data.push([[groupKey, secondaryLabel], [EC, Number(TN), [[SN, PN, MD]]]]);
        } else {
            // Update existing station entry
            const jdx = data[idx].findIndex((x)=>x[0]===EC);
            if(jdx === -1){ // New error code
                data[idx].push([EC, Number(TN), [[SN,PN, MD]]]);
            }else{ // Update existing error code
                const serials = data[idx][jdx][2]; // Array of SNs
                if (!serials.some(([a,b,c]) => a === SN && b === PN && c === MD)) {
                  serials.push([SN,PN,MD]);
                }
                data[idx][jdx][1] += Number(TN); // currently still counts duplicate ec sn to tn
            }
        }
      });

      // Sort error codes for each station by count (descending)
      data.forEach((group) => {
        group.splice(1, group.length - 1, ...group.slice(1).sort((a, b) => b[1] - a[1]));
      });

      // Populate filter list
      setAllErrorCodes(Array.from(codeSet).sort());
      setAllStations(Array.from(stationSet).sort());
      setAllModels(Array.from(modelSet).sort());

      const combinedCodeDesc = Array.from(discMap.entries()).map(([code, descSet]) => [
        code,
        Array.from(descSet).join('\n '), // join multiple descriptions with semicolon or linebreak
      ]);
      setCodeDesc(combinedCodeDesc.sort());

      setData([...data]);
    };

    if (document.visibilityState === 'visible'){fetchAndSortData();}
    
    const intervalId = setInterval(() => fetchAndSortData(), autoRefreshInterval); // Refresh every 5 min

    return () => clearInterval(intervalId);
  }, [startDate,endDate, groupByWorkstation]);
 
  // Reset station Filter on togle
  useEffect(() => {
    setStationFilter([]); // Reset station filter on toggle
  }, [groupByWorkstation]);
  
  // Handle page change
  const handleChangePage = (event, value) => {
    setPage(value);
  };

  // Apply station and error code filter to data
  const filteredData = useMemo(() => {
  return dataBase
    .filter(
      station => stationFilter.length === 0 || stationFilter.includes(station[0][0])
    )
    .map(station => {
      const filteredCodes = station.slice(1)
        .map(([code, count, snList]) => {
          const filteredSNs = snList.filter(([sn, pn, md]) =>
            modelFilter.length === 0 || modelFilter.includes(md??'')
          );
          return [code, filteredSNs.length, filteredSNs];
        })
        .filter(([code, count]) =>
          (errorCodeFilter.length === 0 || errorCodeFilter.includes(code)) &&
          count > 0
        );

      return filteredCodes.length > 0 ? [station[0], ...filteredCodes] : null;
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (sortByCount) {
        const totalA = a.slice(1).reduce((sum, [_, count]) => sum + count, 0);
        const totalB = b.slice(1).reduce((sum, [_, count]) => sum + count, 0);
        return sortAsc ? totalA - totalB : totalB - totalA;
      } else {
        const compare = String(a[0][0]).localeCompare(String(b[0][0]), undefined, { numeric: true, sensitivity: 'base' });
        return sortAsc ? compare : -compare;
      }
    });
}, [dataBase, stationFilter, errorCodeFilter, modelFilter, sortAsc, sortByCount]);

  // Paginate the filtered data
  const paginatedData = useMemo(() => {
    return filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [filteredData, page, itemsPerPage]);

  // UI
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
      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          gap: 2,
          mb: 2,
          p: 1
        }}
      >
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
        {/* Filters on Fixtures/ErrorCodes/Models */}
        <MultiFilter
          filters={filters}
          limit={0}            // show all
          searchThreshold={10} // show search when >10 options
        />
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
        {/* Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Sort Menu Button*/}
            <Button
              variant="outlined"
              sx={{ fontSize: 14 }}
              onClick={sortMenuOpen}
            >
              Sort Options
            </Button>
            {/* Reset Filters */}
            <Button variant='outlined' sx={{ fontSize: 14 }} onClick={clearFilters}>Reset Filters</Button>
            {/* Exports */}
            <Button
              variant='outlined'
              id="export-button"
              aria-controls={Boolean(exportAnchor) ? 'export-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(exportAnchor)}
              onClick={openExport}
              disabled={exportCooldown}
              >
              Export
            </Button>
            {/* Exports Menu */}
            <MultiMenu
              anchorEl={exportAnchor}
              open={Boolean(exportAnchor)}
              onClose={closeExport}
              buttonData={exportOptions}
              disabled={exportCooldown}
            />
            {/* Sort Menu */}
            <MultiMenu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={sortMenuClose}
              buttonData={sortOptions}
            />
        </Box>
      </Box>

      {/* Error code table for each station */}
      <DataTable
        paginatedData={paginatedData}
        maxErrorCodes={maxErrorCodes}
        codeDescMap={codeDescMap}
        onRowClick={getClick}
        groupByWorkstation={groupByWorkstation}
        style={style}
      />


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
