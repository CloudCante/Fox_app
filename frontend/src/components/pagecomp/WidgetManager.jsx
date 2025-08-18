// Global Variable Toolbar for Dashboard - Fixed prop name with debugging
import React, { useState, Component, useEffect, useMemo } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Header } from '../pagecomp/Header.jsx'
import { gridStyle } from '../theme/themes.js';
import { GlobalSettingsContext, useGlobalSettings } from '../../data/GlobalSettingsContext.js';
import { useTestStationData } from '../hooks/widget/useTestStationData.js';

const API_BASE = process.env.REACT_APP_API_BASE;

// Error Boundary to catch widget rendering errors
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Widget Error:', error, errorInfo, 'Widget ID:', this.props.widgetId);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Typography color="error">
                    Widget Error: {this.state.error?.message || 'Unknown error'}
                </Typography>
            );
        }

        return this.props.children;
    }
}

export function WidgetManager({
    widgets = []
}) {
    const { state, dispatch } = useGlobalSettings();
    const { startDate, endDate } = state;

    // const {testStationData,loading} = useTestStationData(API_BASE,startDate,endDate);
    // useEffect(()=>{ test to confrim memo is working
    //     console.log('Station Data: ',testStationData);
    //     return;
    // },[testStationData])

    if (!Array.isArray(widgets) || widgets.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Header
                    title="Add Widget to Dashboard"
                    subTitle="Choose a Widget first, then select from available parameters for that Widget"
                    titleVariant="h6"
                    subTitleVariant="body2"
                    titleColor="text.secondary"
                />
            </Box>
        )
    }
        
    return (
        <Box sx={gridStyle} >
            {widgets.map(({ id, Widget }, index) => {             
                return (
                    <Box key={id} sx={{ textAlign: 'center', py: 8 }}>
                        {/* Add error boundary check */}
                        {Widget ? (
                            <ErrorBoundary widgetId={id}>
                                <Widget widgetId={id}/>
                            </ErrorBoundary>
                        ) : (
                            <Typography>Widget component missing for id: {id}</Typography>
                        )}
                    </Box>
                )
            })}
        </Box>
    );
}