import React, { Fragment, useEffect, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Box,
  Typography,
  List,
  Toolbar,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Menu,
  MenuItem,
  Switch,
  CardContent,
  Card,
  Grid,
  Badge,
  FormControlLabel,
  Avatar,
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Logo from "../assets/nms-logo.png";
import {
  Person,
  Dashboard,
  AddShoppingCart,
  DiningOutlined,
  Lock,
  ListAlt,
  ReceiptLongOutlined,
  PostAdd,
  RestaurantMenu,
  Category,
  Straighten,
  ChevronLeft,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
//components
import ActiveLink from "./ActiveLink";
import SnackBar from "./SnackBar";
import DialogBox from "./DialogBox";
import EditProfile from "../components/Users/EditProfile";
import ConfirmationDialogBox from "../components/ConfirmationDialogBox";
//style
import { hiddenOnMobile, hiddenOnDesktop } from "./style";
//spatie and api stuff
import {
  logout,
  fetchPendingRequests,
  fetchApprovedOrders,
} from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import { Permissions } from "../constants/Permissions";

const drawerWidth = 230;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const NavigationBar = ({ switchState, onSwitchChange }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(
    localStorage.getItem("currentPage") || " "
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElNav, setAnchorElNav] = useState(null);

  const [openDialogBox, setOpenDialogBox] = useState(false); //Open DialogBox

  const [openSnackbar, setOpenSnackbar] = useState(false); //Snack Bar
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const [pendingRequests, setPendingRequests] = useState(0);
  const [approvedOrders, setApprovedOrders] = useState(0);
  const [id, setId] = useState("");

  const pages = [
    "Dashboard",
    "Inventory",
    "Reports",
    "Create Requests",
    "Purchase Requests",
    "Purchase Orders",
    "User Management",
    "Categories",
    "Units",
    "Roles & Permissions",
    "Weekly Menu",
  ];

  const snackBarData = (open, severity, message) => {
    setOpenSnackbar(open);
    setSnackbarSeverity(severity);
    setSnackbarMessage(message);
    setTimeout(() => {
      setOpenSnackbar(false);
    }, 3000);
  };

  const handleClickOpenEditProfile = () => {
    setOpenDialogBox(true);
  };

  const handleClose = () => {
    setOpenDialogBox(false);
  };

  const handleConfirmation = () => {
    setOpenConfirmation(true);
    setId("logout");
  };

  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
  };

  const handleLinkClick = () => {
    setIsButtonDisabled(true);
  };

  const fetchData = async () => {
    const [pendingRequestsResponse, approvedOrdersResponse] = await Promise.all(
      [fetchPendingRequests(), fetchApprovedOrders()]
    );

    if (pendingRequestsResponse.ok) {
      setPendingRequests(pendingRequestsResponse.data);
    }

    if (approvedOrdersResponse.ok) {
      setApprovedOrders(approvedOrdersResponse.data);
    }
  };

  useEffect(() => {
    fetchData();
    // localStorage.setItem("currentPage", title);
    setCurrentUrl(location.pathname);
    const cooldownTimeout = setTimeout(() => {
      setIsButtonDisabled(false);
    }, 2000);
    return () => {
      clearTimeout(cooldownTimeout);
    };
  }, [location]);

  const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    "& .MuiSwitch-switchBase": {
      margin: 1,
      padding: 0,
      transform: "translateX(6px)",
      "&.Mui-checked": {
        color: "#fff",
        transform: "translateX(22px)",
        "& .MuiSwitch-thumb:before": {
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
            "#fff"
          )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
        },
        "& + .MuiSwitch-track": {
          opacity: 1,
          backgroundColor:
            theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
        },
      },
    },
    "& .MuiSwitch-thumb": {
      backgroundColor: theme.palette.mode === "dark" ? "#003892" : "#001e3c",
      width: 32,
      height: 32,
      "&:before": {
        content: "''",
        position: "absolute",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
      },
    },
    "& .MuiSwitch-track": {
      opacity: 1,
      backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
      borderRadius: 20 / 2,
    },
  }));

  const handleSetTitle = (event) => {
    const id = event.currentTarget.id;
    switch (id) {
      case "dashboard":
        setTitle("Dashboard");
        break;
      case "items":
        setTitle("Inventory");
        break;
      case "report":
        setTitle("Reports");
        break;
      case "createPurchase":
        setTitle("Create Requests");
        break;
      case "request":
        setTitle("Purchase Requests");
        break;
      case "orders":
        setTitle("Purchase Orders");
        break;
      case "users":
        setTitle("User Management");
        break;
      case "roles and permissions":
        setTitle("Roles and Permissions Settings");
        break;
      case "categories":
        setTitle("Categories");
        break;
      case "units":
        setTitle("Units");
        break;
      case "menus":
        setTitle("Menus");
        break;
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const { user } = useAuth();
  const can = (permission) => {
    return (user?.permissions || []).find(
      (givenPermission) => givenPermission == permission
    )
      ? true
      : false;
  };

  //logout
  const handleIconClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogout = async () => {
    const response = await logout();
    if (response.ok) {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("currentPage");
      window.location.href = "/";
    } else {
    }
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  //for phone navigation
  const navigate = useNavigate();
  const handleCloseNavMenu = (event, page) => {
    setAnchorElNav(null);
    if (page === "Dashboard") {
      navigate("/dashboard");
    } else if (page === "Inventory") {
      navigate("/items");
    } else if (page === "Reports") {
      navigate("/report-list");
    } else if (page === "Create Requests") {
      navigate("/create-requests");
    } else if (page === "Purchase Requests") {
      navigate("/purchase-requests");
    } else if (page === "Purchase Orders") {
      navigate("/purchase-orders");
    } else if (page === "User Management") {
      navigate("/users");
    } else if (page === "Categories") {
      navigate("/categories");
    } else if (page === "Units") {
      navigate("/units");
    } else if (page === "Roles & Permissions") {
      navigate("/roles-and-permissions");
    } else if (page === "Weekly Menu") {
      navigate("/menus");
    }

    if (page != "backdropClick") {
      setTitle(page);
    }
  };
  const theme = useTheme();
  const isLightMode = theme.palette.mode === "light";
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Fragment>
      <AppBar>
        <Toolbar>
          <Box
            component="img"
            sx={{
              height: 10,
            }}
          />
          <Tooltip title="Go to Dashboard">
            <Link to={"/dashboard"}>
              <IconButton sx={hiddenOnMobile}>
                <img src={Logo} alt={Logo} width="60px" />
              </IconButton>
            </Link>
          </Tooltip>
          <Box sx={hiddenOnDesktop}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={hiddenOnDesktop}
            >
              {pages.map((page) => {
                if (
                  page === "Dashboard" &&
                  !can(Permissions.CAN_ACCESS_DASHBOARD)
                ) {
                  return null;
                } else if (
                  page === "Inventory" &&
                  !can(Permissions.CAN_ACCESS_ITEMS)
                ) {
                  return null;
                } else if (
                  page === "Reports" &&
                  !can(Permissions.CAN_ACCESS_REPORTS)
                ) {
                  return null;
                } else if (
                  page === "Create Requests" &&
                  !can(Permissions.CAN_CREATE_PURCHASE_REQUESTS)
                ) {
                  return null;
                } else if (
                  page === "Purchase Requests" &&
                  !can(Permissions.CAN_ACCESS_PURCHASE_REQUESTS)
                ) {
                  return null;
                } else if (
                  page === "Purchase Orders" &&
                  !can(Permissions.CAN_ACCESS_PURCHASE_ORDERS)
                ) {
                  return null;
                } else if (
                  page === "Users Management" &&
                  !can(Permissions.CAN_ACCESS_USERS)
                ) {
                  return null;
                } else if (
                  page === "Categories" &&
                  !can(Permissions.CAN_ACCESS_CATEGORIES)
                ) {
                  return null;
                } else if (
                  page === "Units" &&
                  !can(Permissions.CAN_ACCESS_UNITS)
                ) {
                  return null;
                } else if (
                  page === "Roles & Permissions" &&
                  !can(Permissions.CAN_VIEW_ROLE_PERMISSION)
                ) {
                  return null;
                } else if (
                  page === "Weekly Menu" &&
                  !can(Permissions.CAN_ACCESS_MENU)
                ) {
                  return null;
                }

                return (
                  <MenuItem
                    key={page}
                    onClick={(event) => handleCloseNavMenu(event, page)}
                  >
                    {page}
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>

          <Typography
            variant="h6"
            noWrap
            component="div"
            fontWeight="bold"
            sx={hiddenOnMobile}
          >
            Inventory System &#47;
          </Typography>
          <Typography
            variant="h6"
            noWrap
            component="div"
            margin="10px"
            fontWeight="bold"
          >
            {currentUrl == "/dashboard"
              ? "Dashboard"
              : currentUrl == "/menus"
              ? "Weekly Menu"
              : currentUrl == "/items"
              ? "Inventory"
              : currentUrl == "/report-list"
              ? "Reports"
              : currentUrl == "/create-requests"
              ? "Create Request"
              : currentUrl == "/purchase-requests"
              ? "Purchase Request"
              : currentUrl == "/purchase-orders"
              ? "Purchase Orders "
              : currentUrl == "/users"
              ? "User Management"
              : currentUrl == "/categories"
              ? "Categories"
              : currentUrl == "/units"
              ? "Units"
              : currentUrl == "/roles-and-permissions"
              ? "Roles & Permissions"
              : ""}
          </Typography>

          {/* -------------------Icon Profile------------------------ */}
          <Fragment>
            <Typography
              marginRight={"1%"}
              marginLeft={"auto"}
              fontWeight={"bold"}
              fontSize="small"
            >
              Hi, {user.name}
            </Typography>
            <Avatar
              onClick={handleIconClick}
              src={
                `${user.profile_url}${user.profile}` ||
                `${user.profile_url}defaultProfile.png`
              }
              sx={{
                "&:hover": {
                  cursor: "pointer",
                  color: "primary.main",
                },
                fontSize: 35,
              }}
            />

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <Box padding={1} sx={{ width: 400 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3} direction={"row"}>
                      <Grid item xs={2} md={2}>
                        <Avatar
                          src={
                            `${user.profile_url}${user.profile}` ||
                            `${user.profile_url}"defaultProfile.png"`
                          }
                          sx={{ width: 60, height: 60 }}
                        />
                      </Grid>
                      <Grid item xs={7.5} md={7.5}>
                        <Typography
                          sx={{
                            marginLeft: "0.5rem",
                            fontSize: 18,
                            fontWeight: "bold",
                          }}
                        >
                          {user.name}
                        </Typography>
                        <Typography sx={{ marginLeft: "0.5rem", fontSize: 12 }}>
                          {user.email}
                        </Typography>
                      </Grid>
                      <Grid item xs={2.5} md={2.5}>
                        <FormControlLabel
                          control={<MaterialUISwitch sx={{ m: 1 }} />}
                          checked={switchState}
                          onChange={onSwitchChange}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>

              <Box padding={1}>
                <Grid container spacing={3} direction={"row"}>
                  <Grid item>
                    <Button fullWidth onClick={handleClickOpenEditProfile}>
                      Edit Profile
                    </Button>
                  </Grid>
                  <Grid item sx={{ marginLeft: "auto" }}>
                    <Button
                      fullWidth
                      onClick={() => handleConfirmation("logout")}
                    >
                      Logout
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Menu>
          </Fragment>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={open} sx={hiddenOnMobile}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeft />
          </IconButton>
        </DrawerHeader>
        <Box>
          <Divider />
          <List onMouseOver={handleDrawerOpen} onMouseOut={handleDrawerClose}>
          {can(Permissions.CAN_ACCESS_DASHBOARD) ? (
            <ActiveLink
              to="/dashboard"
              activeLink={location.pathname}
              isLightMode={isLightMode}
              isDarkMode={isDarkMode}
            >
                <ListItem
                  button
                  id="dashboard"
                  component={Link}
                  to="/dashboard"
                  onClick={handleLinkClick}
                  disabled={isButtonDisabled}
                >
                  <ListItemIcon>
                    <Dashboard />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItem>
              </ActiveLink>
            ) : (
              ""
            )}
            {can(Permissions.CAN_ACCESS_MENU) ? (
              <ActiveLink
                to="/menus"
                activeLink={location.pathname}
                isLightMode={isLightMode}
                isDarkMode={isDarkMode}
              >
                <ListItem 
                button id="menus" 
                component={Link} 
                to="/menus"
                onClick={handleLinkClick}
                disabled={isButtonDisabled}
                >
                  <ListItemIcon>
                    <RestaurantMenu />
                  </ListItemIcon>
                  <ListItemText primary="Weekly Menu" />
                </ListItem>
              </ActiveLink>
            ) : (
              ""
            )}
            {can(Permissions.CAN_ACCESS_ITEMS) ? (
              <Fragment>
                <Divider sx={{ margin: 2 }} />
                <ActiveLink
                  to="/items"
                  activeLink={location.pathname}
                  isLightMode={isLightMode}
                  isDarkMode={isDarkMode}
                >
                  <ListItem 
                  button 
                  id="items" 
                  component={Link} 
                  to="/items"
                  onClick={handleLinkClick}
                  disabled={isButtonDisabled}
                  >
                    <ListItemIcon>
                      <DiningOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Inventory" />
                  </ListItem>
                </ActiveLink>
              </Fragment>
            ) : (
              ""
            )}
            {can(Permissions.CAN_ACCESS_REPORTS) ? (
              <Fragment>
                <ActiveLink
                  to="/report-list"
                  activeLink={location.pathname}
                  isLightMode={isLightMode}
                  isDarkMode={isDarkMode}
                >
                  <ListItem
                    button
                    id="report"
                    component={Link}
                    to="/report-list"
                    onClick={handleLinkClick}
                    disabled={isButtonDisabled}
                  >
                    <ListItemIcon>
                      <ListAlt />
                    </ListItemIcon>
                    <ListItemText primary="Reports" />
                  </ListItem>
                </ActiveLink>
              </Fragment>
            ) : (
              ""
            )}

            {can(Permissions.CAN_CREATE_PURCHASE_REQUESTS) ? (
              <Fragment>
                <Divider sx={{ margin: 2 }} />
                <ActiveLink
                  to="/create-requests"
                  activeLink={location.pathname}
                  isLightMode={isLightMode}
                  isDarkMode={isDarkMode}
                >
                  <ListItem
                    button
                    id="createPurchase"
                    component={Link}
                    to="/create-requests"
                    onClick={handleLinkClick}
                    disabled={isButtonDisabled}
                  >
                    <ListItemIcon>
                      <PostAdd />
                    </ListItemIcon>
                    <ListItemText primary="Create Requests" />
                  </ListItem>
                </ActiveLink>
              </Fragment>
            ) : (
              ""
            )}

            {can(Permissions.CAN_ACCESS_PURCHASE_REQUESTS) ? (
              <Fragment>
                <ActiveLink
                  to="/purchase-requests"
                  activeLink={location.pathname}
                  isLightMode={isLightMode}
                  isDarkMode={isDarkMode}
                >
                  <ListItem
                    button
                    id="request"
                    component={Link}
                    to="/purchase-requests"
                    onClick={handleLinkClick}
                    disabled={isButtonDisabled}
                  >
                    <ListItemIcon>
                      <Badge badgeContent={pendingRequests} color="secondary">
                        <AddShoppingCart />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText primary="Purchase Requests" />
                  </ListItem>
                </ActiveLink>
              </Fragment>
            ) : (
              ""
            )}
            {can(Permissions.CAN_ACCESS_PURCHASE_ORDERS) ? (
              <ActiveLink
                to="/purchase-orders"
                activeLink={location.pathname}
                isLightMode={isLightMode}
                isDarkMode={isDarkMode}
              >
                <ListItem
                  button
                  id="orders"
                  component={Link}
                  to="/purchase-orders"
                  onClick={handleLinkClick}
                  disabled={isButtonDisabled}
                >
                  <ListItemIcon>
                    <Badge badgeContent={approvedOrders} color="secondary">
                      <ReceiptLongOutlined />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText primary="Purchase Orders" />
                </ListItem>
              </ActiveLink>
            ) : (
              ""
            )}

            {can(Permissions.CAN_ACCESS_USERS) ? (
              <Fragment>
                <Divider sx={{ margin: 2 }} />
                <ActiveLink
                  to="/users"
                  activeLink={location.pathname}
                  isLightMode={isLightMode}
                  isDarkMode={isDarkMode}
                >
                  <ListItem 
                  button 
                  id="users"
                  component={Link} 
                  to="/users"
                  onClick={handleLinkClick}
                  disabled={isButtonDisabled}
                  >
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText primary="User Management" />
                  </ListItem>
                </ActiveLink>
              </Fragment>
            ) : (
              ""
            )}

            {can(Permissions.CAN_ACCESS_CATEGORIES) ? (
              <Fragment>
                <Divider />
                <ListItem>
                  <Typography
                    sx={{
                      display: open ? "block" : "none",
                      fontSize: "15px",
                      opacity: 0.7,
                      mt: "10px",
                    }}
                  >
                    Configuration
                  </Typography>
                </ListItem>
                <ActiveLink
                  to="/categories"
                  activeLink={location.pathname}
                  isLightMode={isLightMode}
                  isDarkMode={isDarkMode}
                >
                  <ListItem
                    button
                    id="categories"
                    component={Link}
                    to="/categories"
                    onClick={handleLinkClick}
                    disabled={isButtonDisabled}
                  >
                    <ListItemIcon>
                      <Category />
                    </ListItemIcon>
                    <ListItemText primary="Categories" />
                  </ListItem>
                </ActiveLink>
              </Fragment>
            ) : (
              ""
            )}
            {can(Permissions.CAN_ACCESS_UNITS) ? (
              <ActiveLink
                to="/units"
                activeLink={location.pathname}
                isLightMode={isLightMode}
                isDarkMode={isDarkMode}
              >
                <ListItem 
                button 
                id="units" 
                component={Link} 
                to="/units"
                onClick={handleLinkClick}
                disabled={isButtonDisabled}
                >
                  <ListItemIcon>
                    <Straighten />
                  </ListItemIcon>
                  <ListItemText primary="Units" />
                </ListItem>
              </ActiveLink>
            ) : (
              ""
            )}

            {can(Permissions.CAN_VIEW_ROLE_PERMISSION) ? (
              <ActiveLink
                to="/roles-and-permissions"
                activeLink={location.pathname}
                isLightMode={isLightMode}
                isDarkMode={isDarkMode}
              >
                <ListItem
                  button
                  id="roles and permissions"
                  component={Link}
                  to="/roles-and-permissions"
                  onClick={handleLinkClick}
                  disabled={isButtonDisabled}
                >
                  <ListItemIcon>
                    <Lock />
                  </ListItemIcon>
                  <ListItemText primary="Roles & Permissions" />
                </ListItem>
              </ActiveLink>
            ) : (
              ""
            )}
          </List>
        </Box>
      </Drawer>

      {/* --DIALOG BOX--*/}
      <DialogBox
        open={openDialogBox}
        onClose={handleClose}
        maxWidth="md"
        title="Edit Profile"
      >
        <EditProfile snackBarData={snackBarData} onClose={handleClose} />
      </DialogBox>

      {/* -------------SNACKBAR-------------- */}
      <SnackBar
        open={openSnackbar}
        severity={snackbarSeverity}
        message={snackbarMessage}
      />

      {/* CONFIRMATION BOX */}
      <ConfirmationDialogBox
        open={openConfirmation}
        onClose={handleCloseConfirmation}
        save={handleLogout}
        id={id}
      />
    </Fragment>
  );
};
export default NavigationBar;
