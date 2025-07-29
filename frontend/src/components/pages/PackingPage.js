import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Tooltip, IconButton, } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { sxm4Parts, sxm5Parts, redOctoberParts } from '../../data/dataTables';
import { PackingPageTable } from '../pagecomp/packingPage/PackingPageTable';
import { headerStyle, tableStyle, divStyle, headerStyleTwo,
   spacerStyle, buttonStyle, subTextStyle, dataTextStyle, 
   dataTotalStyle } from '../theme/themes';
import { usePackingData } from '../hooks/packingPage/usePackingData';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

const PackingPage = () => {
  const [copied, setCopied] = useState({ group: '', date: '' });
  const { packingData, dates, sortData, lastUpdated } = usePackingData(API_BASE);
  const theme = useTheme();
  const navigate = useNavigate();

  const groups = useMemo(() => [
    { key: 'SXM4', parts: sxm4Parts, label: 'TESLA SXM4', totalLabel: 'TESLA SXM4 Total' },
    { key: 'SXM5', parts: sxm5Parts, label: 'TESLA SXM5', totalLabel: 'TESLA SXM5 Total' },
    { key: 'RED OCTOBER', parts: redOctoberParts, label: 'RED OCTOBER', totalLabel: 'Red October Total' },
  ], []);

  const dailyTotals = useMemo(() => {
    return dates.reduce((acc, date) => {
      const total = [...sxm4Parts, ...sxm5Parts, ...redOctoberParts]
        .reduce((sum, part) => sum + (packingData[part]?.[date] || 0), 0);
      acc[date] = total;
      return acc;
    }, {});
  }, [dates, packingData]);

  const handleCopyColumn = useCallback((group, date) => {
    let values = '';

    const parts = ["SXM4", "SXM5", "RED OCTOBER"];
    if (group in parts) {
      values = sxm4Parts.map(part => packingData[part]?.[date] || '').join('\n');
    } else if (group === 'DAILY TOTAL') {
      values = dailyTotals[date]?.toString() || '';
    } else if (group === 'SORT') {
      values = ['506', '520'].map(model => sortData[model]?.[date] || '').join('\n');
    }

    navigator.clipboard.writeText(values).then(() => {
      setCopied({ group, date });
      setTimeout(() => setCopied({ group: '', date: '' }), 1200);
    });
  }, [packingData, sortData, dailyTotals]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={divStyle}>
        <h1 style={{ margin: 0 }}>Packing Output</h1>
        <button style={buttonStyle} onClick={() => navigate('/packing-charts')}>
          Packing Charts
        </button>
        {lastUpdated && <div style={subTextStyle}>Last updated: {lastUpdated.toLocaleTimeString()}</div>}
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
          {/* Daily Total Section */}
          <tr style={headerStyle}>
            <td style={headerStyle}>DAILY TOTAL</td>
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
          <tr style={headerStyleTwo}>
            <td style={headerStyleTwo}>Total Packed</td>
            {dates.map(date => (
              <td key={date} style={dataTotalStyle}>
                {dailyTotals[date] || ''}
              </td>
            ))}
          </tr>

          {/* Spacer */}
          <tr>
            <td style={spacerStyle}></td>
            {dates.map((_, idx) => <td key={idx} style={spacerStyle}></td>)}
          </tr>

          {/* Sort Section */}
          <tr style={headerStyle}>
            <td style={headerStyle}>SORT</td>
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
          <tr style={{ backgroundColor: theme.palette.background.paper }}>
            <td style={{ ...dataTextStyle, fontWeight: 'bold' }}>506</td>
            {dates.map(date => (
              <td key={date} style={dataTextStyle}>
                {sortData['506'][date] || ''}
              </td>
            ))}
          </tr>
          <tr style={{ backgroundColor: theme.palette.background.default }}>
            <td style={{ ...dataTextStyle, fontWeight: 'bold' }}>520</td>
            {dates.map(date => (
              <td key={date} style={dataTextStyle}>
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