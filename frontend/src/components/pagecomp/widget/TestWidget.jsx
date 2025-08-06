// Global Variable Toolbar for Dashboard
import React,{useState} from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Header } from '../../pagecomp/Header.jsx'
import { gridStyle } from '../../theme/themes.js';


export function TestWidget({ value
}) {
    return (
        <Box sx={{ textAlign: 'center', py: 8 }} >
            <Header title="this is a test" subTitle={value}/>
        </Box>
    );
}
