import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Card, CardContent, CardHeader, CircularProgress, Container,
  Divider, FormControl, InputLabel, MenuItem,
  Select, Typography, Alert, Stack, Grid
} from '@mui/material';
import { DateRange } from '../pagecomp/DateRange';
import { useNavigate } from 'react-router-dom';
import PChart from '../charts/PChart';
import {LineChart} from '../charts/LineChart.js';
import { PieChart } from '../charts/PieChart.js';
import { Header } from '../pagecomp/Header';
import { normalizeDate, getInitialStartDate } from '../../utils/dateUtils.js';
import { testFixtureData,testFixtureStatusData } from '../../data/sampleData.js';
import { Pie } from 'recharts';

const FixtureDash = () => {
    const currentHealth = 99;
    const currentUsage = 75;

    const tableData = testFixtureStatusData;
    
    const pieData = useMemo(() => {
        if (!Array.isArray(tableData)) return [];
        const counts = tableData.reduce((acc, item) => {
            const key = item.status || 'Unknown';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([status, value]) => ({ status, value }));
    }, [tableData]);

    return (
        <Container maxWidth="xl">
            <Box>
                <Header
                title="Fixture Station Dashboard"
                subTitle={`Secondary Dashboard for Monitoring Fixture Stations`}
                />
            </Box>


            <Grid container spacing={3}>
                <Grid size={2}>
                    <Stack spacing={2} mb={2}>
                        <Card>
                            <CardHeader title="Current Health" />
                            <CardContent>
                                <Typography variant="h4" component="div" color={currentHealth > 90 ? 'green' : currentHealth > 75 ? 'orange' : 'red'}>
                                    {currentHealth}%
                                </Typography>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader title="Current Usage" />
                            <CardContent>
                                <Typography variant="h4" component="div" color={currentUsage > 90 ? 'red' : currentUsage > 75 ? 'orange' : 'green'}>
                                    {currentUsage}%
                                </Typography>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
                <Grid size={5}>
                    <LineChart 
                        label="Fixture Station Status Over Time"
                        data={testFixtureData} 
                        loading={false} 
                    />
                </Grid>
                <Grid size={5}>
                    <PieChart
                        label="Fixture Station Status"
                        data={pieData}
                        loading={false}
                    />
                </Grid>
            </Grid>
           
        </Container>
    );
};

export default FixtureDash;