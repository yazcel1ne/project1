import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const LoadingPage = ({ 
  height = '70vh' 
}) => {

  return (
    <Box minHeight={height}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <CircularProgress />
    </Box>
  );
}
export default LoadingPage;