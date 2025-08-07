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
import { TestWidget } from '../pagecomp/widget/TestWidget.jsx';
import { buttonStyle, modalStyle } from '../theme/themes.js';
//import { widgetList } from '../../data/dataTables.js';
// Widgets
import { TestStationWidget } from '../pagecomp/widget/TestStationWidget.jsx';
import { FixtureStationWidget } from '../pagecomp/widget/FixtureStationWidget.jsx';
import { PackingChartWidget } from '../pagecomp/widget/PackingChartWidget.jsx'
import { ParetoWidget } from '../pagecomp/widget/ParetoWidget.jsx';
import { getInitialStartDate, normalizeDate } from '../../utils/dateUtils.js'
import { useWeekNavigation } from '../hooks/packingCharts/useWeekNavigation.js';
import { GlobalSettingsContext } from '../../data/GlobalSettingsContext.js';




const ReadOnlyInput = React.forwardRef((props, ref) => (
  <input {...props} ref={ref} readOnly />
));
const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}
console.log('API_BASE:', API_BASE);

const refreshInterval = 300000; // 5 minutes

const widgetList = [
  {type:"Station performance chart",comp:TestStationWidget,tools:["dateRange","barLimit"]},
  {type:"Fixture performance chart",comp:FixtureStationWidget,tools:["dateRange","barLimit"]},
  {type:"Packing output table",comp:TestWidget,tools:["dateRange"]},
  {type:"Packing chart",comp:PackingChartWidget,tools:["weekRange"]},
  {type:"Pareto chart",comp:ParetoWidget,tools:["dateRange","barLimit"]},
];

export const Dashboard = () => {
  const [widgets,setWidgets] = useState([]);

  // Global Vars
  const [startDate,setStartDate] = useState(getInitialStartDate(7));
  const [endDate,setEndDate] = useState(normalizeDate.end(new Date()));
  const handleStartDateChange = useCallback((date) => {
    setStartDate(normalizeDate.start(date));
  }, []);
  const handleEndDateChange = useCallback((date) => {
    setEndDate(normalizeDate.end(date));
  }, []);
  const [singleDate,setSingleDate] = useState([]);
  const [barLimit,setBarLimit] = useState(7);
  const { currentISOWeekStart, handlePrevWeek, handleNextWeek, weekRange } = useWeekNavigation();
  
  // Global Context
  const contextValue = useMemo(()=>({
    startDate,setStartDate:handleStartDateChange,endDate,setEndDate:handleEndDateChange,barLimit,setBarLimit,weekRange,handlePrevWeek,handleNextWeek
  }),[
    startDate,endDate,barLimit,weekRange
  ])

  const tools = useMemo(() => [
    {
      id: 'date-range',
      Part: DateRange
    },
  ], [startDate, endDate, handleStartDateChange, handleEndDateChange]);
  
  const [modalInfo, setModalInfo] = useState([]);
  const [openSettings, setOpenSettings] = useState(false);
  const handleOpenSettings = () => setOpenSettings(true);
  const handleCloseSettings = () => setOpenSettings(false);
  
  const getSettingsClick = () => {
    handleOpenSettings();
  };

  const SettingsModal=()=>{
    const [tabValue, setTabValue] = useState(0);
    const [selected, setSelected] = useState('');
    const [selectedForRemoval, setSelectedForRemoval] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);

    // Memoize the options array so we don't recreate on every render
    const options = useMemo(() => widgetList.map(w => w.type), []);

    const handleTabChange = (event, newValue) => { setTabValue(newValue); };

    const handleChangeSelect = e => { setSelected(e.target.value); };

    const handleAddWidget = () => {
      const newWidg = widgetList[widgetList.findIndex(i=>i.type===selected)].comp;
      setWidgets(prev => [
        ...prev,
        {id:Date.now(),Widget:newWidg}
      ]);
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

    const handleRemoveWidgets = () => {
      setWidgets(prev => prev.filter(widget => !selectedForRemoval.includes(widget.id)));
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

    const handleDrop = (e, dropIndex) => {
      e.preventDefault();
      if (draggedItem === null) return;

      const newWidgets = [...widgets];
      const draggedWidget = newWidgets[draggedItem];
      
      // Remove the dragged item
      newWidgets.splice(draggedItem, 1);
      // Insert at new position
      newWidgets.splice(dropIndex, 0, draggedWidget);
      
      setWidgets(newWidgets);
      setDraggedItem(null);
    };

    const getWidgetTypeName = (widget) => {
      const widgetType = widgetList.find(w => w.comp === widget.Widget);
      return widgetType ? widgetType.type : 'Unknown Widget';
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
                  {options.map(type =>(
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
        settingOnClick = {getSettingsClick}
      />
      <GlobalSettingsContext.Provider value={contextValue}>
        <Toolbar toolbox={tools}/>
        <WidgetManager widgets={widgets}/>   
      </GlobalSettingsContext.Provider>   
      {openSettings && <SettingsModal/>}
    </Box>
  );
};