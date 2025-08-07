// React Core
import React, { useMemo, useState, useRef } from 'react';
// Material UI Components
import { Box, Modal, FormControl, Select, MenuItem, InputLabel, Typography, Button } from '@mui/material';
// Third Party Libraries
import 'react-datepicker/dist/react-datepicker.css';
// Page Components
import { Header } from '../pagecomp/Header.jsx';
// Utilities and Helpers
import { Toolbar } from '../pagecomp/Toolbar.jsx';
import { WidgetManager } from '../pagecomp/WidgetManager.jsx'
import { TestWidget } from '../pagecomp/widget/TestWidget.jsx';
import { buttonStyle, modalStyle } from '../theme/themes.js';
import { widgetList } from '../../data/dataTables.js';
// Widgets
import { TestStationWidget } from '../pagecomp/widget/TestStationWidget.jsx';
import { FixtureStationWidget } from '../pagecomp/widget/FixtureStationWidget.jsx';
import { PackingChartWidget } from '../pagecomp/widget/PackingChartWidget.jsx'
import { ParetoWidget } from '../pagecomp/widget/ParetoWidget.jsx';


const ReadOnlyInput = React.forwardRef((props, ref) => (
  <input {...props} ref={ref} readOnly />
));
const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}
console.log('API_BASE:', API_BASE);

const refreshInterval = 300000; // 5 minutes



export const Dashboard = () => {
  const [widgets,setWidgets] = useState([]);
  const [tools,setTools] = useState([]);

  // placeholders for global vars
  const [startDate,setStartDate] = useState([]);
  const [endDate,setEndDate] = useState([]);
  const [singleDate,setSingleDate] = useState([]);
  const [barLimit,setBarLimit] = useState([]);
  
  const [modalInfo, setModalInfo] = useState([]);
  const [openSettings, setOpenSettings] = useState(false);
  const handleOpenSettings = () => setOpenSettings(true);
  const handleCloseSettings = () => setOpenSettings(false);
  
  const getSettingsClick = () => {
    handleOpenSettings();
  };

  const SettingsModal=()=>{
    const [selected,setSelected] = useState('');
    const [selectedParams,setSelectedParams] = useState([])

    // Memoize the options array so we don’t recreate on every render
    const options = useMemo(
      () => widgetList.map(w => w.type),
      [widgetList]
    );
    const currentParams = useMemo(() => {
      const w = widgetList.find(w => w.type === selected);
      return w?.params ?? [];
    }, [widgetList, selected]);
    const currentTools = useMemo(() => {
      const w = widgetList.find(w => w.type === selected);
      return w?.tools ?? [];
    }, [widgetList, selected]);

    const handleChangeSelect = e => {
      setSelected(e.target.value);
      setSelectedParams([]);
      // …you could also bubble this up via a prop callback here
    };
    const handleAddWidget = () => {
      let v = widgets.length || 0;
      let newWidg = null;
      if(selected===widgetList[0].type){newWidg = <TestStationWidget/>;}
      else if(selected===widgetList[1].type){newWidg = <FixtureStationWidget/>;}
      else if(selected===widgetList[3].type){newWidg = <PackingChartWidget/>;}
      else if(selected===widgetList[4].type){newWidg = <ParetoWidget/>;}
      else{newWidg = <TestWidget value={v}/>;}
      //console.log(newWidg)
      setWidgets(prev => [
        ...prev,
        {id:v,widget:newWidg}
      ]);
      handleCloseSettings();
    };
    return (
      <Modal
        open={openSettings}
        onClose={handleCloseSettings}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <FormControl fullWidth>
            <InputLabel id="widget-select-label">Choose Widget type</InputLabel>
            <Select
              label="Choose Widget type"
              value = {selected}
              onChange={handleChangeSelect}
            >
              {options.map(type =>(
                <MenuItem key={type}value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selected.length >0 &&(
            <Button 
            sx={buttonStyle}
            onClick={handleAddWidget}
            >
                Add Widget
            </Button>
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
      <Toolbar toolbox={tools}/>
      <WidgetManager widgets={widgets}/>      
      {openSettings && <SettingsModal/>}
    </Box>
  );
};