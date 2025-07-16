import React, { useMemo } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

// Pre-render the icon to prevent recreation on each render cycle
// This is a significant optimization for SVG icons
const MenuIconElement = <MenuIcon />;

// Memoize the typography component to prevent re-renders
// This never needs to update so it's a perfect memoization candidate
const AppTitle = React.memo(() => {
  const version = window?.electronApp?.getVersion?.() || '0.0.0';
  return(
  <Typography variant="h6" noWrap component="div">
    Quality Dashboard
    <Typography component="sub" variant="caption" sx={{ marginLeft: 0.5 }}>
      v{version}
    </Typography>
  </Typography>
  );
});

// Memoize the menu button to optimize the critical interaction path
// This is the component that was causing most of the lag
const MenuButton = React.memo(({ onClick, style }) => (
  <IconButton
    color="inherit"
    aria-label="open drawer"
    edge="start"
    onClick={onClick}
    sx={style}
  >
    {MenuIconElement}
  </IconButton>
));

export const AppHeader = React.memo(({ onMenuClick }) => {
  // Memoize styles to prevent recreation on every render
  // Style objects should always be memoized to reduce GC pressure
  const appBarStyle = useMemo(() => ({
    zIndex: (theme) => theme.zIndex.drawer + 1,
    backgroundColor: '#1e3a5f',
    boxShadow: 'none',
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
  }), []);

  const toolbarStyle = useMemo(() => ({
    WebkitAppRegion: 'drag',
    userSelect: 'none',
  }), []);

  const menuButtonStyle = useMemo(() => ({
    mr: 2,
    WebkitAppRegion: 'no-drag'
  }), []);

  return (
    <AppBar
      position="fixed"
      sx={appBarStyle}
    >
      <Toolbar
        variant="dense"
        sx={toolbarStyle}
      >
        <MenuButton onClick={onMenuClick} style={menuButtonStyle} />
        <AppTitle />
      </Toolbar>
    </AppBar>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if function reference changes
  // This prevents unnecessary renders when parent components update
  return prevProps.onMenuClick === nextProps.onMenuClick;
}); 