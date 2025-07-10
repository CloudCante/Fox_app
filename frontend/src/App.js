import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { DashboardThemeProvider } from './components/theme/ThemeContext';
import { SideDrawer } from './components/navigation/SideDrawer';
import { AppHeader } from './components/navigation/AppHeader';
import { Dashboard } from './components/dashboard/Dashboard';
import PackingPage from './components/pages/PackingPage';
import PerformancePage from './components/pages/PerformancePage';
import ThroughputPage from './components/pages/ThroughputPage';
import SNFNPage from './components/pages/SNFNPage';
import PackingCharts from './components/pages/PackingCharts';
import UploadPage from './components/pages/uploadPage';
import { SimplePerformanceMonitor } from './components/debug/SimplePerformanceMonitor';
import { isLowEndDevice, LightweightBackdrop } from './utils/muiOptimizations';
// Import CSS for optimized theme switching
import './components/theme/theme.css';

// Main content layout extracted as a separate component for targeted memoization
// This prevents the main content from re-rendering when only the drawer state changes
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

// Routes component separated to prevent unnecessary re-renders
// Routes should only re-render when the actual routes change, not on drawer toggle
const AppRoutes = React.memo(() => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/packing" element={<PackingPage />} />
    <Route path="/performance" element={<PerformancePage />} />
    <Route path="/throughput" element={<ThroughputPage />} />
    <Route path="/snfn" element={<SNFNPage />} />
    <Route path="/packing-charts" element={<PackingCharts />} />
    {process.env.NODE_ENV === 'development' && (
      <Route path="/dev/upload" element={<UploadPage />} />
    )}
  </Routes>
));

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);
  
  // Check device capabilities once on mount to optimize for device
  useEffect(() => {
    setIsLowEnd(isLowEndDevice());
  }, []);

  // Create persistent handler functions with stable references
  // This is better than useCallback because the references never change
  const handlersRef = useRef({
    toggleDrawer: () => setDrawerOpen(prev => !prev),
    closeDrawer: () => setDrawerOpen(false)
  });

  // Use lightweight backdrop for low-end devices
  // This is a performance optimization that avoids expensive MUI backdrop
  const backdrop = useMemo(() => {
    if (isLowEnd && drawerOpen) {
      return <LightweightBackdrop open={drawerOpen} onClose={handlersRef.current.closeDrawer} />;
    }
    return null;
  }, [drawerOpen, isLowEnd]);

  return (
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
  );
}

export default App; 