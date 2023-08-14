import React, { Fragment } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  createTheme,
  ThemeProvider,
} from "@mui/material";

const GuestLayout = () => {
  const { user } = useAuth();

  // if user is logged in, redirect to role specific page
  if (user) {
    const userRole = user.role[0];

    if (userRole === "Kitchen Manager" || userRole === "Kitchen Staff Leader" || userRole === "Kitchen Staff" || userRole === "Nurse") {
      return <Navigate to="/items" />;
    } else if (userRole === "Finance Manager" || userRole === "Finance Staff") {
      return <Navigate to="/report-list" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }

  const myLighttheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#ff4545',
      },
      secondary: {
        main: '#ffe2e2'
      },
      tertiary: {
        main: '#ffffff'
      },
      background: {
        paper: '#ffffff',
        default: '#F8F8F8',
      },
      success: {
        main: '#28B463',
      },
      error: {
        main: '#E74C3C',
      },
      info: {
        main: '#3498DB',
      },
      edit: {
        main: ''
      },
      text: {
        primary: '#4A4A4A',
        secondary: '#312D2D',
        tertiary: '#4A4A4A',
        disabled: '#C7C7C7',
      },
    },
    components: {
      MuiSwitch: {
        defaultProps: {
          color: "success",
        },
      },
      MuiCircularProgress: {
        defaultProps: {
          color: "primary",
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: "#ff4545",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          root: {
            "& .MuiDrawer-paper": {
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            },
          },
        },
      },
      MuiDataGrid: {
        defaultProps: {
          disableColumnMenu: true,
        },
        styleOverrides: {
          root: {
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .MuiDataGrid-row": {
              borderBottom: "none",
            },
          },
          columnHeaderTitle: {
            fontWeight: "bold",
            color: "#2a3647",
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "#2a3647",
            color: "#ffffff",
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          root: {
            color: "#000000",
            "&:hover": {
              color: '#000000'
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: 'bold',
            borderRadius: '10px'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "20px",
          },
        },
      },

    },
  });

  return (
    <ThemeProvider theme={myLighttheme}>
    <Fragment>
      <Outlet />
    </Fragment>
    </ThemeProvider >
  );
};
export default GuestLayout;
