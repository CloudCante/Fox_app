import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Card, CardContent, CardHeader, CircularProgress, Container,
  Divider, FormControl, InputLabel, MenuItem,
  Select, Typography, Alert, Stack
} from '@mui/material';
import { DateRange } from '../pagecomp/DateRange';
import { useNavigate } from 'react-router-dom';
import PChart from '../charts/PChart';
import { Header } from '../pagecomp/Header';
import { normalizeDate, getInitialStartDate } from '../../utils/dateUtils.js';

const FixtureDetails = () => {


    return (
        <Container maxWidth="xl">
            <Box>
                <Header
                title="Fixture Station Details"
                subTitle={`Details Report for Fixture Stations`}
                />
            </Box>

            <Divider />

           
        </Container>
    );
};

export default FixtureDetails;