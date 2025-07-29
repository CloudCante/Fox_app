// Header.jsx
import React, { memo } from 'react';
import { Box,Typography } from '@mui/material';
import PropTypes from 'prop-types';

export const Header = memo(function Header({
  title,subTitle,titleVariant = "h4", subTitleVariant = "body1",
  titleColor = "text.primary", subTitleColor = "text.secondary"
}) {
  return (
    <Box sx={{ py:{xs:2, md:4} }}>
      <Typography variant={titleVariant} color = {titleColor} gutterBottom>
        {title}
      </Typography>
      {subTitle&&(<Typography variant={subTitleVariant} color={subTitleColor} gutterBottom>
        {subTitle}
      </Typography>)}
    </Box>
  );
});

Header.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string,
};

export default Header;