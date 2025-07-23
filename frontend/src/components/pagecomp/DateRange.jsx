// DateRange.jsx
import React, { memo, useMemo } from 'react';
import { Box, FormLabel, FormHelperText } from '@mui/material';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';

const DateRange = memo(function DateRange({
  startDate,
  setStartDate,
  normalizeStart,
  startLabel = "Start Date",
  endDate,
  setEndDate,
  normalizeEnd,
  endLabel = "End Date",
  format = "yyyy-MM-dd",
  maxDate,
  minDate,
  disabled = false,
  error,
  helperText,
  required = false,
  sx = {}
}) {
  // Memoize maxDate to avoid creating new Date on every render
  const defaultMaxDate = useMemo(() => new Date(), []);
  const effectiveMaxDate = maxDate ?? defaultMaxDate;
  
  // Determine if this is a range picker
  const isRangePicker = Boolean(setEndDate && typeof setEndDate === 'function');
  
  // Safe normalization wrapper
  const safeNormalizeStart = (date) => {
    if (!date) return null;
    return typeof normalizeStart === 'function' ? normalizeStart(date) : date;
  };
  
  const safeNormalizeEnd = (date) => {
    if (!date) return null;
    return typeof normalizeEnd === 'function' ? normalizeEnd(date) : date;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ...sx }}>
      {/* Start Date */}
      <Box>
        <FormLabel 
          component="label" 
          required={required}
          error={Boolean(error)}
          sx={{ display: 'block', mb: 1 }}
        >
          {startLabel}
        </FormLabel>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(safeNormalizeStart(date))}
          selectsStart={isRangePicker}
          startDate={startDate}
          endDate={endDate}
          placeholderText={`Select ${startLabel.toLowerCase()}`}
          dateFormat={format}
          isClearable
          maxDate={effectiveMaxDate}
          minDate={minDate}
          disabled={disabled}
          aria-label={startLabel}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'daterange-error' : helperText ? 'daterange-helper' : undefined}
        />
      </Box>

      {/* End Date - only render if it's a range picker */}
      {isRangePicker && (
        <Box>
          <FormLabel 
            component="label" 
            required={required}
            error={Boolean(error)}
            sx={{ display: 'block', mb: 1 }}
          >
            {endLabel}
          </FormLabel>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(safeNormalizeEnd(date))}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            maxDate={effectiveMaxDate}
            placeholderText={`Select ${endLabel.toLowerCase()}`}
            dateFormat={format}
            isClearable
            disabled={disabled}
            aria-label={endLabel}
            aria-required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'daterange-error' : helperText ? 'daterange-helper' : undefined}
          />
        </Box>
      )}

      {/* Error or Helper Text */}
      {error && (
        <FormHelperText id="daterange-error" error>
          {error}
        </FormHelperText>
      )}
      {!error && helperText && (
        <FormHelperText id="daterange-helper">
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
});

DateRange.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  setStartDate: PropTypes.func.isRequired,
  normalizeStart: PropTypes.func,
  startLabel: PropTypes.string,
  endDate: PropTypes.instanceOf(Date),
  setEndDate: PropTypes.func,
  normalizeEnd: PropTypes.func,
  endLabel: PropTypes.string,
  format: PropTypes.string,
  maxDate: PropTypes.instanceOf(Date),
  minDate: PropTypes.instanceOf(Date),
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  sx: PropTypes.object
};

export default DateRange;