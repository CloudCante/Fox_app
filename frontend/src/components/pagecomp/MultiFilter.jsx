// MultiFilter.jsx
import React, { memo, useMemo } from 'react';
import {Box, FormControl, InputLabel, Select, OutlinedInput, MenuItem, Checkbox, ListItemText, TextField
} from '@mui/material';
import { sanitizeText } from '../../utils/textUtils';

/**
 * props.filters: Array of
 *   {
 *     id: string,
 *     label: string,
 *     allOptions: string[],
 *     selectedOptions: string[],
 *     onChange: (e: SelectChangeEvent<string[]>) => void,
 *     searchValue: string,
 *     onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void
 *   }
 * props.limit: number   // hide filter entirely if allOptions.length <= limit
 * props.searchThreshold: number // only show search input when allOptions.length > this
 */

export const MultiFilter = memo(({ filters = [], limit = 0, searchThreshold = 10 }) => {
  const visibleFilters = useMemo(() => 
    filters.filter(f => f.allOptions.length > limit), [filters, limit]
  );

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {visibleFilters.map(filter => (
        <FilterSelect 
          key={filter.id} 
          filter={filter} 
          searchThreshold={searchThreshold} 
        />
      ))}
    </Box>
  );
});

const FilterSelect = memo(({ filter, searchThreshold }) => {
  const { label, allOptions, selectedOptions, onChange, searchValue, onSearchChange } = filter;
  
  const selectedSet = useMemo(() => new Set(selectedOptions), [selectedOptions]);
  
  const filteredOptions = useMemo(() => {
    if (!searchValue) return allOptions;
    const search = sanitizeText(searchValue.toLowerCase());
    return allOptions.filter(opt => opt.toLowerCase().includes(search));
  }, [allOptions, searchValue]);


  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={selectedOptions}
        onChange={onChange}
        input={<OutlinedInput label={label} />}
        renderValue={vals => vals.join(', ')}
        MenuProps={{
          PaperProps: { sx: { maxHeight: 300 } },
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
              onKeyDown={e => {
                e.stopPropagation();
                if(e.key==='Escape'){
                  e.target.blur()
                };
              }}
            />
          </MenuItem>
        )}
        
        <MenuItem value='__CLEAR__'>
          <em>Clear All</em>
        </MenuItem>

        {filteredOptions.map(opt => (
          <MenuItem key={opt} value={opt}>
            <Checkbox checked={selectedSet.has(opt)} />
            <ListItemText primary={opt} />
          </MenuItem>
        ))}
        {filteredOptions.length===0 && searchValue &&(
          <MenuItem disabled>
            <em>No options found</em>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
});

export default MultiFilter;
