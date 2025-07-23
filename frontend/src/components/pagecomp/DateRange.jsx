// DateRange.jsx
import React, { memo } from 'react';
import { Box } from '@mui/material';
import DatePicker from 'react-datepicker';

export function DateRange({
  startDate,
  setStartDate,
  normalizeStart,
  startLabel = "Start Date",
  endDate,
  setEndDate,
  normalizeEnd,
  endLabel = "End Date",
  format = "yyyy-MM-dd"
}) {
  return (
    <Box>
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(normalizeStart(date))}
        selectsStart={Boolean(endDate && normalizeEnd)}
        startDate={startDate}
        endDate={endDate}
        placeholderText={startLabel}
        dateFormat={format}
        isClearable
        maxDate={new Date()}
      />

      {/* only render End Date if both endDate & setter are provided */}
      {typeof setEndDate === 'function' && endDate !== undefined && normalizeEnd && (
        <>
          <br />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(normalizeEnd(date))}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText={endLabel}
            dateFormat={format}
            isClearable
            maxDate={new Date()}
          />
        </>
      )}
    </Box>
  );
}

export default memo(DateRange);
