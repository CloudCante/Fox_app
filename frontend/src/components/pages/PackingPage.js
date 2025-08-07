import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PackingPageTable } from '../pagecomp/packingPage/PackingPageTable';
import { tableStyle, divStyle, buttonStyle, subTextStyle } from '../theme/themes';
import { usePackingData } from '../hooks/packingPage/usePackingData';

const API_BASE = process.env.REACT_APP_API_BASE;
if (!API_BASE) {
  console.error('REACT_APP_API_BASE environment variable is not set! Please set it in your .env file.');
}

const PackingPage = () => {
  const [copied, setCopied] = useState({ group: '', date: '' });
  const { packingData, sortData, lastUpdated } = usePackingData(API_BASE);
  const theme = useTheme();
  const navigate = useNavigate();

  // Get unique dates from the data
  const dateRange = useMemo(() => {
    if (!packingData || typeof packingData !== 'object') return [];
    
    // Collect all unique dates from all parts
    const uniqueDates = new Set();
    Object.values(packingData).forEach(model => {
      Object.values(model.parts || {}).forEach(partData => {
        Object.keys(partData).forEach(date => uniqueDates.add(date));
      });
    });

    // Convert to array and sort
    return Array.from(uniqueDates).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA - dateB;
    });
  }, [packingData]);

  // Transform our new data structure into groups for the table
  const groups = useMemo(() => {
    if (!packingData || typeof packingData !== 'object') return [];
    try {
      return Object.entries(packingData).map(([modelName, modelData]) => ({
        key: modelName,
        label: modelData?.groupLabel || modelName,
        totalLabel: modelData?.totalLabel || `${modelName} Total`,
        parts: Object.keys(modelData?.parts || {})
      }));
    } catch (error) {
      console.error('Error processing packing data:', error);
      return [];
    }
  }, [packingData]);

  // Calculate daily totals from the new structure
  const dailyTotals = useMemo(() => {
    if (!packingData || typeof packingData !== 'object') return {};
    try {
      const totals = dateRange.reduce((acc, date) => {
        let total = 0;
        
        // Sum up all parts from all models for this date
        Object.values(packingData).forEach(model => {
          if (model?.parts) {
            Object.values(model.parts).forEach(partData => {
              const value = Number(partData[date] || 0);
              total += value;
            });
          }
        });
        
        // Always add the total (even if zero)
        acc[date] = total;
        return acc;
      }, {});

      console.log('Daily Totals:', totals); // Debug log
      return totals;
    } catch (error) {
      console.error('Error calculating daily totals:', error);
      return {};
    }
  }, [dateRange, packingData]);

  const handleCopyColumn = useCallback((group, date) => {
    let values = '';
    
    if (packingData[group]) {
      values = Object.values(packingData[group].parts)
        .map(partData => partData[date] || '')
        .join('\n');
    } else if (group === 'DAILY TOTAL') {
      values = dailyTotals[date]?.toString() || '';
    } else if (group === 'SORT') {
      values = ['506', '520'].map(model => sortData[model]?.[date] || '').join('\n');
    }

    navigator.clipboard.writeText(values).then(() => {
      setCopied({ group, date });
      setTimeout(() => setCopied({ group: '', date: '' }), 1200);
    });
  }, [packingData, sortData, dailyTotals]);

  return (
    <div style={{ padding: '20px' }}>
      <div style={divStyle}>
        <h1 style={{ margin: 0 }}>Packing Output</h1>
        <button style={buttonStyle} onClick={() => navigate('/packing-charts')}>
          Packing Charts
        </button>
        {lastUpdated && <div style={subTextStyle}>Last updated: {lastUpdated.toLocaleTimeString()}</div>}
      </div>
      <table style={tableStyle}>
        {/* Dynamically render each model group */}
        {groups.map(g => (
          <PackingPageTable
            key={g.key}
            header={g.label}
            headerTwo={g.totalLabel}
            dates={dateRange}
            partLabel={g.key}
            handleOnClick={handleCopyColumn}
            partsMap={g.parts}
            packingData={packingData?.[g.key]?.parts || {}}
            copied={copied}
            spacer
          />
        ))}
        
        {/* Daily Total Section */}
        <PackingPageTable
          header="DAILY TOTAL"
          headerTwo="Total Packed"
          dates={dateRange}
          partLabel="DAILY TOTAL"
          handleOnClick={handleCopyColumn}
          partsMap={[]}
          packingData={{}}
          copied={copied}
          dailyTotals={dailyTotals}
          isTotal={true}
          spacer
        />

        {/* Sort Section */}
        <PackingPageTable
          header="SORT"
          headerTwo=""
          dates={dateRange}
          partLabel="SORT"
          handleOnClick={handleCopyColumn}
          partsMap={['506', '520']}
          packingData={sortData}
          copied={copied}
          isSort
        />
      </table>
    </div>
  );
};

export default PackingPage;