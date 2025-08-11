import React,{ useReducer, useEffect, useContext, } from 'react';
import { getInitialStartDate, normalizeDate } from '../utils/dateUtils';
import { persistenceManager } from '../utils/persistence';

export const GlobalSettingsContext = React.createContext(null);
const initialState = {
  startDate: getInitialStartDate(7),
  endDate: normalizeDate.end(new Date()),
  barLimit: 7,
  widgets: [],
  currentPage: 'dashboard'
};

function settingsReducer(state, action) {
  switch (action.type) {
    case 'SET_DATE_RANGE':
      return { ...state, startDate: action.startDate, endDate: action.endDate };
    case 'SET_BAR_LIMIT':
      return { ...state, barLimit: action.barLimit };
    case 'ADD_WIDGET':
      return { ...state, widgets: [...state.widgets, action.widget] };
    case 'REMOVE_WIDGETS':
      return { ...state, widgets: state.widgets.filter(w => !action.widgetIds.includes(w.id)) };
    case 'REORDER_WIDGETS':
      return { ...state, widgets: action.widgets };
    case 'LOAD_SETTINGS':
      return { ...state, ...action.settings };
    case 'SET_PAGE':
      return { ...state, currentPage: action.page };
    default:
      return state;
  }
}

export const GlobalSettingsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      // Try localStorage first, then API if needed
      let settings = persistenceManager.loadLocal();
      
      // If you have user authentication, load from server
      // const userId = getCurrentUserId();
      // if (userId && !settings) {
      //   settings = await persistenceManager.loadRemote(userId);
      // }
      
      if (settings) {
        dispatch({ type: 'LOAD_SETTINGS', settings });
      }
    };
    
    loadSettings();
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    const settingsToSave = {
      startDate: state.startDate,
      endDate: state.endDate,
      barLimit: state.barLimit,
      widgets: state.widgets.map(w => ({
        id: w.id,
        type: w.type, // You'll need to add this to identify widget types
        position: w.position
      }))
    };
    
    persistenceManager.saveLocal(settingsToSave);
    
    // Optional: Also save to server
    // const userId = getCurrentUserId();
    // if (userId) {
    //   persistenceManager.saveRemote(userId, settingsToSave);
    // }
  }, [state.startDate, state.endDate, state.barLimit, state.widgets]);

  return (
    <GlobalSettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};

export const useGlobalSettings = () => {
  const context = useContext(GlobalSettingsContext);
  if (!context) {
    throw new Error('useGlobalSettings must be used within GlobalSettingsProvider');
  }
  return context;
};