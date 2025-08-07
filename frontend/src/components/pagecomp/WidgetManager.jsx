// Global Variable Toolbar for Dashboard
import React,{useState} from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Header } from '../pagecomp/Header.jsx'
import { gridStyle } from '../theme/themes.js';
import { GlobalSettingsContext } from '../../data/GlobalSettingsContext.js';


export function WidgetManager({
    widgets=[]
}) {
    //const [widgets,setWidgets] = useState([])

    if(!Array.isArray(widgets) || widgets.length === 0){
        return(
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
    //console.log(widgets)
    return (
        <Box sx={gridStyle} >
            {widgets.map(({id,Widget})=>(
                <Box key={id} sx={{ textAlign: 'center', py: 8 }}>
                    <Widget/>
                </Box>
            ))}
        </Box>
    );
}
