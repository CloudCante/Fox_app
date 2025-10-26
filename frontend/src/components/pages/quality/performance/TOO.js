import React from 'react';
import { useTheme } from '@mui/material';

// Helper function to get cell background color based on category
const getCellColor = (category) => {
    const colors = {
        'yellow': '#FFFF00',
        'green': '#00FF00',
        'blue': '#00BFFF',
        'default': 'transparent'
    };
    return colors[category] || colors.default;
};

// Station columns with their categories for color coding
const stations = [
    { name: 'Receive', avgTime: '0:05:21', category: 'white' },
    { name: 'VI1', avgTime: '0:10:04', category: 'white' },
    { name: "HS-Que Station w Mat'l", avgTime: '15:32:47', category: 'yellow' },
    { name: 'HS-Disassembly', avgTime: '0:14:48', category: 'white' },
    { name: 'HS-Assembley', avgTime: '0:07:26', category: 'white' },
    { name: 'Upgrade', avgTime: '0:48:12', category: 'white' },
    { name: 'Que Station w/ interposer', avgTime: '0:17:20', category: 'yellow' },
    { name: 'VI2', avgTime: '5:35:15', category: 'green' },
    { name: 'BBD', avgTime: '0:14:20', category: 'green' },
    { name: 'Assy1', avgTime: '0:06:09', category: 'green' },
    { name: 'Que Station w/ Test', avgTime: '10:40:52', category: 'yellow' },
    { name: 'TEST', avgTime: '0:35:46', category: 'white' },
    { name: 'Repair', avgTime: '0:00:00', category: 'white' },
    { name: 'Assy2', avgTime: '0:02:17', category: 'blue' },
    { name: 'FI', avgTime: '0:00:26', category: 'blue' },
    { name: 'FQC', avgTime: '0:00:41', category: 'blue' },
    { name: 'Packing', avgTime: '0:01:29', category: 'white' },
    { name: 'Que', avgTime: '1:06:40', category: 'yellow' },
    { name: 'Shipping', avgTime: '0:50:00', category: 'white' },
];

// Final metrics columns
const metricsColumns = [
    { name: 'Total Manuf Station Time hr:mm:ss (Sum) [Only stations]', value: '109:07:17' },
    { name: 'Total Que hr:mm:ss (Sum) [Only Queue]', value: '153:30:55' },
    { name: 'Total TOO hr:mm:ss (Sum) [Stations +Queue]', value: '6:23:42' },
    { name: 'Total TOO Days (Sum)', value: '0:00:00' },
];

// Sample data rows
const dataRows = [
    { dateRange: '9/29-10/3', unitQty: 1636 },
    { dateRange: '10/4-10/12', unitQty: 1866 },
];

