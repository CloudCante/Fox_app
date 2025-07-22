// MultiMenu.jsx
import React, { memo } from 'react';
import { Menu, MenuItem } from '@mui/material';

export function MultiMenu({ anchorEl, open, onClose, buttonData=[]}) {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        {buttonData.map(([handleClick, label,itemDisabled=false], idx) => (
        <MenuItem
          key={idx}
          onClick={(e) => {
            handleClick(e);
            onClose();          // close the menu after click
          }}
          disabled={itemDisabled}
        >
          {label}
        </MenuItem>
      ))}
    </Menu>
  );
}

export default memo(MultiMenu);