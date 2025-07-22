import React, { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
  ListItemButton,
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GridViewIcon from '@mui/icons-material/GridView';
import TableChartIcon from '@mui/icons-material/TableChart';
import { ThemeToggle } from '../theme/ThemeToggle';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
  marginTop: '40px',
}));

const MENU_ITEMS = [
  { text: 'Dashboard', icon: <DashboardIcon />, route: '/' },
  { text: 'Test Reports', icon: <AssessmentIcon />, route: '/test-reports' },
  { text: 'SnFn Reports', icon: <GridViewIcon />, route: '/snfn' },
  { text: 'Packing', icon: <Inventory2Icon />, route: '/packing' },
  { text: 'Performance', icon: <SpeedIcon />, route: '/performance' },
  { text: 'Throughput', icon: <TrendingUpIcon />, route: '/throughput' },
  { text: 'Cells Throughput', icon: <GridViewIcon />, route: '/cellThroughput' },
  { text: 'Station Hourly Summary', icon: <TableChartIcon />, route: '/station-hourly-summary' },
];

const DEV_MENU_ITEMS = [
  { text: 'File Upload', icon: <CloudUploadIcon />, route: '/dev/upload' }
];

const menuIcons = {
  dashboard: <DashboardIcon />,
  reports: <AssessmentIcon />,
  snfn: <AssessmentIcon />,
  packing: <Inventory2Icon />,
  performance: <SpeedIcon />
};

const MenuItem = React.memo(({ item, onClose }) => (
  <ListItem disablePadding>
    <ListItemButton 
      component={Link} 
      to={item.route}
      onClick={onClose}
    >
      <ListItemIcon sx={{ color: 'white' }}>
        {item.icon}
      </ListItemIcon>
      <ListItemText primary={item.text} />
    </ListItemButton>
  </ListItem>
));

const MenuList = React.memo(({ onClose }) => (
  <List>
    {MENU_ITEMS.map((item) => (
      <MenuItem key={item.text} item={item} onClose={onClose} />
    ))}
    {process.env.NODE_ENV === 'development' && (
      <>
        <ListItem sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.12)', mt: 2, pt: 2 }}>
          <ListItemText 
            primary="Development"
            primaryTypographyProps={{ 
              variant: 'overline',
              sx: { opacity: 0.7 }
            }}
          />
        </ListItem>
        {DEV_MENU_ITEMS.map((item) => (
          <MenuItem key={item.text} item={item} onClose={onClose} />
        ))}
      </>
    )}
  </List>
));

export const SideDrawer = React.memo(({ open, onClose }) => {
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  useEffect(() => {
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
      setIsLowEndDevice(true);
      return;
    }
    
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
      setIsLowEndDevice(true);
      return;
    }
    
    if (isMobile) {
      setIsLowEndDevice(true);
    }
  }, [isMobile]);

  const drawerStyle = useMemo(() => ({
    width: 240,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: 240,
      boxSizing: 'border-box',
      backgroundColor: '#1e3a5f',
      color: 'white',
      borderRight: 'none',
    },
  }), []);

  const transitionDuration = useMemo(() => {
    if (isLowEndDevice) {
      return { enter: 0, exit: 0 };
    }
    return { enter: 225, exit: 175 };
  }, [isLowEndDevice]);

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      keepMounted={false}
      disableScrollLock
      transitionDuration={transitionDuration}
      BackdropProps={{
        invisible: isLowEndDevice, 
      }}
      ModalProps={{
        keepMounted: false,
        disableScrollLock: true,
        disablePortal: true,
        BackdropProps: { 
          transitionDuration: isLowEndDevice ? 0 : 225
        }
      }}
      sx={drawerStyle}
      SlideProps={{
        style: {
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }
      }}
    >
      <DrawerHeader>
        <Typography variant="h6" component="div">
          Menu
        </Typography>
        <ThemeToggle />
      </DrawerHeader>
      <MenuList onClose={onClose} />
    </Drawer>
  );
}); 