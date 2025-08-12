// Global Variable Toolbar for Dashboard - Fixed prop name with debugging
import React, { useState, Component } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Header } from '../pagecomp/Header.jsx'
import { gridStyle } from '../theme/themes.js';
import { GlobalSettingsContext } from '../../data/GlobalSettingsContext.js';

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
    // Add debugging
    // console.log('WidgetManager Debug:', {
    //     widgets,
    //     widgetsLength: widgets.length,
    //     widgetsType: typeof widgets,
    //     isArray: Array.isArray(widgets)
    // });

    if (!Array.isArray(widgets) || widgets.length === 0) {
        //console.log('WidgetManager: No widgets to render');
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Header
                    title="Add Widget to Dashboard"
                    subTitle="Choose a Widget first, then select from available parameter for that Widget"
                    titleVariant="h6"
                    subTitleVariant="body2"
                    titleColor="text.secondary"
                />
            </Box>
        )
    }
    
    //console.log('WidgetManager: Rendering widgets');
    
    return (
        <Box sx={gridStyle} >
            {widgets.map(({ id, Widget }, index) => {
                // console.log(`WidgetManager: Rendering widget ${index}`, {
                //     id,
                //     Widget,
                //     WidgetName: Widget?.name,
                //     hasWidget: !!Widget
                // });
                
                return (
                    <Box key={id} sx={{ textAlign: 'center', py: 8 }}>
                        {/* Add error boundary check */}
                        {Widget ? (
                            <ErrorBoundary widgetId={id}>
                                <Widget widgetId={id} />
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