const TOO = () => {
    const theme = useTheme();

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ margin: 0, marginBottom: '20px' }}>
                Total Time Of Ownership (TOO)
            </h1>

            {/* ORIGINAL TABLE - COMMENTED OUT */}
            {/* 
            <table style={{ 
                borderCollapse: 'separate',
                borderSpacing: 0,
                width: '100%'
            }}>
                <tbody>
                        <tr>
                            <td style={{
                                position: 'sticky',
                                left: 0,
                                zIndex: 10,
                                boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                                padding: '12px 8px',
                                fontWeight: 'bold',
                                fontSize: '13px',
                                textAlign: 'center',
                                backgroundColor: theme.palette.background.paper,
                                border: '1px solid #ddd',
                                minWidth: '150px',
                                width: '150px',
                            }}>
                                Stations / (Avg Hrs)<br/>Shipment Dates
                            </td>
                            <td style={{
                                position: 'sticky',
                                left: '150px',
                                zIndex: 10,
                                boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                                padding: '12px 8px',
                                fontWeight: 'bold',
                                fontSize: '13px',
                                textAlign: 'center',
                                backgroundColor: theme.palette.background.paper,
                                border: '1px solid #ddd',
                                minWidth: '100px',
                                width: '100px',
                            }}>
                                Unit QTY
                            </td>
                            {stations.map((station, idx) => (
                                <td 
                                    key={idx} 
                                    style={{
                                        padding: '12px 8px',
                                        fontWeight: 'bold',
                                        fontSize: '11px',
                                        textAlign: 'center',
                                        backgroundColor: getCellColor(station.category),
                                        border: '1px solid #ddd',
                                        whiteSpace: 'nowrap',
                                        minWidth: '120px',
                                    }}
                                >
                                    {station.name}
                                    <br/>
                                    <span style={{ fontSize: '10px', fontWeight: 'normal' }}>
                                        ({station.avgTime})
                                    </span>
                                </td>
                            ))}
                            {metricsColumns.map((metric, idx) => (
                                <td 
                                    key={idx} 
                                    style={{
                                        padding: '12px 8px',
                                        fontWeight: 'bold',
                                        fontSize: '11px',
                                        textAlign: 'center',
                                        backgroundColor: theme.palette.background.paper,
                                        border: '1px solid #ddd',
                                        minWidth: '180px',
                                    }}
                                >
                                    {metric.name}
                                </td>
                            ))}
                        </tr>

                        {dataRows.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                                <td style={{
                                    position: 'sticky',
                                    left: 0,
                                    zIndex: 5,
                                    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                                    padding: '10px 8px',
                                    fontSize: '13px',
                                    textAlign: 'center',
                                    backgroundColor: theme.palette.background.default,
                                    border: '1px solid #ddd',
                                    fontWeight: 500,
                                    width: '150px',
                                }}>
                                    {row.dateRange}
                                </td>
                                <td style={{
                                    position: 'sticky',
                                    left: '150px',
                                    zIndex: 5,
                                    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                                    padding: '10px 8px',
                                    fontSize: '13px',
                                    textAlign: 'center',
                                    backgroundColor: theme.palette.background.default,
                                    border: '1px solid #ddd',
                                    width: '100px',
                                }}>
                                    {row.unitQty}
                                </td>
                                {stations.map((station, idx) => (
                                    <td 
                                        key={idx}
                                        style={{
                                            padding: '10px 8px',
                                            fontSize: '13px',
                                            textAlign: 'center',
                                            backgroundColor: getCellColor(station.category),
                                            border: '1px solid #ddd',
                                        }}
                                    >
                                        {station.avgTime}
                                    </td>
                                ))}
                                {metricsColumns.map((metric, idx) => (
                                    <td 
                                        key={idx} 
                                        style={{
                                            padding: '10px 8px',
                                            fontSize: '13px',
                                            textAlign: 'center',
                                            backgroundColor: theme.palette.background.default,
                                            border: '1px solid #ddd',
                                        }}
                                    >
                                        {metric.value}
                                    </td>
                                ))}
                            </tr>
                        ))}
                </tbody>
            </table>
            */}

            {/* NEW TABLE WITH ROTATED HEADERS WILL GO HERE */}
            
            {/* TEST: Separate slanted headers */}
            <div style={{ marginTop: '40px' }}>
                <h3>Test: Separate Headers Approach</h3>
                
                {/* Slanted headers - separate container */}
                <div style={{ 
                    display: 'flex',
                    paddingLeft: '100px',
                    marginBottom: '-1px', // Overlap with data table border
                }}>
                    {/* First slanted header */}
                    <div style={{
                        width: '50px',
                        height: '150px',
                        position: 'relative',
                        overflow: 'visible',
                    }}>
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '50px',
                            height: '150px',
                            backgroundColor: '#FFFF00',
                            transform: 'skewX(-45deg)',
                            transformOrigin: 'bottom left',
                            border: '1px solid #000',
                            borderBottom: '1px solid #000',
                        }}>
                        </div>
                    </div>
                    
                    {/* Second slanted header */}
                    <div style={{
                        width: '50px',
                        height: '150px',
                        position: 'relative',
                        overflow: 'visible',
                    }}>
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '50px',
                            height: '150px',
                            backgroundColor: '#00FF00',
                            transform: 'skewX(-45deg)',
                            transformOrigin: 'bottom left',
                            border: '1px solid #000',
                            borderBottom: '1px solid #000',
                        }}>
                        </div>
                    </div>
                </div>
                
                {/* Data table - separate container */}
                <table style={{ 
                    borderCollapse: 'collapse',
                    marginLeft: '100px',
                }}>
                    <tbody>
                        <tr>
                            <td style={{
                                width: '50px',
                                minWidth: '50px',
                                maxWidth: '50px',
                                height: '40px',
                                border: '1px solid #000',
                                borderTop: 'none',
                                padding: 0,
                                textAlign: 'center',
                                backgroundColor: '#FFFF00',
                                boxSizing: 'border-box',
                            }}>
                                Data1
                            </td>
                            <td style={{
                                width: '50px',
                                minWidth: '50px',
                                maxWidth: '50px',
                                height: '40px',
                                border: '1px solid #000',
                                borderTop: 'none',
                                padding: 0,
                                textAlign: 'center',
                                backgroundColor: '#00FF00',
                                boxSizing: 'border-box',
                            }}>
                                Data2
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                📊 Color Legend: 
                <span style={{ marginLeft: '16px', padding: '4px 8px', backgroundColor: '#FFFF00' }}>
                    Yellow - Assembly
                </span>
                <span style={{ marginLeft: '8px', padding: '4px 8px', backgroundColor: '#00FF00' }}>
                    Green - QA/Test
                </span>
                <span style={{ marginLeft: '8px', padding: '4px 8px', backgroundColor: '#00BFFF' }}>
                    Blue - Final/Metrics
                </span>
            </div>
        </div>
    );
};

export default TOO;
