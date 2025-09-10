import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Card, CardContent, CardHeader, CircularProgress, Container, Divider, FormControl, InputLabel, MenuItem, Select, Typography, Alert, Stack, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import {LineChart} from '../charts/LineChart.js';
import { PieChart } from '../charts/PieChart.js';
import { Header } from '../pagecomp/Header';
import { testFixtureData,testFixtureStatusData } from '../../data/sampleData.js';
import { gridStyle } from '../theme/themes.js';

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
                subTitle={`Dashboard for Monitoring Fixture Stations`}
                />
            </Box>


            <Grid container spacing={3} >
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
                        label="Fixture Station Current Status"
                        data={pieData}
                        loading={false}
                    />
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Fixture_Name</TableCell>
                            <TableCell align="right">Rack</TableCell>
                            <TableCell align="right">Fixture_SN</TableCell>
                            <TableCell align="right">Current_Status</TableCell>
                            <TableCell align="right">Last_Heartbeat_Time</TableCell>
                            <TableCell align="right">Test_Type</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {testFixtureStatusData.map((row) => (
                        <TableRow
                        key={row.name}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                        <TableCell component="th" scope="row">
                            {row.name}
                        </TableCell>
                        <TableCell align="right">{row.rack}</TableCell>
                        <TableCell align="right">{row.sn}</TableCell>
                        <TableCell align="right">{row.status}</TableCell>
                        <TableCell align="right">{row.lastBeat}</TableCell>
                        <TableCell align="right">{row.type}</TableCell>
                        <TableCell align="right">placeholder</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
           
        </Container>
    );
};

export default FixtureDash;