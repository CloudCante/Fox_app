import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Tooltip,
  IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { toUTCDateString, createUTCDate, getInitialStartDate } from '../../utils/dateUtils';
import { useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { sxm4Parts, sxm5Parts, redOctoberParts } from '../../data/dataTables';
import {PackingPageTable} from '../pagecomp/packingPage/PackingPageTable';
import { headerStyle, tableStyle, divStyle, headerStyleTwo, spacerStyle, buttonStyle, subTextStyle } from '../theme/themes';
import { usePackingData } from '../hooks/packingPage/usePackingData';
import { FixedSizeGrid as Grid } from 'react-window';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

const PackingPage = () => {

  const [copied, setCopied] = useState({ group: '', date: '' });
  
  const { packingData, dates, sortData, lastUpdated } = usePackingData(API_BASE);

  const theme = useTheme();
  const navigate = useNavigate();

  const groups = useMemo(()=>[
  { key:'SXM4', parts:sxm4Parts, label:'TESLA SXM4', totalLabel:'TESLA SXM4 Total' },
  { key:'SXM5', parts:sxm5Parts, label:'TESLA SXM5', totalLabel:'TESLA SXM5 Total' },
  { key:'RED OCTOBER', parts:redOctoberParts, label:'RED OCTOBER', totalLabel:'Red October Total' },
  ],[]);

  const handleCopyColumn = useCallback((group, date) => {
    let values = '';
    
    if (group === 'SXM4') {
      values = sxm4Parts.map(part => packingData[part]?.[date] || '').join('\n');
    } else if (group === 'SXM5') {
      values = sxm5Parts.map(part => packingData[part]?.[date] || '').join('\n');
    } else if (group === 'RED OCTOBER') {
      values = redOctoberParts.map(part => packingData[part]?.[date] || '').join('\n');
    } else if (group === 'DAILY TOTAL') {
      // Calculate and copy the daily total for this date
      //const sxm4Total = sxm4Parts.reduce((sum, part) => sum + (packingData[part]?.[date] || 0), 0);
      //const sxm5Total = sxm5Parts.reduce((sum, part) => sum + (packingData[part]?.[date] || 0), 0);
      //const redOctoberTotal = redOctoberParts.reduce((sum, part) => sum + (packingData[part]?.[date] || 0), 0);
      const dailyTotal = useMemo(() => {
        return dates.map(date => {
          const total = [...sxm4Parts, ...sxm5Parts, ...redOctoberParts]
            .reduce((sum, part) => sum + (packingData[part]?.[date] || 0), 0);
          return { date, total };
        });
      }, [dates, packingData]);
      values = dailyTotal.toString();
    } else if (group === 'SORT') {
      values = ['506', '520'].map(model => sortData[model]?.[date] || '').join('\n');
    }
    
    navigator.clipboard.writeText(values).then(() => {
      setCopied({ group, date });
      setTimeout(() => setCopied({ group: '', date: '' }), 1200);
    });
  },[packingData,sortData]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={divStyle}>
        <h1 style={{ margin: 0 }}>Packing Output</h1>
        <button
          style={buttonStyle}
          onClick={() => navigate('/packing-charts')}
        >
          Packing Charts
        </button>
        {lastUpdated && (
          <div style={subTextStyle}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
      <table style={tableStyle}>
        {groups.map(g => (
          <PackingPageTable
            key={g.key}
            header={g.label}
            headerTwo={g.totalLabel}
            dates={dates}
            partLabel={g.key}
            handleOnClick={handleCopyColumn}
            partsMap={g.parts}
            packingData={packingData}
            copied={copied}
            spacer
          />
        ))}
        <tbody>
           {/* Daily Total Section Header */}
           <tr style={headerStyle}>
             <td style={headerStyle}>
               DAILY TOTAL
             </td>
             {dates.map(date => (
               <td key={date} style={headerStyle}>
                 <div style={divStyle}>
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
             <td style={headerStyleTwo}>
               Total Packed
             </td>
             {dates.map(date => {
               // Calculate total across all models for this date
               const sxm4Total = sxm4Parts.reduce((sum, part) => sum + (packingData[part]?.[date] || 0), 0);
               const sxm5Total = sxm5Parts.reduce((sum, part) => sum + (packingData[part]?.[date] || 0), 0);
               const redOctoberTotal = redOctoberParts.reduce((sum, part) => sum + (packingData[part]?.[date] || 0), 0);
               const dailyTotal = sxm4Total + sxm5Total + redOctoberTotal;
               
               return (
                 <td key={date} style={headerStyleTwo}>
                   {dailyTotal || ''}
                 </td>
               );
             })}
           </tr>

           {/* Spacer Row */}
           <tr>
             <td style={spacerStyle}></td>
             {dates.map((_, idx) => (
               <td key={idx} style={spacerStyle}></td>
             ))}
           </tr>

           {/* Sort Section Header */}
           <tr style={headerStyle}>
             <td style={headerStyle}>
               SORT
             </td>
             {dates.map(date => (
               <td key={date} style={headerStyle}>
                 <div style={divStyle}>
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