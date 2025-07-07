import React, { useEffect, useState } from 'react';
import {
  Tooltip,
  IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { toUTCDateString, createUTCDate } from '../../utils/dateUtils';
import { useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

const sxm4Parts = [
  '692-2G506-0200-006',
  '692-2G506-0200-0R6',
  '692-2G506-0210-006',
  '692-2G506-0212-0R5',
  '692-2G506-0212-0R7',
  '692-2G506-0210-0R6',
  '692-2G510-0200-0R0',
  '692-2G510-0210-003',
  '692-2G510-0210-0R2',
  '692-2G510-0210-0R3',
  '965-2G506-0031-2R0',
  '965-2G506-0130-202',
  '965-2G506-6331-200',
];

const sxm5Parts = [
  '692-2G520-0200-000',
  '692-2G520-0200-0R0',
  '692-2G520-0200-500',
  '692-2G520-0200-5R0',
  '692-2G520-0202-0R0',
  '692-2G520-0280-001',
  '692-2G520-0280-0R0',
  '692-2G520-0280-000',
  '692-2G520-0280-0R1',
  '692-2G520-0282-001',
  '965-2G520-0041-000',
  '965-2G520-0100-001',
  '965-2G520-0100-0R0',
  '965-2G520-0340-0R0',
  '965-2G520-0900-000',
  '965-2G520-0900-001',
  '965-2G520-0900-0R0',
  '965-2G520-6300-0R0',
  '965-2G520-A500-000',
  '965-2G520-A510-300',
  '692-2G520-0221-5R0',
];

const redOctoberParts = [
  '920-23487-2530-0R0',
  '920-23487-2531-0R0',
];

const allParts = [...sxm4Parts, ...sxm5Parts, ...redOctoberParts];

const PackingPage = () => {
  const [packingData, setPackingData] = useState({});
  const [dates, setDates] = useState([]);
  const [sortData, setSortData] = useState({ '506': {}, '520': {} });
  const [copied, setCopied] = useState({ group: '', date: '' });
  const [lastUpdated, setLastUpdated] = useState(null);

  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch real data
    const fetchPackingData = () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const url = new URL(`${API_BASE}/api/packing/packing-records`);
      url.searchParams.append('startDate', startDate.toISOString());
      url.searchParams.append('endDate', endDate.toISOString());
      
      fetch(url.toString())
        .then(res => res.json())
        .then(data => {
          console.log('Raw backend data:', data); // Debug log
          const rolledUpData = {};
          const allDatesSet = new Set();
          Object.entries(data).forEach(([part, dateObj]) => {
            rolledUpData[part] = {};
            Object.entries(dateObj).forEach(([dateStr, count]) => {
              const [month, day, year] = dateStr.split('/');
              const dateObjJS = createUTCDate(year, month, day);
              let rollupDate = toUTCDateString(dateObjJS);
              const dayOfWeek = dateObjJS.getUTCDay();
              if (dayOfWeek === 6) {
                const friday = new Date(dateObjJS);
                friday.setUTCDate(friday.getUTCDate() - 1);
                rollupDate = toUTCDateString(friday);
              } else if (dayOfWeek === 0) {
                const friday = new Date(dateObjJS);
                friday.setUTCDate(friday.getUTCDate() - 2);
                rollupDate = toUTCDateString(friday);
              }
              if (!rolledUpData[part][rollupDate]) rolledUpData[part][rollupDate] = 0;
              rolledUpData[part][rollupDate] += count;
              allDatesSet.add(rollupDate);
            });
          });
          
          let sortedDates = Array.from(allDatesSet).sort((a, b) => {
            const [am, ad, ay] = a.split('/');
            const [bm, bd, by] = b.split('/');
            return createUTCDate(ay, am, ad) - createUTCDate(by, bm, bd);
          });
          
          console.log('Processed packing data:', rolledUpData); // Debug log
          console.log('Sorted dates:', sortedDates); // Debug log
          
          setPackingData(rolledUpData);
          setDates(sortedDates);
          setLastUpdated(new Date());
        })
        .catch(error => {
          console.error('Error fetching packing data:', error);
        });
    };

    // Fetch sort data
    const fetchSortData = () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const url = new URL(`${API_BASE}/api/sort-record/sort-data`);
      url.searchParams.append('startDate', startDate.toISOString());
      url.searchParams.append('endDate', endDate.toISOString());
      
      
      fetch(url.toString())
        .then(res => res.json())
        .then(data => {
          console.log('Received sort data:', data); // Debug log
          // Initialize sort data structure
          const processedSortData = { '506': {}, '520': {} };
          
          // Process the data for each sort code
          Object.entries(data).forEach(([sortCode, dateObj]) => {
            if (sortCode === '506' || sortCode === '520') {
              Object.entries(dateObj).forEach(([dateStr, count]) => {
                const [month, day, year] = dateStr.split('/');
                const dateObjJS = createUTCDate(year, month, day);
                let rollupDate = toUTCDateString(dateObjJS);
                const dayOfWeek = dateObjJS.getUTCDay();
                
                // Roll up weekend data to Friday
                if (dayOfWeek === 6) {
                  const friday = new Date(dateObjJS);
                  friday.setUTCDate(friday.getUTCDate() - 1);
                  rollupDate = toUTCDateString(friday);
                } else if (dayOfWeek === 0) {
                  const friday = new Date(dateObjJS);
                  friday.setUTCDate(friday.getUTCDate() - 2);
                  rollupDate = toUTCDateString(friday);
                }
                
                if (!processedSortData[sortCode][rollupDate]) {
                  processedSortData[sortCode][rollupDate] = 0;
                }
                processedSortData[sortCode][rollupDate] += count;
              });
            }
          });
          
          console.log('Processed sort data:', processedSortData); // Debug log
          setSortData(processedSortData);
        })
        .catch(error => {
          console.error('Error fetching sort data:', error);
        });
    };

    // Initial data fetch
    fetchPackingData();
    fetchSortData();

    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchPackingData();
      fetchSortData();
    }, 300000); // 5 minutes

    // Cleanup
    return () => clearInterval(intervalId);
  }, []);

  // Copy column functionality - copies data in Excel-pasteable format
  const handleCopyColumn = (group, date) => {
    let values = '';
    
    if (group === 'SXM4') {
      values = sxm4Parts.map(part => packingData[part]?.[date] || '').join('\n');
    } else if (group === 'SXM5') {
      values = sxm5Parts.map(part => packingData[part]?.[date] || '').join('\n');
    } else if (group === 'RED OCTOBER') {
      values = redOctoberParts.map(part => packingData[part]?.[date] || '').join('\n');
    } else if (group === 'DAILY TOTAL') {
      // Calculate and copy the daily total for this date
      const sxm4Total = sxm4Parts.reduce((sum, part) => sum + (packingData[part]?.[date] || 0), 0);
      const sxm5Total = sxm5Parts.reduce((sum, part) => sum + (packingData[part]?.[date] || 0), 0);
      const redOctoberTotal = redOctoberParts.reduce((sum, part) => sum + (packingData[part]?.[date] || 0), 0);
      const dailyTotal = sxm4Total + sxm5Total + redOctoberTotal;
      values = dailyTotal.toString();
    } else if (group === 'SORT') {
      values = ['506', '520'].map(model => sortData[model]?.[date] || '').join('\n');
    }
    
    navigator.clipboard.writeText(values).then(() => {
      setCopied({ group, date });
      setTimeout(() => setCopied({ group: '', date: '' }), 1200);
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        marginBottom: '20px' 
      }}>
        <h1 style={{ margin: 0 }}>Packing Output</h1>
        <button
          style={{
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 18px',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
          }}
          onClick={() => navigate('/packing-charts')}
        >
          Packing Charts
        </button>
        {lastUpdated && (
          <div style={{ 
            fontSize: '14px', 
            color: '#666',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            marginLeft: 'auto'
          }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
      
      <table style={{
        borderCollapse: 'separate',
        borderSpacing: '0',
        fontSize: '14px',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        border: '1px solid #ccc',
        tableLayout: 'fixed'
      }}>
        
                 <tbody>
           {/* Tesla SXM4 Section Header */}
           <tr style={{ backgroundColor: '#1a237e' }}>
             <td style={{
               border: '1px solid #ddd',
               padding: '10px 8px',
               fontWeight: 'bold',
               backgroundColor: '#1a237e',
               color: 'white',
               position: 'sticky',
               left: 0,
               zIndex: 5,
               boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
               fontSize: '14px'
             }}>
               TESLA SXM4
             </td>
             {dates.map(date => (
               <td key={date} style={{
                 border: '1px solid #ddd',
                 padding: '10px 8px',
                 backgroundColor: '#1a237e',
                 color: 'white',
                 textAlign: 'center',
                 fontWeight: 'bold',
                 fontSize: '13px'
               }}>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                   <span>{date}</span>
                   <Tooltip title={copied.group === 'SXM4' && copied.date === date ? 'Copied!' : 'Copy column'}>
                     <IconButton
                       size="small"
                       onClick={() => handleCopyColumn('SXM4', date)}
                       sx={{ 
                         padding: 0,
                         height: '14px',
                         width: '14px',
                         minWidth: '14px',
                         color: copied.group === 'SXM4' && copied.date === date ? 'success.main' : 'white'
                       }}
                     >
                       {copied.group === 'SXM4' && copied.date === date ? 
                         <CheckIcon sx={{ fontSize: '10px' }} /> : 
                         <ContentCopyIcon sx={{ fontSize: '10px' }} />
                       }
                     </IconButton>
                   </Tooltip>
                 </div>
               </td>
             ))}
           </tr>

                      {/* SXM4 Parts */}
           {sxm4Parts.map((part, idx) => (
             <tr key={part} style={{

               backgroundColor: idx % 2 === 0 ? theme.palette.background.default : theme.palette.background.paper

             }}>
               <td style={{
                 border: '1px solid #ddd',
                 padding: '10px 8px',
                 fontFamily: 'Monaco, Consolas, "Courier New", monospace',

                 backgroundColor: idx % 2 === 0 ? theme.palette.background.default : theme.palette.background.paper,

                 position: 'sticky',
                 left: 0,
                 zIndex: 5,
                 boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                 fontSize: '13px',
                 whiteSpace: 'nowrap',
                 overflow: 'hidden',
                 textOverflow: 'ellipsis'
               }}>
                 {part}
               </td>
               {dates.map(date => (
                 <td key={date} style={{
                   border: '1px solid #ddd',
                   padding: '10px 8px',
                   textAlign: 'center',
                   fontSize: '13px'
                 }}>
                   {packingData[part]?.[date] || ''}
                 </td>
               ))}
             </tr>
           ))}

           {/* SXM4 Total Row */}
           <tr style={{ backgroundColor: '#c8e6c9' }}>
             <td style={{
               border: '1px solid #ddd',
               padding: '10px 8px',
               fontWeight: 'bold',
               backgroundColor: '#c8e6c9',
               position: 'sticky',
               left: 0,
               zIndex: 5,
               boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
               fontSize: '14px',
               color: '#2e7d32'
             }}>
               TESLA SXM4 Total
             </td>
             {dates.map(date => {
               const total = sxm4Parts.reduce((sum, part) => 
                 sum + (packingData[part]?.[date] || 0), 0
               );
               return (
                 <td key={date} style={{
                   border: '1px solid #ddd',
                   padding: '10px 8px',
                   backgroundColor: '#c8e6c9',
                   textAlign: 'center',
                   fontWeight: 'bold',
                   fontSize: '13px',
                   color: '#2e7d32'
                 }}>
                   {total || ''}
                 </td>
               );
             })}
           </tr>

           {/* Spacer Row */}
           <tr>
             <td style={{
               height: '20px',
               border: '1px solid #ddd',
               backgroundColor: '#fff',
               position: 'sticky',
               left: 0,
               zIndex: 5,
               boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
             }}></td>
             {dates.map((_, idx) => (
               <td key={idx} style={{
                 height: '20px',
                 border: '1px solid #ddd',
                 backgroundColor: '#fff'
               }}></td>
             ))}
           </tr>

           {/* Tesla SXM5 Section Header */}
           <tr style={{ backgroundColor: '#1a237e' }}>
             <td style={{
               border: '1px solid #ddd',
               padding: '10px 8px',
               fontWeight: 'bold',
               backgroundColor: '#1a237e',
               color: 'white',
               position: 'sticky',
               left: 0,
               zIndex: 5,
               boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
               fontSize: '14px'
             }}>
               TESLA SXM5
             </td>
             {dates.map(date => (
               <td key={date} style={{
                 border: '1px solid #ddd',
                 padding: '10px 8px',
                 backgroundColor: '#1a237e',
                 color: 'white',
                 textAlign: 'center',
                 fontWeight: 'bold',
                 fontSize: '13px'
               }}>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                   <span>{date}</span>
                   <Tooltip title={copied.group === 'SXM5' && copied.date === date ? 'Copied!' : 'Copy column'}>
                     <IconButton
                       size="small"
                       onClick={() => handleCopyColumn('SXM5', date)}
                       sx={{ 
                         padding: 0,
                         height: '14px',
                         width: '14px',
                         minWidth: '14px',
                         color: copied.group === 'SXM5' && copied.date === date ? 'success.main' : 'white'
                       }}
                     >
                       {copied.group === 'SXM5' && copied.date === date ? 
                         <CheckIcon sx={{ fontSize: '10px' }} /> : 
                         <ContentCopyIcon sx={{ fontSize: '10px' }} />
                       }
                     </IconButton>
                   </Tooltip>
                 </div>
               </td>
             ))}
           </tr>

           {/* SXM5 Parts */}
           {sxm5Parts.map((part, idx) => (
             <tr key={part} style={{

               backgroundColor: idx % 2 === 0 ? theme.palette.background.default : theme.palette.background.paper

             }}>
               <td style={{
                 border: '1px solid #ddd',
                 padding: '10px 8px',
                 fontFamily: 'Monaco, Consolas, "Courier New", monospace',

                 backgroundColor: idx % 2 === 0 ? theme.palette.background.default : theme.palette.background.paper,

                 position: 'sticky',
                 left: 0,
                 zIndex: 5,
                 boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                 fontSize: '13px',
                 whiteSpace: 'nowrap',
                 overflow: 'hidden',
                 textOverflow: 'ellipsis'
               }}>
                 {part}
               </td>
               {dates.map(date => (
                 <td key={date} style={{
                   border: '1px solid #ddd',
                   padding: '10px 8px',
                   textAlign: 'center',
                   fontSize: '13px'
                 }}>
                   {packingData[part]?.[date] || ''}
                                  </td>
               ))}
             </tr>
           ))}

           {/* SXM5 Total Row */}
           <tr style={{ backgroundColor: '#c8e6c9' }}>
             <td style={{
               border: '1px solid #ddd',
               padding: '10px 8px',
               fontWeight: 'bold',
               backgroundColor: '#c8e6c9',
               position: 'sticky',
               left: 0,
               zIndex: 5,
               boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
               fontSize: '14px',
               color: '#2e7d32'
             }}>
               TESLA SXM5 Total
             </td>
             {dates.map(date => {
               const total = sxm5Parts.reduce((sum, part) => 
                 sum + (packingData[part]?.[date] || 0), 0
               );
               return (
                 <td key={date} style={{
                   border: '1px solid #ddd',
                   padding: '10px 8px',
                   backgroundColor: '#c8e6c9',
                   textAlign: 'center',
                   fontWeight: 'bold',
                   fontSize: '13px',
                   color: '#2e7d32'
                 }}>
                   {total || ''}
                 </td>
               );
             })}
           </tr>

           {/* Spacer Row */}
           <tr>
             <td style={{
               height: '20px',
               border: '1px solid #ddd',
               backgroundColor: '#fff',
               position: 'sticky',
               left: 0,
               zIndex: 5,
               boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
             }}></td>
             {dates.map((_, idx) => (
               <td key={idx} style={{
                 height: '20px',
                 border: '1px solid #ddd',
                 backgroundColor: '#fff'
               }}></td>
             ))}
           </tr>

           {/* Red October Section Header */}
           <tr style={{ backgroundColor: '#1a237e' }}>
             <td style={{
               border: '1px solid #ddd',
               padding: '10px 8px',
               fontWeight: 'bold',
               backgroundColor: '#1a237e',
               color: 'white',
               position: 'sticky',
               left: 0,
               zIndex: 5,
               boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
               fontSize: '14px'
             }}>
               RED OCTOBER
             </td>
             {dates.map(date => (
               <td key={date} style={{
                 border: '1px solid #ddd',
                 padding: '10px 8px',
                 backgroundColor: '#1a237e',
                 color: 'white',
                 textAlign: 'center',
                 fontWeight: 'bold',
                 fontSize: '13px'
               }}>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                   <span>{date}</span>
                   <Tooltip title={copied.group === 'RED OCTOBER' && copied.date === date ? 'Copied!' : 'Copy column'}>
                     <IconButton
                       size="small"
                       onClick={() => handleCopyColumn('RED OCTOBER', date)}
                       sx={{ 
                         padding: 0,
                         height: '14px',
                         width: '14px',
                         minWidth: '14px',
                         color: copied.group === 'RED OCTOBER' && copied.date === date ? 'success.main' : 'white'
                       }}
                     >
                       {copied.group === 'RED OCTOBER' && copied.date === date ? 
                         <CheckIcon sx={{ fontSize: '10px' }} /> : 
                         <ContentCopyIcon sx={{ fontSize: '10px' }} />
                       }
                     </IconButton>
                   </Tooltip>
                 </div>
               </td>
             ))}
           </tr>

           {/* Red October Parts */}
           {redOctoberParts.map((part, idx) => (
             <tr key={part} style={{

               backgroundColor: idx % 2 === 0 ? theme.palette.background.default : theme.palette.background.paper

             }}>
               <td style={{
                 border: '1px solid #ddd',
                 padding: '10px 8px',
                 fontFamily: 'Monaco, Consolas, "Courier New", monospace',

                 backgroundColor: idx % 2 === 0 ? theme.palette.background.default : theme.palette.background.paper,

                 position: 'sticky',
                 left: 0,
                 zIndex: 5,
                 boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                 fontSize: '13px',
                 whiteSpace: 'nowrap',
                 overflow: 'hidden',
                 textOverflow: 'ellipsis'
               }}>
                 {part}
               </td>
               {dates.map(date => (
                 <td key={date} style={{
                   border: '1px solid #ddd',
                   padding: '10px 8px',
                   textAlign: 'center',
                   fontSize: '13px'
                 }}>
                   {packingData[part]?.[date] || ''}
                 </td>
               ))}
             </tr>
           ))}

           {/* Red October Total Row */}
           <tr style={{ backgroundColor: '#c8e6c9' }}>
             <td style={{
               border: '1px solid #ddd',
               padding: '10px 8px',
               fontWeight: 'bold',
               backgroundColor: '#c8e6c9',
               position: 'sticky',
               left: 0,
               zIndex: 5,
               boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
               fontSize: '14px',
               color: '#2e7d32'
             }}>
               RED OCTOBER Total
             </td>
             {dates.map(date => {
               const total = redOctoberParts.reduce((sum, part) => 
                 sum + (packingData[part]?.[date] || 0), 0
               );
               return (
                 <td key={date} style={{
                   border: '1px solid #ddd',
                   padding: '10px 8px',
                   backgroundColor: '#c8e6c9',
                   textAlign: 'center',
                   fontWeight: 'bold',
                   fontSize: '13px',
                   color: '#2e7d32'
                 }}>
                   {total || ''}
                 </td>
               );
             })}
           </tr>

           {/* Spacer Row */}
           <tr>
             <td style={{
               height: '20px',
               border: '1px solid #ddd',
               backgroundColor: '#fff',
               position: 'sticky',
               left: 0,
               zIndex: 5,
               boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
             }}></td>
             {dates.map((_, idx) => (
               <td key={idx} style={{
                 height: '20px',
                 border: '1px solid #ddd',
                 backgroundColor: '#fff'
               }}></td>
             ))}
           </tr>

           {/* Daily Total Section Header */}
           <tr style={{ backgroundColor: '#1a237e' }}>
             <td style={{
               border: '1px solid #ddd',
               padding: '10px 8px',
               fontWeight: 'bold',
               backgroundColor: '#1a237e',
               color: 'white',
               position: 'sticky',
               left: 0,
               zIndex: 5,
               boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
               fontSize: '14px'
             }}>
               DAILY TOTAL
             </td>
             {dates.map(date => (
               <td key={date} style={{
                 border: '1px solid #ddd',
                 padding: '10px 8px',
                 backgroundColor: '#1a237e',
                 color: 'white',
                 textAlign: 'center',
                 fontWeight: 'bold',
                 fontSize: '13px'
               }}>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                   <span>{date}</span>
                   <Tooltip title={copied.group === 'DAILY TOTAL' && copied.date === date ? 'Copied!' : 'Copy column'}>
                     <IconButton
                       size="small"
                       onClick={() => handleCopyColumn('DAILY TOTAL', date)}
                       sx={{ 
                         padding: 0,
                         height: '14px',
                         width: '14px',
                         minWidth: '14px',
                         color: copied.group === 'DAILY TOTAL' && copied.date === date ? 'success.main' : 'white'
                       }}
                     >
                       {copied.group === 'DAILY TOTAL' && copied.date === date ? 
                         <CheckIcon sx={{ fontSize: '10px' }} /> : 
                         <ContentCopyIcon sx={{ fontSize: '10px' }} />
                       }
                     </IconButton>
                   </Tooltip>
                 </div>
               </td>
             ))}
           </tr>

           {/* Daily Total Row */}
           <tr style={{ backgroundColor: '#c8e6c9' }}>
             <td style={{
               border: '1px solid #ddd',
               padding: '10px 8px',
               fontWeight: 'bold',
               backgroundColor: '#c8e6c9',
               position: 'sticky',
               left: 0,
               zIndex: 5,
               boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
               fontSize: '14px',
               color: '#2e7d32'
             }}>
               Total Packed
             </td>
             {dates.map(date => {
               // Calculate total across all models for this date
               const sxm4Total = sxm4Parts.reduce((sum, part) => sum + (packingData[part]?.[date] || 0), 0);
               const sxm5Total = sxm5Parts.reduce((sum, part) => sum + (packingData[part]?.[date] || 0), 0);
               const redOctoberTotal = redOctoberParts.reduce((sum, part) => sum + (packingData[part]?.[date] || 0), 0);
               const dailyTotal = sxm4Total + sxm5Total + redOctoberTotal;
               
               return (
                 <td key={date} style={{
                   border: '1px solid #ddd',
                   padding: '10px 8px',
                   backgroundColor: '#c8e6c9',
                   textAlign: 'center',
                   fontWeight: 'bold',
                   fontSize: '13px',
                   color: '#2e7d32'
                 }}>
                   {dailyTotal || ''}
                 </td>
               );
             })}
           </tr>

           {/* Spacer Row */}
           <tr>
             <td style={{
               height: '20px',
               border: '1px solid #ddd',
               backgroundColor: '#fff',
               position: 'sticky',
               left: 0,
               zIndex: 5,
               boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
             }}></td>
             {dates.map((_, idx) => (
               <td key={idx} style={{
                 height: '20px',
                 border: '1px solid #ddd',
                 backgroundColor: '#fff'
               }}></td>
             ))}
           </tr>

           {/* Sort Section Header */}
           <tr style={{ backgroundColor: '#1a237e' }}>
             <td style={{
               border: '1px solid #ddd',
               padding: '10px 8px',
               fontWeight: 'bold',
               backgroundColor: '#1a237e',
               color: 'white',
               position: 'sticky',
               left: 0,
               zIndex: 5,
               boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
               fontSize: '14px'
             }}>
               SORT
             </td>
             {dates.map(date => (
               <td key={date} style={{
                 border: '1px solid #ddd',
                 padding: '10px 8px',
                 backgroundColor: '#1a237e',
                 color: 'white',
                 textAlign: 'center',
                 fontWeight: 'bold',
                 fontSize: '13px'
               }}>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                   <span>{date}</span>
                   <Tooltip title={copied.group === 'SORT' && copied.date === date ? 'Copied!' : 'Copy column'}>
                     <IconButton
                       size="small"
                       onClick={() => handleCopyColumn('SORT', date)}
                       sx={{ 
                         padding: 0,
                         height: '14px',
                         width: '14px',
                         minWidth: '14px',
                         color: copied.group === 'SORT' && copied.date === date ? 'success.main' : 'white'
                       }}
                     >
                       {copied.group === 'SORT' && copied.date === date ? 
                         <CheckIcon sx={{ fontSize: '10px' }} /> : 
                         <ContentCopyIcon sx={{ fontSize: '10px' }} />
                       }
                     </IconButton>
                   </Tooltip>
                 </div>
               </td>
             ))}
           </tr>

           {/* Sort 506 Row */}
           <tr style={{ 

            backgroundColor: theme.palette.background.paper

            }}>
             <td style={{
               border: '1px solid #ddd',
               padding: '10px 8px',
               fontFamily: 'Monaco, Consolas, "Courier New", monospace',

               backgroundColor:theme.palette.background.paper,

               position: 'sticky',
               left: 0,
               zIndex: 5,
               boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
               fontSize: '13px',
               fontWeight: 'bold'
             }}>
               506
             </td>
             {dates.map(date => (
               <td key={date} style={{
                 border: '1px solid #ddd',
                 padding: '10px 8px',
                 textAlign: 'center',
                 fontSize: '13px'
               }}>
                 {sortData['506'][date] || ''}
               </td>
             ))}
           </tr>

           {/* Sort 520 Row */}
           <tr style={{

            backgroundColor: theme.palette.background.default

            }}>
             <td style={{
               border: '1px solid #ddd',
               padding: '10px 8px',
               fontFamily: 'Monaco, Consolas, "Courier New", monospace',

               backgroundColor: theme.palette.background.default,

               position: 'sticky',
               left: 0,
               zIndex: 5,
               boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
               fontSize: '13px',
               fontWeight: 'bold'
             }}>
               520
             </td>
             {dates.map(date => (
               <td key={date} style={{
                 border: '1px solid #ddd',
                 padding: '10px 8px',
                 textAlign: 'center',
                 fontSize: '13px'
               }}>
                 {sortData['520'][date] || ''}
               </td>
             ))}
           </tr>

         </tbody>
      </table>
    </div>
  );
};

export default PackingPage; 