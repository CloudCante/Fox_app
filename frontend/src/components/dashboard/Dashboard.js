// React Core
import React, { useMemo, useState, useCallback } from 'react';
// Material UI Components
import { Box, Modal, FormControl, Select, MenuItem, InputLabel, Typography, Button, Tabs, Tab, List, ListItem, ListItemText, Checkbox, IconButton } from '@mui/material';
import { DragIndicator, Delete } from '@mui/icons-material';
// Third Party Libraries
import 'react-datepicker/dist/react-datepicker.css';




// Page Components
import { Header } from '../pagecomp/Header.jsx';
import { DateRange } from '../pagecomp/DateRange.jsx'
// Utilities and Helpers
import { Toolbar } from '../pagecomp/Toolbar.jsx';
import { WidgetManager } from '../pagecomp/WidgetManager.jsx'
import { buttonStyle, modalStyle } from '../theme/themes.js';
// Widgets
import { widgetList } from '../../data/widgetList.js';
import { getInitialStartDate, normalizeDate } from '../../utils/dateUtils.js'
import { useWeekNavigation } from '../hooks/packingCharts/useWeekNavigation.js';
import { GlobalSettingsContext, useGlobalSettings } from '../../data/GlobalSettingsContext.js';

const ReadOnlyInput = React.forwardRef((props, ref) => (
  <input {...props} ref={ref} readOnly />
));

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}
const refreshInterval = 300000; // 5 minutes

