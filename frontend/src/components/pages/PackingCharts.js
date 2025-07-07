import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import PackingOutputBarChart from '../charts/PackingOutputBarChart';
import { Box, FormGroup, FormControlLabel, Checkbox, Typography, CircularProgress } from '@mui/material';
import { startOfISOWeek, endOfISOWeek, addWeeks, format, parseISO, getISOWeek, getISOWeekYear, subWeeks } from 'date-fns';

const API_BASE = process.env.REACT_APP_API_BASE;

const ALL_MODELS = [
  { label: 'Tesla SXM4', value: 'SXM4' },
  { label: 'Tesla SXM5', value: 'SXM5' },
];

const sxm4Parts = [
  '692-2G506-0200-006', '692-2G506-0200-0R6', '692-2G506-0210-006', '692-2G506-0212-0R5',
  '692-2G506-0212-0R7', '692-2G506-0210-0R6', '692-2G510-0200-0R0', '692-2G510-0210-003',
  '692-2G510-0210-0R2', '692-2G510-0210-0R3', '965-2G506-0031-2R0', '965-2G506-0130-202',
  '965-2G506-6331-200',
];
const sxm5Parts = [
  '692-2G520-0200-000', '692-2G520-0200-0R0', '692-2G520-0200-500', '692-2G520-0200-5R0',
  '692-2G520-0202-0R0', '692-2G520-0280-001', '692-2G520-0280-0R0', '692-2G520-0280-000',
  '692-2G520-0280-0R1', '692-2G520-0282-001', '965-2G520-0041-000', '965-2G520-0100-001',
  '965-2G520-0100-0R0', '965-2G520-0340-0R0', '965-2G520-0900-000', '965-2G520-0900-001',
  '965-2G520-0900-0R0', '965-2G520-6300-0R0', '965-2G520-A500-000', '965-2G520-A510-300',
  '692-2G520-0221-5R0',
];
const partToModel = {};
sxm4Parts.forEach(p => partToModel[p] = 'SXM4');
sxm5Parts.forEach(p => partToModel[p] = 'SXM5');

function getDateRangeArray(start, end) {
  const arr = [];
  let current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    arr.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return arr;
}

