// FilterBar.jsx
import React, { memo } from 'react';
import { Box, FormControl, InputLabel, Select, OutlinedInput, MenuItem, Checkbox, ListItemText, TextField } from '@mui/material';

export function FilterBar({
  allStations, stationFilter, onStationChange,
  searchStations, onSearchStations, allErrorCodes, errorCodeFilter,onErrorCodeChange, searchErrorCodes, onSearchErrorCodes, allModels, modelFilter, onModelChange, searchModels, onSearchModels
}) {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Fixtures</InputLabel>
        <Select
          multiple
          value={stationFilter}
          onChange={onStationChange}
          input={<OutlinedInput label="Fixtures" />}
          renderValue={selected => selected.join(', ')}
          MenuProps={{ PaperProps:{ sx:{ maxHeight: 300 }}, disableAutoFocusItem: true }}
        >
          {allStations.length > 10 && (
            <MenuItem disableRipple>
              <TextField
                placeholder="Search…"
                value={searchStations}
                onChange={onSearchStations}
                fullWidth
                size="small"
                variant="standard"
                onClick={e => e.stopPropagation()}
                onKeyDown={e => e.stopPropagation()}
              />
            </MenuItem>
          )}
          <MenuItem value="__CLEAR__"><em>Clear All</em></MenuItem>
          {allStations
            .filter(s => s.toLowerCase().includes(searchStations.toLowerCase()))
            .map(s => (
              <MenuItem key={s} value={s}>
                <Checkbox checked={stationFilter.includes(s)} />
                <ListItemText primary={s} />
              </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 200 }} size='small'>
        <InputLabel>Error Codes</InputLabel>
            <Select
                multiple
                value={errorCodeFilter}
                onChange={onErrorCodeChange}
                input={<OutlinedInput label="Error Codes" />}
                renderValue={selected => selected.join(', ')}
                MenuProps={{
                PaperProps: {
                    sx: { maxHeight: 300, overflowY: 'auto' },
                    // no custom onClose here for now
                },
                // prevent menu from closing when typing
                disableAutoFocusItem: true,
                }}
            >
            {/* Insert a non-selectable search box */}
            {allErrorCodes.length > 10 && (
                <MenuItem disableRipple>
                    <TextField
                        placeholder="Search…"
                        value={searchErrorCodes}
                        onChange={onSearchErrorCodes}
                        fullWidth
                        size="small"
                        variant="standard"
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => e.stopPropagation()}
                    />
                </MenuItem>
            )}
                <MenuItem value="__CLEAR__">
                <em>Clear All</em>
                </MenuItem>
                {allErrorCodes
                .filter((code) =>
                    code.toLowerCase().includes((searchErrorCodes || '').toLowerCase())
                )
                .map((code) => (
                    <MenuItem key={code} value={code}>
                    <Checkbox checked={errorCodeFilter.includes(code)} />
                    <ListItemText primary={code} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
        {allModels.length > 0 && (
            <FormControl sx={{ minWidth: 200 }} size='small'>
            <InputLabel>Models</InputLabel>
            <Select
                multiple
                value={modelFilter}
                onChange={onModelChange}
                input={<OutlinedInput label="Models" />}
                renderValue={selected => selected.join(', ')}
                MenuProps={{
                PaperProps: {
                    sx: { maxHeight: 300, overflowY: 'auto' },
                    // no custom onClose here for now
                },
                // prevent menu from closing when typing
                disableAutoFocusItem: true,
                }}
            >
                {/* Insert a non-selectable search box */}
                {allModels.length > 10 ? (
                <MenuItem disableRipple>
                    <TextField
                        placeholder="Search…"
                        value={searchModels}
                        onChange={onSearchModels}
                        fullWidth
                        size="small"
                        variant="standard"
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => e.stopPropagation()}
                    />
                </MenuItem>
                ):null}
                <MenuItem value="__CLEAR__">
                <em>Clear All</em>
                </MenuItem>
                {allModels
                .filter((code) =>
                    code.toLowerCase().includes((searchModels || '').toLowerCase())
                )
                .map((code) => (
                    <MenuItem key={code} value={code}>
                    <Checkbox checked={modelFilter.includes(code)} />
                    <ListItemText primary={code} />
                    </MenuItem>
                ))}
            </Select>
            </FormControl>
        )}
    </Box>
  );
}

// memo so it only re‑renders if its props actually change
export default memo(FilterBar);