export const Dashboard = () => {
  const { state, dispatch } = useGlobalSettings();
  const { widgets, startDate, endDate, barLimit } = state;

  // Fixed date change handlers - use dispatch instead of setStartDate/setEndDate
  const handleStartDateChange = useCallback((date) => {
    dispatch({
      type: 'SET_DATE_RANGE',
      startDate: normalizeDate.start(date),
      endDate: endDate
    });
  }, [endDate, dispatch]);

  const handleEndDateChange = useCallback((date) => {
    dispatch({
      type: 'SET_DATE_RANGE',
      startDate: startDate,
      endDate: normalizeDate.end(date)
    });
  }, [startDate, dispatch]);

  // Fixed bar limit handler
  const handleBarLimitChange = useCallback((limit) => {
    dispatch({
      type: 'SET_BAR_LIMIT',
      barLimit: limit
    });
  }, [dispatch]);

  const [singleDate, setSingleDate] = useState([]);
  const { currentISOWeekStart, handlePrevWeek, handleNextWeek, weekRange } = useWeekNavigation();
  
  // Context value for the old-style context (for Toolbar and DateRange components)
  const contextValue = useMemo(() => ({
    startDate,
    setStartDate: handleStartDateChange,
    endDate,
    setEndDate: handleEndDateChange,
    barLimit,
    setBarLimit: handleBarLimitChange,
    weekRange,
    handlePrevWeek,
    handleNextWeek,
    currentISOWeekStart
  }), [
    startDate,
    endDate,
    barLimit,
    weekRange,
    currentISOWeekStart,
    handleStartDateChange,
    handleEndDateChange,
    handleBarLimitChange
  ]);

  const tools = useMemo(() => [
    {
      id: 'date-range',
      Part: DateRange
    },
  ], []);

  const [modalInfo, setModalInfo] = useState([]);
  const [openSettings, setOpenSettings] = useState(false);
  const handleOpenSettings = () => setOpenSettings(true);
  const handleCloseSettings = () => setOpenSettings(false);
  
  const getSettingsClick = () => {
    handleOpenSettings();
  };

  const SettingsModal = () => {
    const [tabValue, setTabValue] = useState(0);
    const [selected, setSelected] = useState('');
    const [selectedForRemoval, setSelectedForRemoval] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);

    // Memoize the options array so we don't recreate on every render
    const options = useMemo(() => widgetList.map(w => w.type), []);

    const handleTabChange = (event, newValue) => { setTabValue(newValue); };

    const handleChangeSelect = e => { setSelected(e.target.value); };

    const handleAddWidget = () => {
      const widgetConfig = widgetList.find(i => i.type === selected);
      //console.log('Adding widget:', { selected, widgetConfig });
      
      if (!widgetConfig) {
        console.error('Widget config not found for type:', selected);
        return;
      }
      
      const newWidget = {
        id: Date.now(),
        type: selected, // Store the type for persistence
        Widget: widgetConfig.comp,
        position: widgets.length // For ordering
      };
      
      //console.log('New widget object:', newWidget);
      
      dispatch({ type: 'ADD_WIDGET', widget: newWidget });
      setSelected('');
      handleCloseSettings();
    };

    const handleRemovalToggle = (widgetId) => {
      setSelectedForRemoval(prev => 
        prev.includes(widgetId) 
          ? prev.filter(id => id !== widgetId)
          : [...prev, widgetId]
      );
    };

    // Fixed: use dispatch instead of setWidgets
    const handleRemoveWidgets = () => {
      dispatch({ type: 'REMOVE_WIDGETS', widgetIds: selectedForRemoval });
      setSelectedForRemoval([]);
      handleCloseSettings();
    };

    const handleDragStart = (e, index) => {
      setDraggedItem(index);
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    // Fixed: use dispatch instead of setWidgets
    const handleDrop = (e, dropIndex) => {
      e.preventDefault();
      if (draggedItem === null) return;

      const newWidgets = [...widgets];
      const draggedWidget = newWidgets[draggedItem];
      
      // Remove the dragged item
      newWidgets.splice(draggedItem, 1);
      // Insert at new position
      newWidgets.splice(dropIndex, 0, draggedWidget);
      
      dispatch({ type: 'REORDER_WIDGETS', widgets: newWidgets });
      setDraggedItem(null);
    };

    const getWidgetTypeName = (widget) => {
      // Fixed: use widget.type instead of trying to match component
      return widget.type || 'Unknown Widget';
    };

    return (
      <Modal
        open={openSettings}
        onClose={handleCloseSettings}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={{...modalStyle, width: 500, height: 400}}>
          <Typography variant="h6" component="h2" mb={2}>
            Dashboard Settings
          </Typography>
          
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tab label="Add" />
            <Tab label="Remove" />
            <Tab label="Move" />
          </Tabs>

          {/* Add Tab */}
          {tabValue === 0 && (
            <Box>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="widget-select-label">Choose Widget type</InputLabel>
                <Select
                  labelId="widget-select-label"
                  label="Choose Widget type"
                  value={selected}
                  onChange={handleChangeSelect}
                >
                  {options.map(type => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selected.length > 0 && (
                <Button 
                  sx={buttonStyle}
                  onClick={handleAddWidget}
                  fullWidth
                >
                  Add Widget
                </Button>
              )}
            </Box>
          )}

          {/* Remove Tab */}
          {tabValue === 1 && (
            <Box>
              {widgets.length === 0 ? (
                <Typography>No widgets to remove</Typography>
              ) : (
                <>
                  <List>
                    {widgets.map((widget) => (
                      <ListItem key={widget.id} dense>
                        <Checkbox
                          checked={selectedForRemoval.includes(widget.id)}
                          onChange={() => handleRemovalToggle(widget.id)}
                        />
                        <ListItemText primary={getWidgetTypeName(widget)} />
                      </ListItem>
                    ))}
                  </List>
                  {selectedForRemoval.length > 0 && (
                    <Button
                      sx={buttonStyle}
                      onClick={handleRemoveWidgets}
                      fullWidth
                      color="error"
                    >
                      Remove Selected ({selectedForRemoval.length})
                    </Button>
                  )}
                </>
              )}
            </Box>
          )}

          {/* Move Tab */}
          {tabValue === 2 && (
            <Box>
              {widgets.length === 0 ? (
                <Typography>No widgets to reorder</Typography>
              ) : (
                <List>
                  {widgets.map((widget, index) => (
                    <ListItem
                      key={widget.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      sx={{
                        cursor: 'move',
                        border: draggedItem === index ? '2px dashed #ccc' : '1px solid transparent',
                        mb: 1,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <IconButton size="small" sx={{ mr: 1 }}>
                        <DragIndicator />
                      </IconButton>
                      <ListItemText primary={`${index + 1}. ${getWidgetTypeName(widget)}`} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </Box>
      </Modal>
    );
  }
  
  return (
    <Box p={1}>
      <Header 
        title="Dashboard" 
        subTitle="Foxconn Quality Dashboard" 
        settings={true}
        settingOnClick={getSettingsClick}
      />
      {/* Keep the old context provider only for Toolbar components that need individual properties */}
      <GlobalSettingsContext.Provider value={contextValue}>
        <Toolbar toolbox={tools}/>
      </GlobalSettingsContext.Provider>
      
      {/* WidgetManager doesn't need the old context wrapper since widgets use useGlobalSettings() */}
      <WidgetManager widgets={widgets}/>   
      
      {openSettings && <SettingsModal/>}











































    </Box>
  );
};