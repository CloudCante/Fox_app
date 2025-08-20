// Widget for TestStation Reports
// ------------------------------------------------------------
// Imports
import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, FormControl, InputLabel, Select, MenuItem, Paper, Typography, Card, CardContent } from '@mui/material';
// Page Comps
import { Header } from '../../pagecomp/Header.jsx';
// Style Guides
import { buttonStyle, paperStyle } from '../../theme/themes.js';
// Chart Comps
import { ThroughputBarChart } from '../../charts/ThroughputBarChart.js';
// Utils
import { fetchWorkstationQuery } from '../../../utils/queryUtils.js';
// Global Settings
import { useGlobalSettings } from '../../../data/GlobalSettingsContext.js';

// ------------------------------------------------------------
// Environment / constants
const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

const modelKeys = [
  { id: 'Tesla SXM4', model: 'Tesla SXM4', key: 'sxm4' },
  { id: 'Tesla SXM5', model: 'Tesla SXM5', key: 'sxm5' },
  { id: 'Tesla SXM6', model: 'SXM6',       key: 'sxm6' }
];

export function ThroughputWidget({ widgetId }) {
  // ----- Global settings & extractions
  const { state, dispatch } = useGlobalSettings();
  const { startDate, endDate, barLimit } = state;

  // ----- Guards: missing global state or widget id
  if (!state) {
    return <Paper sx={paperStyle}><Box sx={{ p: 2 }}>Loading global state...</Box></Paper>;
  }
  if (!widgetId) {
    return <Paper sx={paperStyle}><Box sx={{ p: 2 }}>Widget ID missing</Box></Paper>;
  }

  // ----- Widget settings pulled from global state
  const widgetSettings = (state.widgetSettings && state.widgetSettings[widgetId]) || {};

  // ----------------------------------------------------------
  // Bootstrap: ensure settings object exists for this widget
  useEffect(() => {
    if (!state.widgetSettings || !state.widgetSettings[widgetId]) {
      dispatch({
        type: 'UPDATE_WIDGET_SETTINGS',
        widgetId,
        settings: {}
      });
    }
  }, [widgetId, state.widgetSettings, dispatch]);

  // ----------------------------------------------------------
  // Local state (data, loading, and “latest request” tracking)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const latestReqId = useRef(0);
  const [lastGoodData, setLastGoodData] = useState([]);

  // ----------------------------------------------------------
  // Derived values from widget settings (persisted selections)
  const model  = widgetSettings.model  || '';
  const key    = widgetSettings.key    || '';
  const loaded = widgetSettings.loaded || false;

  // ----------------------------------------------------------
  // Helper: update current widget's settings (merge)
  const updateWidgetSettings = (updates) => {
    dispatch({
      type: 'UPDATE_WIDGET_SETTINGS',
      widgetId,
      settings: { ...widgetSettings, ...updates }
    });
  };

  // ----------------------------------------------------------
  // Fetch: station performance with request-order protection
  useEffect(() => {
    if (!loaded) return;
  }, [loaded, widgetId]);

  // ----------------------------------------------------------
  // Handlers (selection + trigger load)
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

  // ----------------------------------------------------------
  // Render: setup screen (choose model then load)
  if (!loaded) {
    return (
      <Paper sx={paperStyle}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Header
            title="Select Model for Throughput Chart"
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

  // ----------------------------------------------------------
  // Render: chart view
  return (
    <Paper sx={paperStyle}>
        <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                    {model} ({data.length} stations)
                </Typography>
                <Box sx={{...containerStyles, ...processingStyles}}>
                    <ThroughputBarChart data={data} />
                </Box>
            </CardContent>
        </Card>
    </Paper>
  );
}

const FastSwitch = React.memo(({ checked, onChange, label, color = 'primary' }) => {
  const theme = useTheme();
  
  const switchStyles = useMemo(() => ({
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      userSelect: 'none'
    },
    switch: {
      position: 'relative',
      width: '44px',
      height: '24px',
      backgroundColor: checked ? 
        (color === 'primary' ? theme.palette.primary.main : theme.palette.secondary.main) : 
        theme.palette.grey[400],
      borderRadius: '12px',
      transition: 'background-color 0.2s ease',
      border: 'none',
      cursor: 'pointer',
      outline: 'none'
    },
    thumb: {
      position: 'absolute',
      top: '2px',
      left: checked ? '22px' : '2px',
      width: '20px',
      height: '20px',
      backgroundColor: 'white',
      borderRadius: '50%',
      transition: 'left 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    },
    label: {
      fontSize: '14px',
      fontWeight: 500,
      color: theme.palette.text.primary
    }
  }), [checked, color, theme]);

  const handleClick = useCallback((e) => {
    // Create a synthetic event that matches MUI Switch structure
    const syntheticEvent = {
      ...e,
      preventDefault: () => e.preventDefault(),
      target: {
        ...e.target,
        checked: !checked
      }
    };
    onChange(syntheticEvent);
  }, [checked, onChange]);

  return (
    <div style={switchStyles.container} onClick={handleClick}>
      <div style={switchStyles.switch}>
        <div style={switchStyles.thumb} />
      </div>
      <span style={switchStyles.label}>{label}</span>
    </div>
  );
});
