// SortMenu.jsx Depricated
import React, { memo } from 'react';
import { Menu, MenuItem } from '@mui/material';

export function SortMenu({ anchorEl, open, onClose, groupByWorkstation, onToggleGroup, sortAsc, onToggleAsc,sortByCount, onToggleByCount }) {
  return (
    <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
    >
        <MenuItem onClick={() => {
        onToggleGroup();
        onClose();
        }}>
        Sort by: {groupByWorkstation ? 'Workstation' : 'Fixture'}
        </MenuItem>

        <MenuItem onClick={() => {
        onToggleAsc();
        onClose();
        }}>
        Sort Order: {sortAsc ? 'Asc' : 'Dec'}
        </MenuItem>

        <MenuItem onClick={() => {
        onToggleByCount();
        onClose();
        }}>
        Sort by Count: {sortByCount ? 'ON' : 'OFF'}
        </MenuItem>
    </Menu>
  );
}

export default memo(SortMenu);