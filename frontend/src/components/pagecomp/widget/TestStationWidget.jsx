// Widget for TestStation Reports with Persistence
import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import { Header } from '../../pagecomp/Header.jsx'
import { buttonStyle, gridStyle, paperStyle } from '../../theme/themes.js';
import { TestStationChart } from '../../charts/TestStationChart.js'
import { fetchWorkstationQuery } from '../../../utils/queryUtils.js';
import { getInitialStartDate, normalizeDate } from '../../../utils/dateUtils.js';
import { useGlobalSettings } from '../../../data/GlobalSettingsContext.js';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

const modelKeys = [
    {id:"Tesla SXM4", model:"Tesla SXM4", key:"sxm4"},
    {id:"Tesla SXM5", model:"Tesla SXM5", key:"sxm5"},
    {id:"Tesla SXM6", model:"SXM6", key:"sxm6"}
];

const options = modelKeys.map(w => w.id);

// Enhanced widget that accepts widgetId for persistence
export function TestStationWidget({ widgetId }) {
    
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
    
    const [testStationData, setTestStationData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Use persisted values or defaults
    const model = widgetSettings.model || '';
    const key = widgetSettings.key || '';
    const loaded = widgetSettings.loaded || false;

    // Add some debugging
    // console.log('TestStationWidget Debug:', {
    //     widgetId,
    //     widgetSettings,
    //     model,
    //     key,
    //     loaded,
    //     stateWidgetSettings: state.widgetSettings
    // });

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
                await fetchWorkstationQuery({
                    parameters: [{ id: 'model', value: model }],
                    startDate,
                    endDate,
                    key: key,
                    setDataCache: data => {
                        if (isActive) setTestStationData(data);
                    },
                    API_BASE,
                    API_Route: '/api/functional-testing/station-performance?'
                });
            } catch (err) {
                console.error('Error fetching data', err);
                if (isActive) setTestStationData([]);
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
            setTestStationData([]); // reset data
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
                        title="Select Model for Test Station Chart"
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
        <TestStationChart
            label={`${model} Test Station Performance`}
            data={testStationData}
            loading={loading}
        />
    );
}