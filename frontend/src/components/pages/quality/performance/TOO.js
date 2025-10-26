import React, { useState, useEffect } from 'react';
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

// Table sizing configurations for different screen sizes
const TABLE_CONFIG_LARGE = {
    columnWidths: {
        shipmentDate: 100,
        station: 70,
        metric: 120,
    },
    headerHeight: 150,
    dataRowHeight: 40,
    fontSizes: {
        headerMain: 11,
        headerSub: 10,
        dataMain: 13,
        dataMetric: 12,
    }
};

// Scaled down for 13-14 inch laptop displays (1366x768 to 1920x1080)
const TABLE_CONFIG_SMALL = {
    columnWidths: {
        shipmentDate: 70,    // 30% smaller
        station: 50,         // ~29% smaller
        metric: 85,          // ~29% smaller
    },
    headerHeight: 120,       // 20% smaller
    dataRowHeight: 32,       // 20% smaller
    fontSizes: {
        headerMain: 9,       // 2px smaller
        headerSub: 8,
        dataMain: 11,        // 2px smaller
        dataMetric: 10,      // 2px smaller
    }
};

const TOO = () => {
    const theme = useTheme();
    
    // State to hold current table configuration
    const [TABLE_CONFIG, setTableConfig] = useState(TABLE_CONFIG_LARGE);
    
    // Detect screen size and adjust table config
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            // Switch to small config for screens narrower than 1600px (typical for 13-14" laptops)
            if (width < 1600) {
                setTableConfig(TABLE_CONFIG_SMALL);
            } else {
                setTableConfig(TABLE_CONFIG_LARGE);
            }
        };
        
        // Set initial config
        handleResize();
        
        // Add resize listener
        window.addEventListener('resize', handleResize);
        
        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ margin: 0, marginBottom: '5px' }}>
                Total Time Of Ownership (TOO)
            </h1>
            <p style={{ margin: 0, marginBottom: '20px', fontSize: '14px', color: '#666' }}>
                All times displayed in HH:MM:SS format
            </p>

            {/* FULL TABLE WITH SLANTED HEADERS */}
            <div>
                {/* Slanted headers - separate container */}
                <div style={{ 
                    display: 'flex',
                    marginBottom: '-1px',
                }}>
                    {/* Shipment Date header */}
                    <div 
                        style={{
                            width: `${TABLE_CONFIG.columnWidths.shipmentDate}px`,
                            height: `${TABLE_CONFIG.headerHeight}px`,
                            position: 'relative',
                            overflow: 'visible',
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: `${TABLE_CONFIG.columnWidths.shipmentDate}px`,
                            height: `${TABLE_CONFIG.headerHeight}px`,
                            backgroundColor: theme.palette.background.paper,
                            transform: 'skewX(-45deg)',
                            transformOrigin: 'bottom left',
                            border: '1px solid #000',
                            borderBottom: '1px solid #000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <div style={{
                                transform: 'skewX(45deg) rotate(-45deg)',
                                fontSize: `${TABLE_CONFIG.fontSizes.headerMain}px`,
                                fontWeight: 'bold',
                                textAlign: 'center',
                                maxWidth: '100px',
                                wordWrap: 'break-word',
                            }}>
                                Shipment Date
                            </div>
                        </div>
                    </div>
                    
                    {/* Station headers */}
                    {stations.map((station, idx) => (
                        <div 
                            key={`station-${idx}`}
                            style={{
                                width: `${TABLE_CONFIG.columnWidths.station}px`,
                                height: `${TABLE_CONFIG.headerHeight}px`,
                                position: 'relative',
                                overflow: 'visible',
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: `${TABLE_CONFIG.columnWidths.station}px`,
                                height: `${TABLE_CONFIG.headerHeight}px`,
                                backgroundColor: getCellColor(station.category),
                                transform: 'skewX(-45deg)',
                                transformOrigin: 'bottom left',
                                border: '1px solid #000',
                                borderBottom: '1px solid #000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <div style={{
                                    transform: 'skewX(45deg) rotate(-45deg)',
                                    fontSize: `${TABLE_CONFIG.fontSizes.headerMain}px`,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    maxWidth: '80px',
                                    wordWrap: 'break-word',
                                    lineHeight: '1.2',
                                }}>
                                    {station.name}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Metrics headers */}
                    {metricsColumns.map((metric, idx) => (
                        <div 
                            key={`metric-${idx}`}
                            style={{
                                width: `${TABLE_CONFIG.columnWidths.metric}px`,
                                height: `${TABLE_CONFIG.headerHeight}px`,
                                position: 'relative',
                                overflow: 'visible',
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: `${TABLE_CONFIG.columnWidths.metric}px`,
                                height: `${TABLE_CONFIG.headerHeight}px`,
                                backgroundColor: theme.palette.background.paper,
                                transform: 'skewX(-45deg)',
                                transformOrigin: 'bottom left',
                                border: '1px solid #000',
                                borderBottom: '1px solid #000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <div style={{
                                    transform: 'skewX(45deg) rotate(-45deg)',
                                    fontSize: `${TABLE_CONFIG.fontSizes.headerMain}px`,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    maxWidth: '120px',
                                    wordWrap: 'break-word',
                                    lineHeight: '1.2',
                                }}>
                                    {metric.name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Data table - ONE ROW */}
                <table style={{ 
                    borderCollapse: 'collapse',
                }}>
                    <tbody>
                        <tr>
                            {/* Shipment Date data cell */}
                            <td 
                                style={{
                                    width: `${TABLE_CONFIG.columnWidths.shipmentDate}px`,
                                    minWidth: `${TABLE_CONFIG.columnWidths.shipmentDate}px`,
                                    maxWidth: `${TABLE_CONFIG.columnWidths.shipmentDate}px`,
                                    height: `${TABLE_CONFIG.dataRowHeight}px`,
                                    border: '1px solid #000',
                                    borderTop: 'none',
                                    padding: '4px',
                                    textAlign: 'center',
                                    backgroundColor: theme.palette.background.default,
                                    boxSizing: 'border-box',
                                    fontSize: `${TABLE_CONFIG.fontSizes.dataMain}px`,
                                    fontWeight: 'bold',
                                }}
                            >
                                9/29-10/3
                            </td>
                            
                            {/* Station data cells */}
                            {stations.map((station, idx) => (
                                <td 
                                    key={`data-station-${idx}`}
                                    style={{
                                        width: `${TABLE_CONFIG.columnWidths.station}px`,
                                        minWidth: `${TABLE_CONFIG.columnWidths.station}px`,
                                        maxWidth: `${TABLE_CONFIG.columnWidths.station}px`,
                                        height: `${TABLE_CONFIG.dataRowHeight}px`,
                                        border: '1px solid #000',
                                        borderTop: 'none',
                                        padding: 0,
                                        textAlign: 'center',
                                        backgroundColor: getCellColor(station.category),
                                        boxSizing: 'border-box',
                                        fontSize: `${TABLE_CONFIG.fontSizes.dataMain}px`,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {station.avgTime}
                                </td>
                            ))}
                            
                            {/* Metrics data cells */}
                            {metricsColumns.map((metric, idx) => (
                                <td 
                                    key={`data-metric-${idx}`}
                                    style={{
                                        width: `${TABLE_CONFIG.columnWidths.metric}px`,
                                        minWidth: `${TABLE_CONFIG.columnWidths.metric}px`,
                                        maxWidth: `${TABLE_CONFIG.columnWidths.metric}px`,
                                        height: `${TABLE_CONFIG.dataRowHeight}px`,
                                        border: '1px solid #000',
                                        borderTop: 'none',
                                        padding: '4px',
                                        textAlign: 'center',
                                        backgroundColor: theme.palette.background.default,
                                        boxSizing: 'border-box',
                                        fontSize: `${TABLE_CONFIG.fontSizes.dataMetric}px`,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {metric.value}
                                </td>
                            ))}
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
