// Widget for TestStation Reports
import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import { Header } from '../Header.jsx'
import { buttonStyle, gridStyle, paperStyle } from '../../theme/themes.js';
import { ParetoChart } from '../../charts/ParetoChart.js'
import { fetchErrorQuery } from '../../../utils/queryUtils.js';
import { useGlobalSettings } from '../../../data/GlobalSettingsContext.js';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

const modelKeys = [
    {id:"All", model:"ALL", key:"sxm4"},
    {id:"Tesla SXM4", model:"Tesla SXM4", key:"sxm4"},
    {id:"Tesla SXM5", model:"Tesla SXM5", key:"sxm5"},
    {id:"Tesla SXM6", model:"SXM6", key:"sxm6"}
];

const options = modelKeys.map(w => w.id);

// Enhanced widget that accepts widgetId for persistence
export function ParetoWidget({ widgetId }) {
    
    // Get everything from useGlobalSettings hook
    const { state, dispatch } = useGlobalSettings();
    
    // Extract values from state
    const { startDate, endDate, barLimit } = state;
    
    
    // Only return loading if state is completely missing or widgetId is missing
    if (!state) {
        console.log('ParetoWidget: No state, returning loading');
        return <Paper sx={paperStyle}><Box sx={{ p: 2 }}>Loading global state...</Box></Paper>;
    }
    
    if (!widgetId) {
        console.log('ParetoWidget: No widgetId, returning error');
        return <Paper sx={paperStyle}><Box sx={{ p: 2 }}>Widget ID missing</Box></Paper>;
    }
    
    
    // Get widget-specific settings from global state with proper fallback
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
    const [loading, setLoading] = useState(true);

    // Use persisted values or defaults
    const model = widgetSettings.model || '';
    const key = widgetSettings.key || '';
    const loaded = widgetSettings.loaded || false;


    // Helper function to update widget settings
    const updateWidgetSettings = (updates) => {
        dispatch({
            type: 'UPDATE_WIDGET_SETTINGS',
            widgetId,
            settings: { ...widgetSettings, ...updates }
        });
    };

    useEffect(() => {
        if (!loaded) return;
        
        let isActive = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                await fetchErrorQuery({
                    parameters: [{ id: 'model', value: model }],
                    startDate,
                    endDate,
                    key,
                    setDataCache: data => {
                        if (isActive) setData(data);
                    },
                    API_BASE,
                    API_Route: '/api/snfn/model-errors?'
                });
            } catch (err) {
                console.error('Error fetching data', err);
                if (isActive) setData([]);
            } finally {
                if (isActive) setLoading(false);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 300000);
        
        return () => {
            isActive = false;
            clearInterval(intervalId);
        };
    }, [model, key, startDate, endDate, loaded, widgetId]);

    const handleSetModelKey = (e) => {
        const selectedId = e.target.value;
        const entry = modelKeys.find(mk => mk.id === selectedId);
        
        if (entry) {
            updateWidgetSettings({
                model: entry.model,
                key: entry.key
            });
            setData([]); // reset data
        }
    };

    const handleLoadChart = () => {
        updateWidgetSettings({ loaded: true });
    };

    if (!loaded) {
        return (
            <Paper sx={paperStyle}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Header
                        title="Select Model for Pareto Chart"
                        subTitle="Choose a model to chart"
                        titleVariant="h6"
                        subTitleVariant="body2"
                        titleColor="text.secondary"
                    />
                    <FormControl fullWidth>
                        <InputLabel id="model-select-label">Choose Model</InputLabel>
                        <Select
                            label="Choose Model"
                            value={modelKeys.find(mk => mk.model === model)?.id || ''}
                            onChange={handleSetModelKey}
                        >
                            {modelKeys.map(mk => (
                                <MenuItem key={mk.id} value={mk.id}>
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

    return (
        <ParetoChart
            label={`${model} Test Station Pareto`}
            data={data} 
            loading={loading}
            limit={barLimit}
        />
    );
}