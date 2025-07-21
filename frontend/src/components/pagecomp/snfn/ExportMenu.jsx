// ExportMenu.jsx Depricated
import React, { memo } from 'react';
import { Menu, MenuItem } from '@mui/material';

export function ExportMenu({ anchorEl, open, onClose, onExportCSV, onExportJSON, disabled }) {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem onClick={onExportCSV} disabled={disabled}>Export CSV</MenuItem>
      <MenuItem onClick={onExportJSON} disabled={disabled}>Export JSON</MenuItem>
    </Menu>
  );
}

export default memo(ExportMenu);
