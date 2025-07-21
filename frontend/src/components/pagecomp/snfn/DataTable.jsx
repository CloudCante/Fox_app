// DataTable.jsx
import React, { memo } from 'react';
import { Box, Paper } from '@mui/material';
import { truncateText } from '../../../utils/textUtils';

const tableStyle = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm:'1fr 1fr', md: '1fr 1fr 1fr' },
    gap: 3,
    maxWidth: '1600px',
    margin: '0 auto',
  };

export function DataTable({ paginatedData, maxErrorCodes, codeDescMap, onRowClick, groupByWorkstation, style }) {
  return (
    <Box sx={tableStyle}>
      {paginatedData.map(station => (
        <Paper key={station[0]} sx={{ p:2 }}>
          <table>
            <thead>
                <tr
                    title={`${groupByWorkstation ? 'Fixture' : 'Workstation'}: "${station[0][1]}" — ${(station?.length ?? 0) - 1} unique error codes`}>
                    <th style={style}>{groupByWorkstation ? 'Workstation' : 'Fixture'} {station[0][0]}</th>
                    <th style={style}>Count of Error Codes</th>
                </tr>
            </thead>
            <tbody>
              {station.slice(1, maxErrorCodes+1).map(([code, count, snList]) => (
                <tr
                  key={code}
                  onClick={() => onRowClick([station, [code, count, snList]])}
                  title={truncateText(codeDescMap.get(station[0]+code) || '')}
                >
                  <td style={style}>{code}</td>
                  <td style={style}>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>
      ))}
    </Box>
  );
}

export default memo(DataTable, (prev, next) =>
  // shallow compare only props you care about
  prev.paginatedData === next.paginatedData &&
  prev.maxErrorCodes === next.maxErrorCodes
);
