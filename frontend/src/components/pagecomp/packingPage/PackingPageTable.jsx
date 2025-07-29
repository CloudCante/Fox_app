// PackingPageTable.jsx
import React, { memo, useMemo } from 'react';
import { Box, FormHelperText, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { headerStyle, divStyle, headerStyleTwo, spacerStyle, dataTextStyle,
  dataTotalStyle,
 } from '../../theme/themes';
import { useTheme } from '@emotion/react';
import { green } from '@mui/material/colors';

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
                       onClick={() => {if(typeof(handleOnClick)==='function')handleOnClick(partLabel, date)}}
                       sx={{
                            padding: 0,
                            height: '14px',
                            width: '14px',
                            minWidth: '14px',
                            color: copied.group === partLabel && copied.date === date ? 'success.main' : 'white'
                        }}
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
                 <td key={date} style={dataTextStyle}>
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
                 <td key={date} style={dataTotalStyle}>
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