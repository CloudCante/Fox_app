// NumberRange.jsx
import React, { memo, useMemo } from 'react';
import { TextField } from '@mui/material';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types';

export const NumberRange = memo(function NumberRange({
  defaultNumber=5, setNumber,minNumber=1,maxNumber=100, label
}) {
  return (
    <TextField size='small' type='number' label={label}
                slotProps={{
                    input: {min: minNumber, max:maxNumber },
                    htmlInput: { min: minNumber, max: maxNumber},
                }} 
                defaultValue={defaultNumber} onChange={(e) => {
                    const value = Number(e.target.value);
                    if (!isNaN(value) && value > 0) {
                    setNumber(value);
                    }
                }}/>
  );
});

NumberRange.propTypes = {
  defaultNumber: PropTypes.string,
  setNumber: PropTypes.func.required,
  minNumber: PropTypes.string,
  maxNumber: PropTypes.string,
  label: PropTypes.string,
};

export default NumberRange;