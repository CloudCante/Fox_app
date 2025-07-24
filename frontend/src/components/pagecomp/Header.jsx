// Header.jsx
import React, { memo } from 'react';
import { Box,Typography } from '@mui/material';
import PropTypes from 'prop-types';

export const Header = memo(function Header({
  title,subTitle
}) {
  return (
    <Box sx={{ py:{xs:2, md:4} }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {subTitle}
      </Typography>
    </Box>
  );
});

Header.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string,
};

export default Header;