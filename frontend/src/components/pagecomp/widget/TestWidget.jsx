// Global Variable Toolbar for Dashboard
import React,{useState} from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Header } from '../../pagecomp/Header.jsx'
import { gridStyle, paperStyle } from '../../theme/themes.js';


export function TestWidget({ value
}) {
    return (
        <Paper sx={paperStyle}>
            <Box sx={{ textAlign: 'center', py: 8 }} >
                <Header title="This is a test Widget" subTitle={` Widget: ${value}`}/>
            </Box>
        </Paper>
    );
}
