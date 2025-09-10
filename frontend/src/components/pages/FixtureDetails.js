import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Card, CardContent, CardHeader, CircularProgress, Container, Divider, FormControl, InputLabel, MenuItem, Select, Typography, Alert, Stack, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab
} from '@mui/material';
import { DateRange } from '../pagecomp/DateRange';
import { useNavigate } from 'react-router-dom';
import PChart from '../charts/PChart';
import { Header } from '../pagecomp/Header';
import {LineChart} from '../charts/LineChart.js';
import { PieChart } from '../charts/PieChart.js';
import { testFixtureData,testFixtureStatusData, testFixtureAvailabilityData,testFixtureUsageData,testFixtureFailureData } from '../../data/sampleData.js';

const FixtureDetails = () => {

    const availability = 99;
    const usage = 75;
    const failureRate = 2.5;
    const slot = 0

    const tableData = testFixtureStatusData;
    const [value, setValue] = React.useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    
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
                title="Fixture Station Details"
                subTitle={`Detail Reports for Monitoring Fixture Stations`}
                />
            </Box>


            <Grid container spacing={4}>
                <Grid size={2}>
                <Card>
                    <CardHeader title="Current Health" />
                    <CardContent>
                        <Typography variant="h4" component="div" color={availability > 90 ? 'green' : availability > 75 ? 'orange' : 'red'}>
                            {availability}%
                        </Typography>
                    </CardContent>
                </Card>
                </Grid>
                <Grid size={2}>
                <Card>
                    <CardHeader title="Current Usage" />
                    <CardContent>
                        <Typography variant="h4" component="div" color={usage > 90 ? 'red' : usage > 75 ? 'orange' : 'green'}>
                            {usage}%
                        </Typography>
                    </CardContent>
                </Card>
                </Grid>
                <Grid size={2}>
                <Card>
                    <CardHeader title="Failure Rate" />
                    <CardContent>
                        <Typography variant="h4" component="div" color={failureRate > 90 ? 'red' : failureRate > 75 ? 'orange' : 'green'}>
                            {failureRate}%
                        </Typography>
                    </CardContent>
                </Card>
                </Grid>
                <Grid size={6}>
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
                            <TableRow
                            key={testFixtureStatusData[slot].name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                            <TableCell component="th" scope="row">
                                {testFixtureStatusData[slot].name}
                            </TableCell>
                            <TableCell align="right">{testFixtureStatusData[slot].rack}</TableCell>
                            <TableCell align="right">{testFixtureStatusData[slot].sn}</TableCell>
                            <TableCell align="right">{testFixtureStatusData[slot].status}</TableCell>
                            <TableCell align="right">{testFixtureStatusData[slot].lastBeat}</TableCell>
                            <TableCell align="right">{testFixtureStatusData[slot].type}</TableCell>
                            <TableCell align="right">placeholder</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                </Grid>
            </Grid>
            <Tabs value={value} onChange={handleChange} centered>
                <Tab label="Availability" />
                <Tab label="Usage" />
                <Tab label="Failure Rate" />
            </Tabs>
            {value === 0 && <Box p={3}>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Fixture_ID</TableCell>
                            <TableCell align="right">EventType</TableCell>
                            <TableCell align="right">Outage_Time</TableCell>
                            <TableCell align="right">Comments</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {testFixtureAvailabilityData.map((row) => (
                        <TableRow
                        key={row.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                        <TableCell component="th" scope="row">
                            {row.date}
                        </TableCell>
                        <TableCell align="right">{row.id}</TableCell>
                        <TableCell align="right">{row.eventType}</TableCell>
                        <TableCell align="right">{row.outTime}</TableCell>
                        <TableCell align="right">{row.comments}</TableCell>
                        <TableCell align="right">placeholder</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
            </Box>}
            {value === 1 && <Box p={3}>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Fixture_ID</TableCell>
                            <TableCell align="right">Test_Type</TableCell>
                            <TableCell align="right">Usage</TableCell>
                            <TableCell align="right">Alarm</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {testFixtureUsageData.map((row) => (
                        <TableRow
                        key={row.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                        <TableCell component="th" scope="row">
                            {row.date}
                        </TableCell>
                        <TableCell align="right">{row.id}</TableCell>
                        <TableCell align="right">{row.testType}</TableCell>
                        <TableCell align="right">{row.usage}</TableCell>
                        <TableCell align="right">{row.alarm}</TableCell>
                        <TableCell align="right">placeholder</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
            </Box>}
            {value === 2 && <Box p={3}>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Fixture_ID</TableCell>
                            <TableCell align="right">Test_Type</TableCell>
                            <TableCell align="right">Top_Error</TableCell>
                            <TableCell align="right">Count</TableCell>
                            <TableCell align="right">FailureRate</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {testFixtureFailureData.map((row) => (
                        <TableRow
                        key={row.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                        <TableCell component="th" scope="row">
                            {row.date}
                        </TableCell>
                        <TableCell align="right">{row.id}</TableCell>
                        <TableCell align="right">{row.testType}</TableCell>
                        <TableCell align="right">{row.topError}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                        <TableCell align="right">{row.failureRate}</TableCell>
                        <TableCell align="right">placeholder</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
            </Box>}
           
        </Container>
    );
};

export default FixtureDetails;