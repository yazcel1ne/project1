import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import api from "../../config/api";
import { Edit } from "@mui/icons-material";
import UpdateMenus from "../../components/Menus/UpdateMenus";
import DialogBox from "../../components/DialogBox";
import SnackBar from "../../components/SnackBar";
import { Permissions } from "../../constants/Permissions";
import { useAuth } from "../../contexts/AuthContext";
import {
  menuCardContent,
  filterMenuTypography,
} from "../../components/customizedComponentStyle";

const Menu = () => {
  const [daysItem, setDaysItem] = useState([]);
  const [openDialogBox, setOpenDialogBox] = useState(false);
  const [selectedDayItems, setSelectedDayItems] = useState([]);
  const [snackBarInitialValue, setSnackBarInitialValue] = useState({
    openSnackbar: false,
    snackbarSeverity: "success",
    snackbarMessage: "",
  });

  //Snack Bar
  const handleOpenSnackbar = (newValue) => {
    setSnackBarInitialValue((prevValue) => ({
      ...prevValue,
      openSnackbar: newValue,
    }));
  };

  const handleSnackbarSeverity = (newValue) => {
    setSnackBarInitialValue((prevValue) => ({
      ...prevValue,
      snackbarSeverity: newValue,
    }));
  };

  const handleSnackbarMessage = (newValue) => {
    setSnackBarInitialValue((prevValue) => ({
      ...prevValue,
      snackbarMessage: newValue,
    }));
  };

  const snackBarData = (open, severity, message) => {
    handleOpenSnackbar(open);
    handleSnackbarSeverity(severity);
    handleSnackbarMessage(message);
    setTimeout(() => {
      handleOpenSnackbar(false);
    }, 3000);
  };

  const handleClose = () => {
    setOpenDialogBox(false);
    fetchMenus();
    fetchSnacks();
  };

  const handleClickOpenEditMenus = (day) => {
    const menuDaysItem = daysItem.filter((item) => item.days === day);

    setSelectedDayItems(menuDaysItem);
    setOpenDialogBox(true);
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const currentDay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  const fetchMenus = async () => {
    const response = await api.get("/api/menus");
    if (response.ok) {
      setDaysItem(response.data.menus);
    } else {
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // spatie
  const { user } = useAuth();
  const can = (permission) => {
    return (user?.permissions || []).find(
      (givenPermission) => givenPermission == permission
    )
      ? true
      : false;
  };

  return (
    <Fragment>
      <Box>
        <Grid container spacing={1}>
          {daysOfWeek.map((day) => (
            <Grid item xs={12} sm={6} md={4} key={day}>
              <Card>
                <CardContent sx={menuCardContent}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Tooltip title={day === currentDay ? "Current Day" : ""}>
                      <Typography
                        variant="h4"
                        sx={{
                          color: day === currentDay ? "#ff4545" : "inherit",
                        }}
                      >
                        {day}
                      </Typography>
                    </Tooltip>
                    
                    {can(Permissions.CAN_EDIT_MENU) && (
                      <Tooltip title="Edit Menu">
                        <IconButton
                          color="info"
                          onClick={() => handleClickOpenEditMenus(day)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  <Divider />
                  {(() => {
                    const filterMenu = daysItem.filter(
                      (item) => item.days === day && item.menu !== ""
                    );

                    return filterMenu.length === 0 ? (
                      <Typography sx={filterMenuTypography}>
                        No Available Menu
                      </Typography>
                    ) : (
                      <List disablePadding>
                        {filterMenu.map((item) => (
                          <ListItem key={item.id} disablePadding>
                            <ListItemText primary={item.menu} />
                          </ListItem>
                        ))}
                      </List>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* --DIALOG BOX--*/}
      <DialogBox open={openDialogBox} maxWidth="md" onClose={handleClose}>
        <UpdateMenus
          selectedDayItems={selectedDayItems}
          onClose={handleClose}
          snackBarData={snackBarData}
        />
      </DialogBox>

      {/* -------------SNACKBAR-------------- */}
      <SnackBar
        open={snackBarInitialValue.openSnackbar}
        severity={snackBarInitialValue.snackbarSeverity}
        message={snackBarInitialValue.snackbarMessage}
      />
    </Fragment>
  );
};

export default Menu;
