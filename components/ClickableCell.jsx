import React from 'react';
import {  Typography, Button, Tooltip } from '@mui/material';

const ClickableCell = ({ value, onClick }) => {
  const handleClick = () => {
    onClick(value);
  };

  return (
    <Tooltip title="view details">
    <Typography
    sx={{  
   
    "&:hover": {
      color: "primary",

      cursor: 'pointer',
    }

  }}
    onClick={handleClick}>
      {value}
    </Typography>
    </Tooltip>
  );
};

export default ClickableCell;
