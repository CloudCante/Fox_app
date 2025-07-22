// MultiFilter.jsx
import React, { memo } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Checkbox,
  ListItemText,
  TextField
} from '@mui/material';

/**
 * props.filters: Array of
 *   [
 *     label: string,
 *     allOptions: string[],
 *     selectedOptions: string[],
 *     onChange: (e: SelectChangeEvent<string[]>) => void,
 *     searchValue: string,
 *     onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void
 *   ]
 * props.limit: number   // hide filter entirely if allOptions.length <= limit
 * props.searchThreshold: number // only show search input when allOptions.length > this
 */
export function MultiFilter({
  filters = [],
  limit = 0,
  searchThreshold = 10
}) {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {filters.map(
        (
          [ label, allOptions, selectedOptions, onChange, searchValue, onSearchChange ],
          idx
        ) => {
          // skip rendering if below the "limit"
          if (allOptions.length <= limit) return null;

          return (
            <FormControl key={idx} size="small" sx={{ minWidth: 200 }}>
              <InputLabel>{label}</InputLabel>
              <Select
                multiple
                value={selectedOptions}
                onChange={onChange}
                input={<OutlinedInput label={label} />}
                renderValue={vals => vals.join(', ')}
                MenuProps={{
                  PaperProps: { sx: { maxHeight: 300, overflowY: 'auto' } },
                  disableAutoFocusItem: true
                }}
              >
                {allOptions.length > searchThreshold && (
                  <MenuItem disableRipple>
                    <TextField
                      fullWidth
                      variant="standard"
                      size="small"
                      placeholder={`Search ${label}…`}
                      value={searchValue}
                      onChange={onSearchChange}
                      onClick={e => e.stopPropagation()}
                      onKeyDown={e => e.stopPropagation()}
                    />
                  </MenuItem>
                )}

                <MenuItem value="__CLEAR__">
                  <em>Clear All</em>
                </MenuItem>

                {allOptions
                  .filter(opt =>
                    opt.toLowerCase().includes((searchValue || '').toLowerCase())
                  )
                  .map(opt => (
                    <MenuItem key={opt} value={opt}>
                      <Checkbox checked={selectedOptions.includes(opt)} />
                      <ListItemText primary={opt} />
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          );
        }
      )}
    </Box>
  );
}

export default memo(MultiFilter);
