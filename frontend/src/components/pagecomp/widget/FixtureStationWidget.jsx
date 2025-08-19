// Widget for Fixture Reports
// ------------------------------------------------------------
// Imports (grouped by purpose)
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { FixtureFailParetoChart } from '../../charts/FixtureFailParetoChart.js';
import { fetchFixtureQuery } from '../../../utils/queryUtils.js';
import { useGlobalSettings } from '../../../data/GlobalSettingsContext.js';
import { Paper, Box } from '@mui/material';
import { paperStyle } from '../../theme/themes.js';

// ------------------------------------------------------------
// Constants & configuration
const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

// ------------------------------------------------------------
// Component
export function FixtureStationWidget({ widgetId }) {
  // ----- Global settings context & basic guards
  const { state, dispatch } = useGlobalSettings();
  const { startDate, endDate } = state;

  // Early return if global state or widgetId isn’t ready (kept as-is)
  if (!state) {
    return <Paper sx={paperStyle}><Box sx={{ p: 2 }}>Loading global state...</Box></Paper>;
  }
  if (!widgetId) {
    return <Paper sx={paperStyle}><Box sx={{ p: 2 }}>Widget ID missing</Box></Paper>;
  }

  // ----- Widget-scoped settings pulled from global state
  const widgetSettings = (state.widgetSettings && state.widgetSettings[widgetId]) || {};

  // ----------------------------------------------------------
  // Effects: ensure widget settings object exists in global store
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
  // Local state (data + loading flag)
  const [fixtureData, setFixtureData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------
  // Data fetching: query fixtures for the current date range
  useEffect(() => {
    // Polling loop with safety guard to avoid state updates after unmount
    let isActive = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchFixtureQuery({
          startDate,
          endDate,
          key: 'fixtures',
          setDataCache: data => {
            if (isActive) setFixtureData(data);
          },
          API_BASE,
          API_Route: '/api/functional-testing/fixture-performance?'
        });
      } catch (err) {
        console.error('Error fetching data', err);
        if (isActive) setFixtureData([]);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchData();                         // initial fetch
    const intervalId = setInterval(fetchData, 300000); // refresh every 5 min

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [startDate, endDate]);

  // ----------------------------------------------------------
  // Render: pareto chart of fixture performance
  return (
    <FixtureFailParetoChart
      label="Fixture Performance"
      data={fixtureData}
      loading={loading}
    />
  );
}
