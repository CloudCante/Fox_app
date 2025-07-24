// src/hooks/packingCharts/usePackingData.js
import { useState, useEffect } from 'react';
import {
  parseISO,
  startOfISOWeek,
  endOfISOWeek,
  subWeeks,
  addWeeks,
  getISOWeek,
  getISOWeekYear,
  format,
} from 'date-fns';
import { fetchPackingRecords } from '../../../utils/packingCharts/packingChartsApi';
import { processPackingData } from '../../../utils/packingCharts/packingChartsDataUtils';
import { getDateRangeArray } from '../../../utils/dateUtils';

// You could also import these from a shared file instead
import { sxm4Parts, sxm5Parts } from '../../../data/dataTables';
// Map parts to models
const partToModel = {};
sxm4Parts.forEach(p => (partToModel[p] = 'SXM4'));
sxm5Parts.forEach(p => (partToModel[p] = 'SXM5'));

export function usePackingData(
  apiBase,
  selectedModels,
  currentISOWeekStart,  // ISO week start as an ISO‐string or Date
  weeksToShow = 12      // how many weeks for the summary
) {
  // Daily chart state
  const [dailyData, setDailyData]         = useState([]);
  const [loadingDaily, setLoadingDaily]   = useState(false);
  const [errorDaily, setErrorDaily]       = useState(null);

  // Weekly summary state
  const [weeklyData, setWeeklyData]       = useState([]);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [errorWeekly, setErrorWeekly]     = useState(null);

  // 1️⃣ Fetch & build daily data whenever week or models change
  useEffect(() => {
    if (!apiBase || !currentISOWeekStart) return;
    setLoadingDaily(true);
    setErrorDaily(null);

    const weekStart = typeof currentISOWeekStart === 'string'
      ? parseISO(currentISOWeekStart)
      : currentISOWeekStart;
    const weekEnd = endOfISOWeek(weekStart);

    fetchPackingRecords(apiBase, '/api/packing/packing-records', weekStart, weekEnd)
      .then(raw => {
        const dateMap = processPackingData(raw, selectedModels, partToModel);
        const allDates = getDateRangeArray(
          format(weekStart, 'yyyy-MM-dd'),
          format(weekEnd,   'yyyy-MM-dd')
        );
        setDailyData(
          allDates.map(d => ({ label: d, value: dateMap[d] || 0 }))
        );
      })
      .catch(err => setErrorDaily(err.message))
      .finally(() => setLoadingDaily(false));
  }, [apiBase, selectedModels, currentISOWeekStart]);

  // 2️⃣ Fetch & build weekly summary whenever models (or weeksToShow) change
  useEffect(() => {
    if (!apiBase) return;
    setLoadingWeekly(true);
    setErrorWeekly(null);

    const today = new Date();
    const thisWeekStart = startOfISOWeek(today);
    const earliest = subWeeks(thisWeekStart, weeksToShow - 1);

    fetchPackingRecords(apiBase, '/api/packing/packing-records', earliest, thisWeekStart)
      .then(raw => {
        const dateMap = processPackingData(raw, selectedModels, partToModel);
        // roll up by ISO week
        const totals = {};
        Object.entries(dateMap).forEach(([iso, val]) => {
          const d = parseISO(iso);
          const wk = getISOWeek(d), yr = getISOWeekYear(d);
          const key = `${yr}-${String(wk).padStart(2, '0')}`;
          totals[key] = (totals[key] || 0) + val;
        });
        // build last N weeks labels in order
        const labels = Array.from({ length: weeksToShow }, (_, i) => {
          const d = addWeeks(thisWeekStart, i - (weeksToShow - 1));
          const wk = getISOWeek(d), yr = getISOWeekYear(d);
          return `${yr}-${String(wk).padStart(2, '0')}`;
        });
        setWeeklyData(
          labels.map(l => ({ label: l, value: totals[l] || 0 }))
        );
      })
      .catch(err => {
        setErrorWeekly(err.message);
        setWeeklyData([]);
      })
      .finally(() => setLoadingWeekly(false));
  }, [apiBase, selectedModels, weeksToShow]);

  return {
    dailyData,
    loadingDaily,
    errorDaily,
    weeklyData,
    loadingWeekly,
    errorWeekly
  };
}
