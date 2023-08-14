import { ListItemButton, Box } from '@mui/material';

const ActiveLink = ({ to, activeLink, isLightMode, isDarkMode, children }) => {
  const isActive = activeLink === to;

  return (
    <Box

      sx={
        isActive && (isLightMode || isDarkMode)
          ? {
              backgroundColor: isLightMode ? '#e0e0e0' : '#2a3647',
              color: isLightMode ? '#ffffff' : '#fffff',
            }
          : {}
      }
    >
      {children}
    </Box>
  );
};

export default ActiveLink;