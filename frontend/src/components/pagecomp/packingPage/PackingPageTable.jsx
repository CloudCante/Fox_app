// PackingPageTable.jsx
import React, { memo, useMemo } from 'react';
import { Box, FormHelperText, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';
import { headerStyle, divStyle, headerStyleTwo, spacerStyle } from '../../theme/themes';
import { useTheme } from '@emotion/react';

export const PackingPageTable = memo(function DateRange({
  header,
  headerTwo,
  dates,
  partLabel,
  handleOnClick,
  partsMap,
  packingData,
  copied,
  spacer=false
}) {
    const theme = useTheme();
  const buttionIconStyle = { 
    padding: 0,
    height: '14px',
    width: '14px',
    minWidth: '14px',
    color: copied.group === partLabel && copied.date === date ? 'success.main' : 'white'
  };
  const tdStyle = {
    border: '1px solid #ddd',
    padding: '10px 8px',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',

    backgroundColor: theme.palette.background.default,

    position: 'sticky',
    left: 0,
    zIndex: 5,
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };
    const tdStyle2 = {
    border: '1px solid #ddd',
    padding: '10px 8px',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',

    backgroundColor: theme.palette.background.paper,

    position: 'sticky',
    left: 0,
    zIndex: 5,
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };
  const styleOne = {
                   border: '1px solid #ddd',
                   padding: '10px 8px',
                   textAlign: 'center',
                   fontSize: '13px'
                 }

  return (
    
    <tbody>
           {/* Tesla SXM4 Section Header */}
           <tr style={headerStyle}>
             <td style={headerStyle}>
               {header}
             </td>
             {dates.map(date => (
               <td key={date} style={headerStyle}>
                 <div style={divStyle}>
                   <span>{date}</span>
                   <Tooltip title={copied.group === partLabel && copied.date === date ? 'Copied!' : 'Copy column'}>
                     <IconButton
                       size="small"
                       onClick={() => {if(typeof(handleOnClick)==='function')handleOnClick(part, date)}}
                       sx={buttionIconStyle}
                     >
                       {copied.group === partLabel && copied.date === date ? 
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
           {partsMap.map((part, idx) => (
             <tr key={part} style={{
// make style for here
               backgroundColor: idx % 2 === 0 ? theme.palette.background.default : theme.palette.background.paper

             }}>
               <td style={(idx % 2) === 0 ? tdStyle : tdStyle2}>
                 {part}
               </td>
               {dates.map(date => (
                 <td key={date} style={styleOne}>
                   {packingData[part]?.[date] || ''}
                 </td>
               ))}
             </tr>
           ))}

           {/* SXM4 Total Row */}
           <tr style={{ backgroundColor: '#c8e6c9' }}>
             <td style={headerStyleTwo}>
               {headerTwo}
             </td>
             {dates.map(date => {
               const total = partsMap.reduce((sum, part) => 
                 sum + (packingData[part]?.[date] || 0), 0
               );
               return (
                 <td key={date} style={headerStyleTwo}>
                   {total || ''}
                 </td>
               );
             })}
           </tr>
           {/* Spacer Row */}
           {spacer&&(<tr>
             <td style={spacerStyle}></td>
             {dates.map((_, idx) => (
               <td key={idx} style={spacerStyle}></td>
             ))}
           </tr>)}
          </tbody>
  );
});

PackingPageTable.propTypes = {

};

export default PackingPageTable;