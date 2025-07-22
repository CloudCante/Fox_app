// MultiMenu.jsx
import React, { memo } from 'react';
import { Menu, MenuItem } from '@mui/material';

export function MultiMenu({ anchorEl, open, onClose, buttonData=[], disabled = false }) {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        {buttonData.map(([handleClick, label], idx) => (
        <MenuItem
          key={idx}
          onClick={(e) => {
            handleClick(e);
            onClose();          // close the menu after click
          }}
          disabled={disabled}
        >
          {label}
        </MenuItem>
      ))}
    </Menu>
  );
}

export default memo(MultiMenu);