const PackingCharts = () => {
  const navigate = useNavigate();
  const [selectedModels, setSelectedModels] = useState(['SXM4', 'SXM5']);
  const [currentISOWeekStart, setCurrentISOWeekStart] = useState(format(startOfISOWeek(new Date()), 'yyyy-MM-dd'));
  const [chartData, setChartData] = useState([]);
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [showTrendLine, setShowTrendLine] = useState(false);
  const [showAvgLine, setShowAvgLine] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle model checkbox change
  const handleModelChange = (model) => {
    setSelectedModels((prev) =>
      prev.includes(model)
        ? prev.filter((m) => m !== model)
        : [...prev, model]
    );
  };

  // Fetch data for the current ISO week (daily chart)
  useEffect(() => {
    if (!API_BASE || !currentISOWeekStart) return;
    setLoading(true);
    setError(null);
    const weekStart = parseISO(currentISOWeekStart);
    const weekEnd = endOfISOWeek(weekStart);
    const url = new URL(`${API_BASE}/api/packing/packing-records`);
    url.searchParams.append('startDate', weekStart.toISOString());
    url.searchParams.append('endDate', weekEnd.toISOString());
    fetch(url.toString())
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch packing data');
        return res.json();
      })
      .then(data => {
        const dateMap = {};
        Object.entries(data).forEach(([part, dateObj]) => {
          const model = partToModel[part];
          if (!model) return;
          if (!selectedModels.includes(model)) return;
          Object.entries(dateObj).forEach(([dateStr, count]) => {
            const [month, day, year] = dateStr.split('/');
            const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            if (!dateMap[isoDate]) dateMap[isoDate] = 0;
            dateMap[isoDate] += count;
          });
        });
        const allDates = getDateRangeArray(format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd'));
        const chartArr = allDates.map(date => ({ label: date, value: dateMap[date] || 0 }));
        setChartData(chartArr);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedModels, currentISOWeekStart]);

  // Fetch and aggregate the last 12 ISO weeks for the weekly chart (independent of daily chart navigation)
  useEffect(() => {
    if (!API_BASE) return;
    const today = new Date();
    const thisWeekStart = startOfISOWeek(today);
    const earliestWeekStart = subWeeks(thisWeekStart, 11); // 12 weeks total
    const url = new URL(`${API_BASE}/api/packing/packing-records`);
    url.searchParams.append('startDate', earliestWeekStart.toISOString());
    url.searchParams.append('endDate', endOfISOWeek(thisWeekStart).toISOString());
    fetch(url.toString())
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch packing data');
        return res.json();
      })
      .then(data => {
        const dateMap = {};
        Object.entries(data).forEach(([part, dateObj]) => {
          const model = partToModel[part];
          if (!model) return;
          if (!selectedModels.includes(model)) return;
          Object.entries(dateObj).forEach(([dateStr, count]) => {
            const [month, day, year] = dateStr.split('/');
            const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            if (!dateMap[isoDate]) dateMap[isoDate] = 0;
            dateMap[isoDate] += count;
          });
        });
        // Aggregate by ISO week for the last 12 weeks
        const weekTotals = {};
        Object.entries(dateMap).forEach(([isoDate, value]) => {
          const d = parseISO(isoDate);
          const week = getISOWeek(d);
          const year = getISOWeekYear(d);
          const weekKey = `${year}-${week.toString().padStart(2, '0')}`;
          if (!weekTotals[weekKey]) weekTotals[weekKey] = 0;
          weekTotals[weekKey] += value;
        });
        // Get the last 12 week keys in order
        const weekKeys = [];
        for (let i = 11; i >= 0; i--) {
          const d = addWeeks(thisWeekStart, -i);
          const week = getISOWeek(d);
          const year = getISOWeekYear(d);
          weekKeys.push(`${year}-${week.toString().padStart(2, '0')}`);
        }
        const weeklyData = weekKeys.map(weekKey => ({
          label: weekKey.replace('-', '-'),
          value: weekTotals[weekKey] || 0
        }));
        console.log('Weekly chart data:', weeklyData);
        setWeeklyChartData(weeklyData);
      })
      .catch(err => {
        setWeeklyChartData([]);
        console.error('Weekly chart error:', err.message);
      });
  }, [selectedModels]);

  // Week navigation handlers
  const handlePrevWeek = () => {
    setCurrentISOWeekStart(prev => format(addWeeks(parseISO(prev), -1), 'yyyy-MM-dd'));
  };
  const handleNextWeek = () => {
    setCurrentISOWeekStart(prev => format(addWeeks(parseISO(prev), 1), 'yyyy-MM-dd'));
  };

  // Display week range for UI
  let weekRangeLabel = '';
  if (currentISOWeekStart) {
    const weekStart = parseISO(currentISOWeekStart);
    const weekEnd = endOfISOWeek(weekStart);
    weekRangeLabel = `${format(weekStart, 'MMM d, yyyy')} - ${format(weekEnd, 'MMM d, yyyy')}`;
  }

  return (
    <div style={{ padding: '32px' }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/packing')}
        sx={{ mb: 2 }}
      >
        Back to Packing
      </Button>
      <h1>Packing Charts</h1>
      {/* Filter Bar */}
      <Box display="flex" alignItems="center" gap={4} mb={3}>
        <FormGroup row>
          {ALL_MODELS.map((model) => (
            <FormControlLabel
              key={model.value}
              control={
                <Checkbox
                  checked={selectedModels.includes(model.value)}
                  onChange={() => handleModelChange(model.value)}
                />
              }
              label={model.label}
            />
          ))}
        </FormGroup>
      </Box>
      {/* ISO Week Navigation and Daily Chart */}
      <Box display="flex" alignItems="center" gap={2} mb={1}>
        <Button variant="outlined" size="small" onClick={handlePrevWeek}>&lt; Prev Week</Button>
        <Typography variant="subtitle1">{weekRangeLabel}</Typography>
        <Button variant="outlined" size="small" onClick={handleNextWeek}>&gt; Next Week</Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <PackingOutputBarChart
            title="Daily Packing Output"
            data={chartData}
          />
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showAvgLine}
                  onChange={e => setShowAvgLine(e.target.checked)}
                />
              }
              label="Show Average Line"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showTrendLine}
                  onChange={e => setShowTrendLine(e.target.checked)}
                />
              }
              label="Show Trend Line"
            />
          </Box>
          <PackingOutputBarChart
            title="Weekly Packing Output"
            data={weeklyChartData}
            color="#4caf50"
            showTrendLine={showTrendLine}
            showAvgLine={showAvgLine}
          />
          {/* FAKE CHART FOR DEBUGGING TREND LINE */}
          <PackingOutputBarChart
            title="Fake Weekly Chart"
            data={[
              { label: 'A', value: 100 },
              { label: 'B', value: 200 },
              { label: 'C', value: 300 },
              { label: 'D', value: 400 },
              { label: 'E', value: 500 },
              { label: 'F', value: 600 },
              { label: 'G', value: 700 },
              { label: 'H', value: 800 },
              { label: 'I', value: 900 },
              { label: 'J', value: 1000 },
              { label: 'K', value: 1100 },
              { label: 'L', value: 1200 },
            ]}
            color="#1976d2"
            showTrendLine={true}
            showAvgLine={false}
          />
        </>
      )}
      {/* Weekly and Monthly charts will go here */}
    </div>
  );
};

export default PackingCharts;
