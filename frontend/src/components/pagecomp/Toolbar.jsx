// Global Variable Toolbar for Dashboard
// import { MultiMenu } from '../MultiMenu.jsx';
// import { MultiFilter } from '../MultiFilter.jsx';
// import { DateRange } from '../DateRange.jsx'
// import { NumberRange } from '../NumberRange.jsx';
import React,{useState} from 'react';
import { Box, Button, Typography } from '@mui/material';
import { toolbarStyle } from '../theme/themes';


export function Toolbar({
    toolbox
}) {
    //const [toolbox,setToolbox] = useState([])

    if(!Array.isArray(toolbox) || toolbox.length === 0){
        return;
    };

    return (
        <Box sx={toolbarStyle} >
            {toolbox.map(tool=>(
                <Typography>
                    {tool.type} - {tool.param}
                </Typography>
            ))}
        </Box>
    );
}
