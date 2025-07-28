// Header.jsx
import React, { memo } from 'react';
import { Box,Typography } from '@mui/material';
import PropTypes from 'prop-types';

export const Header = memo(function Header({
  title,subTitle,titleVariant = "h4", subTitleVariant = "body1"
}) {
  return (
    <Box sx={{ py:{xs:2, md:4} }}>
      <Typography variant={titleVariant} gutterBottom>
        {title}
      </Typography>
      <Typography variant={subTitleVariant} color="text.secondary">
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