import React, { useEffect, useState, Suspense } from "react";
import { createTheme, ThemeProvider, CssBaseline, Box } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import { getUser, getUserTheme } from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import NavigationBar from "../components/NavigationBar";
import Loading from "../pages/LoadingPage/LoadingPage";

const AuthLayout = () => {
  const { user, setUser } = useAuth();
  const [switchState, setSwitchState] = useState(true);

  const handleSwitchChange = async (event) => {
    event.preventDefault();
    setSwitchState(event.target.checked);

    const theme = event.target.checked;

    const response = await getUserTheme({
      theme,
    });
  };

  // check if user is logged in or not from server
  useEffect(() => {
    (async () => {
      const response = await getUser();
      if (response.ok) {
        setUser(response.data.data);
        if (response.data.data.preferred_theme === "light") {
          setSwitchState(false);
        } else if (response.data.data.preferred_theme === "dark") {
          setSwitchState(true);
        }
      } else {
        sessionStorage.removeItem("user");
        window.location.href = "/";
      }
    })();
  }, []);

  // if user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/" />;
  }

  const handleMode = () => {
    {
    }
  };

  // DARK MODE
  const myDarktheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#ff4545",
      },
      secondary: {
        main: "#2a3647",
      },
      tertiary: {
        main: "#ffffff",
      },
      background: {
        paper: "#1C2833",
        default: "#1C2833",
      },
      success: {
        main: "#28B463",
      },
      error: {
        main: "#E74C3C",
      },
      warning: {
        main: "#ff9800",
      },
      white: {
        main: "#ffffff",
      },
      info: {
        main: "#3498DB",
      },
      text: {
        primary: "#fff",
        secondary: "#D6B4B5",
        tertiary: "#4A4A4A",
        disabled: "#C7C7C7",
      },
      switch: {
        main: "#4d9b51",
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
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: "#ff4545",
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
          columnHeader: {
            "&.headercolor": {
              backgroundColor: "#1C2833",
            },
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: "bold",
            borderRadius: "10px",
          },
        },
      },
      MuiCardMedia: {
        styleOverrides: {
          root: {
            borderRadius: "20px",
          },
        },
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

  // LIGHT MODE

  const myLighttheme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#ff4545",
      },
      secondary: {
        main: "#ffe2e2",
      },
      tertiary: {
        main: "#ffffff",
      },
      background: {
        paper: "#ffffff",
        default: "#F8F8F8",
      },
      success: {
        main: "#28B463",
      },
      error: {
        main: "#E74C3C",
      },
      info: {
        main: "#3498DB",
      },
      edit: {
        main: "",
      },
      text: {
        primary: "#4A4A4A",
        secondary: "#312D2D",
        tertiary: "#4A4A4A",
        disabled: "#C7C7C7",
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
            backgroundColor: "#1C2833",
            color: "#ffffff",
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          root: {
            color: "#000000",
            "&:hover": {
              color: "#000000",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: "bold",
            borderRadius: "10px",
          },
        },
      },
      MuiCardMedia: {
        styleOverrides: {
          root: {
            borderRadius: "20px",
          },
        },
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
    <ThemeProvider theme={switchState ? myDarktheme : myLighttheme}>
      <CssBaseline />
      <NavigationBar
        switchState={switchState}
        onSwitchChange={handleSwitchChange}
      />
      <Box
        sx={{
          width: {
            xs: "100vw",
            md: "93vw",
          },
          margin: {
            xs: "0",
            md: "6%",
          },
          height: "0vh",
        }}
      >
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </Box>
    </ThemeProvider>
  );
};
export default AuthLayout;
