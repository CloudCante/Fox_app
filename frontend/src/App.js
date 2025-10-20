import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { DashboardThemeProvider } from './components/theme/ThemeContext';
import { SideDrawer } from './components/navigation/SideDrawer';
import { AppHeader } from './components/navigation/AppHeader';
// Page Components
import { Dashboard } from './components/pages/Dashboard';
import Home from './components/pages/Home';
// Quality Pages
import PackingPage from './components/pages/quality/PackingPage';
import PerformancePage from './components/pages/quality/performance/PerformancePage';
import TestStationPerformancePage from './components/pages/quality/TestStationPerformancePage';
import ThroughputPage from './components/pages/quality/performance/ThroughputPage';
import SNFNPage from './components/pages/quality/stationReports/SNFNPage';
import PackingCharts from './components/pages/quality/PackingCharts';
import UploadPage from './components/pages/dev/uploadPage';
import StationHourlySummaryPage from './components/pages/quality/stationReports/StationHourlySummaryPage';
import ParetoPage from './components/pages/quality/ParetoPage';
// Test Engineer Pages
import FixtureDash from './components/pages/te/FixtureDash';
import FixtureDetails from './components/pages/te/FixtureDetails';
import FixtureInventory from './components/pages/te/FixtureInventory';
// Dev Pages
import StationCycleTime from './components/pages/dev/CycleTime';
import MostRecentFail from './components/pages/dev/MostRecentFail';
import ByErrorCode from './components/pages/dev/ByErrorCode';
import JsonToCsv from './components/pages/dev/JsonToCSV';
import DidTheyFail from './components/pages/dev/DidTheyFail';

import { SimplePerformanceMonitor } from './components/debug/SimplePerformanceMonitor';
import { isLowEndDevice, LightweightBackdrop } from './utils/muiOptimizations';
import './components/theme/theme.css';
import { GlobalSettingsProvider } from './data/GlobalSettingsContext';

const MainContent = React.memo(({ children }) => {
  const mainContentStyle = useMemo(() => ({ 
    flexGrow: 1, 
    p: 3, 
    minHeight: '100vh', 
    paddingTop: '64px',
    backgroundColor: 'background.default'
  }), []);

  return (
    <Box component="main" sx={mainContentStyle}>
      {children}
    </Box>
  );
});

const AppRoutes = React.memo(() => (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Home />} />
      <Route path="/packing" element={<PackingPage />} />
      <Route path="/performance" element={<PerformancePage />} />
      <Route path="/throughput" element={<ThroughputPage />} />
      <Route path="/snfn" element={<SNFNPage />} />
      <Route path="/packing-charts" element={<PackingCharts />} />
      <Route path="/station-hourly-summary" element={<StationHourlySummaryPage />} />
      <Route path="/cycle-time" element={<StationCycleTime />} />
      <Route path="/most-recent-fail" element={<MostRecentFail />} />
      <Route path="/pareto" element={<ParetoPage />} />
      <Route path="/station-performance" element={<TestStationPerformancePage/>}/>
      <Route path="/by-error" element={<ByErrorCode/>}/>
      <Route path="/json-to-csv" element={<JsonToCsv/>}/>
      <Route path="/did-they-fail" element={<DidTheyFail/>}/>
      <Route path="/fixture-dash" element={<FixtureDash/>}/>
      <Route path="/fixture-details" element={<FixtureDetails/>}/>
      <Route path="/fixture-inventory" element={<FixtureInventory/>}/>
      {process.env.NODE_ENV === 'development' && (
        <Route path="/dev/upload" element={<UploadPage />} />
      )}
    </Routes>
));

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);
  
  useEffect(() => {
    setIsLowEnd(isLowEndDevice());
  }, []);

  const handlersRef = useRef({
    toggleDrawer: () => setDrawerOpen(prev => !prev),
    closeDrawer: () => setDrawerOpen(false)
  });

  const backdrop = useMemo(() => {
    if (isLowEnd && drawerOpen) {
      return <LightweightBackdrop open={drawerOpen} onClose={handlersRef.current.closeDrawer} />;
    }
    return null;
  }, [drawerOpen, isLowEnd]);

  return (
    <GlobalSettingsProvider>
    <DashboardThemeProvider>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppHeader onMenuClick={handlersRef.current.toggleDrawer} />
        {backdrop}
        <SideDrawer 
          open={drawerOpen} 
          onClose={handlersRef.current.closeDrawer} 
        />
        <MainContent>
          <AppRoutes />
        </MainContent>
        <SimplePerformanceMonitor />
      </Box>
    </DashboardThemeProvider>
    </GlobalSettingsProvider>
  );
}

export default App; 