// Widget for TestStation Reports
import React,{useState, useEffect, useMemo, useCallback} from 'react';
import { Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, Paper, setRef, } from '@mui/material';
import { ResponsiveContainer } from 'recharts';
import { Header } from '../../pagecomp/Header.jsx'
import { gridStyle, paperStyle } from '../../theme/themes.js';
import { PackingPageTable } from '../packingPage/PackingPageTable.jsx'
import { usePackingData } from '../../hooks/packingPage/usePackingData.js';
import { useGlobalSettings } from '../../../data/GlobalSettingsContext.js';
import { buttonStyle } from '../../theme/themes.js';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}
const modelKeys = [
    {id:"Tesla SXM4", model:"Tesla SXM4", key:"sxm4"},
    {id:"Tesla SXM5", model:"Tesla SXM5", key:"sxm5"},
    {id:"Tesla SXM6", model:"SXM6", key:"sxm6"}
]
const options =  modelKeys.map(w => w.id);
// label, data ,loading
export function PackingOutputWidget({ widgetId }) {
    const { state, dispatch } = useGlobalSettings();
    const { startDate, endDate, barLimit } = state;
    if (!state) {
        return <Paper sx={paperStyle}><Box sx={{ p: 2 }}>Loading global state...</Box></Paper>;
    }    
    if (!widgetId) {
        return <Paper sx={paperStyle}><Box sx={{ p: 2 }}>Widget ID missing</Box></Paper>;
    }    
    const widgetSettings = (state.widgetSettings && state.widgetSettings[widgetId]) || {};
    
    // Initialize widget settings if they don't exist
    useEffect(() => {
        if (!state.widgetSettings || !state.widgetSettings[widgetId]) {
            dispatch({
                type: 'UPDATE_WIDGET_SETTINGS',
                widgetId,
                settings: {}
            });
        }
    }, [widgetId, state.widgetSettings, dispatch]);

    const [data, setData] = useState([]);
    const [copied, setCopied] = useState({ group: '', date: '' });
    //const [dateRange,setDateRange] = useState([]);

    const model = widgetSettings.model || '';
    //const key = widgetSettings.key || '';
    const loaded = widgetSettings.loaded || false;

    const updateWidgetSettings = (updates) => {
        dispatch({
            type: 'UPDATE_WIDGET_SETTINGS',
            widgetId,
            settings: { ...widgetSettings, ...updates }
        });
    };

    const enabled = useMemo(()=>{return loaded && !!startDate && !!endDate},[loaded,startDate,endDate]);
    const [refreshKey,setRefreshKey] = useState(0)
    const {packingData, sortData, lastUpdated, refetch } = usePackingData(API_BASE,startDate,endDate,300_000,{enabled,refreshKey});
    
    // useEffect(() => {
    //     if (!loaded) return;
    //     //get Date Range
    //     const dates = []
    //     const current = new Date(startDate);
    //     const formatDate = (date) => {return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`};
    //     while(current <= endDate){
    //         dates.push(formatDate(new Date(current)));
    //         current.setDate(current.getDate()+1);
    //     }
    //     setDateRange(dates);
    //     // fetch Data
    //     console.log("Fetched:",packingData[model]);
    //     setData(packingData[model]);
    // }, [model, key, startDate, endDate,loaded,widgetId]);
    const dateRange = useMemo(() => {
        const dates = [];
        const current = new Date(startDate);
        const end = new Date(endDate);
        
        // Helper to format date as M/D/YYYY
        const formatDate = (date) => {
          return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        };
    
        // Add all dates between start and end
        while (current <= end) {
          dates.push(formatDate(new Date(current)));
          current.setDate(current.getDate() + 1);
        }
    
        return dates;
    }, [startDate, endDate]);
    
    
    const groups = useMemo(() => {
        if (!packingData || typeof packingData !== 'object') return [];
        try {
        // Define the desired order of groups
        const groupOrder = ['Tesla SXM4', 'Tesla SXM5', 'SXM6', 'RED OCTOBER'];
        
        return Object.entries(packingData)
            .map(([modelName, modelData]) => {
            // Filter parts to only include those with data in our date range
            const activeParts = Object.entries(modelData?.parts || {})
                .filter(([_, partData]) => {
                // Check if this part has any data in our date range
                return dateRange.some(date => partData[date] !== undefined && partData[date] !== null);
                })
                .map(([partNumber]) => partNumber.trim()) // Trim any whitespace
                .sort((a, b) => a.localeCompare(b)); // Sort part numbers alphabetically

            return {
                key: modelName,
                label: modelData?.groupLabel || modelName,
                totalLabel: modelData?.totalLabel || `${modelName} Total`,
                parts: activeParts,
                order: groupOrder.indexOf(modelName) // Will be -1 if not found
            };
            })
            .filter(group => group.parts.length > 0) // Only include groups that have active parts
            .sort((a, b) => {
            // If both groups are in groupOrder, sort by their order
            if (a.order !== -1 && b.order !== -1) {
                return a.order - b.order;
            }
            // If only one is in groupOrder, prioritize it
            if (a.order !== -1) return -1;
            if (b.order !== -1) return 1;
            // If neither is in groupOrder, sort alphabetically
            return a.key.localeCompare(b.key);
            })
        } catch (error) {
        console.error('Error processing packing data:', error);
        return [];
        }
    }, [packingData, dateRange]);

    // Calculate daily totals from the new structure
    const dailyTotals = useMemo(() => {
        if (!packingData || typeof packingData !== 'object') return {};
        try {
        const totals = dateRange.reduce((acc, date) => {
            let total = 0;
            
            // Sum up all parts from all models for this date
            Object.values(packingData).forEach(model => {
            if (model?.parts) {
                Object.values(model.parts).forEach(partData => {
                const value = Number(partData[date] || 0);
                total += value;
                });
            }
            });
            
            // Always add the total (even if zero)
            acc[date] = total;
            return acc;
        }, {});


        return totals;
        } catch (error) {
        console.error('Error calculating daily totals:', error);
        return {};
        }
    }, [dateRange, packingData]);

    const handleCopyColumn = useCallback((group, date) => {
        let values = '';
        
        if (packingData[group]) {
        values = Object.values(packingData[group].parts)
            .map(partData => partData[date] || '')
            .join('\n');
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

    const handleSetModelKey= e => {
        const selectedId = e.target.value;
        const entry = modelKeys.find(mk => mk.id === selectedId);
        if (entry) {
            updateWidgetSettings({
                model: entry.model,
                //key: entry.key
            });
            setData([]); // reset data
        }
    };
    const handleLoadChart = () => {
        updateWidgetSettings({ loaded: true });
        setRefreshKey(k=>k+1);
    };

    if ( !loaded ){
        return(
            <Paper sx={paperStyle}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Header
                    title="Select Model"
                    subTitle="Choose a model to chart"
                    titleVariant="h6"
                    subTitleVariant="body2"
                    titleColor="text.secondary"
                    />
                    <FormControl fullWidth>
                        <InputLabel id="model-select-label">Choose Model</InputLabel>
                        <Select
                        label="Choose Model"
                        value = {modelKeys.find(mk => mk.model === model)?.id || ''}
                        onChange={handleSetModelKey}
                        >
                        {modelKeys.map(mk =>(
                            <MenuItem key={mk.id}value={mk.id}>
                            {mk.id}
                            </MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                    {model.length > 0 && (
                    <Button sx={buttonStyle} onClick={handleLoadChart}>
                        Load Chart
                    </Button>
                )}
                </Box>
                
            </Paper>
        );
    }
    const selectedGroup = useMemo(
        ()=> groups.find(g => g.key ===model) || null,[groups,model]
    );
    if(!selectedGroup){
        return(
            <Paper sx={paperStyle}>
                <Box sx={{p:2}}>
                    <Typography variant='body2'>
                        {`No data yet for "${model}" in this date range.`}
                    </Typography>
                </Box>
            </Paper>
        )
    }
    return (
        <Paper
            sx={{...paperStyle,
                display:'flex',
                flexDirection:'column',
                height:'100%',
                maxHeight: 520,
                minHeight: 280,
                maxWidth: 620,
                zIndex:0,
            }}
        >
            <Box
                role="region"
                aria-label={`${selectedGroup.label} packing table`}
                tabIndex={0}
                sx={{
                    flex:1,
                    overflow:'auto',
                    overscrollBehavior:'contain',
                    WebkitOverflowScrolling: 'touch',
                    position: 'relative',
                    zIndex: 0,       
                }}
            >
                <Header title = {`${model} Packing Output`} titleVariant = 'h6'/>
                <PackingPageTable
                    key={selectedGroup.key}
                    header={selectedGroup.label}
                    headerTwo={selectedGroup.totalLabel}
                    dates={dateRange}
                    partLabel={selectedGroup.key}
                    handleOnClick={handleCopyColumn}
                    partsMap={selectedGroup.parts}
                    packingData={packingData?.[selectedGroup.key]?.parts || {}}
                    copied={copied}
                />
            </Box>
        </Paper>
    );
}
