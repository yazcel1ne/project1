import React, { useState, useEffect, Fragment } from "react";
import {
  Button,
  TextField,
  Box,
  InputAdornment,
  CircularProgress,
  Tooltip,
  IconButton,
  Paper,
  Grid,
} from "@mui/material";
import {
  EditRounded,
  Search,
  Add,
  Block,
  CheckCircleOutline,
} from "@mui/icons-material";
import SnackBar from "../../components/SnackBar";
import { DataGrid } from "@mui/x-data-grid";
//dialogs
import DialogBox from "../../components/DialogBox";
import CreateUserDialog from "../../components/Users/CreateUserDialog";
import EditUserDialog from "../../components/Users/EditUserDialog";
import DeactivateUserDialog from "../../components/Users/DeactivateUserDialog";
import ReactivateUserDialog from "../../components/Users/ReactivateUserDialog";

import { fetchUsers as fetchUsersApi } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Permissions } from "../../constants/Permissions";
import DateFns from "../../components/DateFns";
import CustomToolbar from "../../components/CustomToolbar";
import { largePaperSize, usersDatagridSize } from "../../components/style";

const Users = () => {
  // users
  const [users, setUsers] = useState([]);
  // search
  const [searchValue, setSearchValue] = useState("");
  // dialog box
  const [openDialogBox, setOpenDialogBox] = useState(false);
  const [dialogType, setDialogType] = useState(); //set dialogBox type
  const [selectedRow, setSelectedRow] = useState([]); //set the selected row
  // snack bar
  const [snackBarInitialValue, setSnackBarInitialValue] = useState({
    openSnackbar: false,
    snackbarSeverity: "success",
    snackbarMessage: "",
  });
  // loading state
  const [isLoading, setIsLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  //debouncing
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  // spatie
  const { user } = useAuth();
  const can = (permission) => {
    return (user?.permissions || []).find(
      (givenPermission) => givenPermission == permission
    )
      ? true
      : false;
  };

  //debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchValue]);

  //snackbar
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

  //fetch
  const fetchUsers = async () => {
    const params = new URLSearchParams();

    params.append("search", searchValue);

    const response = await fetchUsersApi(params);
    if (response.ok) {
      setDataFetched(true);
      setIsLoading(false);
      const usersWithCategories = response.data.users.map(user => ({
        ...user,
        categories: JSON.parse(user.categories),
      }));
      setUsers(usersWithCategories);
    }
  };

  //search
  const handleSearchChange = (event) => {
    const inputValue = event.target.value;
    setSearchValue(inputValue);

    if (inputValue == " ") {
      fetchUsers();
    } else {
      fetchUsers(inputValue);
    }
  };

  //create
  const handleOpenCreate = (type) => {
    setOpenDialogBox(true);
    setDialogType(type);
  };

  // update
  const handleOpenEdit = (user, type) => {
    setOpenDialogBox(true);
    setDialogType(type);
    setSelectedRow(user);
  };

  // disable
  const handleOpenDeactivate = (user, type) => {
    const editUser = [];

    const id = user.id;
    editUser.id = id;

    setOpenDialogBox(true);
    setDialogType(type);
    setSelectedRow(user);
  };

  // reactivate
  const handleOpenReactivate = (user, type) => {
    const editUser = [];

    const id = user.id;
    editUser.id = id;

    setDialogType(type);
    setOpenDialogBox(true);
    setSelectedRow(user);
  };

  // close
  const handleClose = () => {
    setOpenDialogBox(false);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearchValue]);

  const columns = [
    {
      field: "name",
      headerName: "Full Name",
      headerClassName: "headercolor",
      align: "left",
      flex: 1,
      headerAlign: "left",
    },
    {
      field: "role",
      headerName: "Role",
      headerClassName: "headercolor",
      align: "left",
      flex: 1,
      headerAlign: "left",
    },
    {
      field: "email",
      headerName: "Email",
      headerClassName: "headercolor",
      align: "left",
      flex: 1,
      headerAlign: "left",
    },
    
    {
      field: "categories",
      headerName: "Categories",
      headerClassName: "headercolor",
      align: "left",
      flex: 1,
      headerAlign: "left",
      renderCell:  (params) => {
        if (Array.isArray(params.value)) {
          const categories = params.value.map((categories) => categories.name || "").join(", ");
          return (
            <Box style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {categories}
            </Box>
          );
        }
        return null;
      },
    },
    {
      field: "status",
      headerName: "Status",
      headerClassName: "headercolor",
      align: "center",
      flex: 1,
      headerAlign: "center",
      renderCell: (params) => {
        const getStatusStyle = (status) => {
          switch (status.toLowerCase()) {
            case "active":
              return {
                color: "#28B463",
              };
            case "disabled":
              return {
                color: "#E74C3C",
              };
            default:
              return {};
          }
        };

        const statusStyle = getStatusStyle(params.value);

        return (
          <Box
            style={{
              fontWeight: "bold",
              color: statusStyle.color,
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: "updated_at",
      headerName: "Date Updated",
      headerClassName: "headercolor",
      align: "left",
      flex: 1,
      headerAlign: "left",
      renderCell: (params) => <DateFns date={params.value} />,
    },
    {
      field: "actions",
      headerName: "Actions",
      headerClassName: "headercolor",
      renderCell: (useParams) => {
        return (
          <Fragment>
            {/* -- edit -- */}
            {!isDeveloper && can(Permissions.CAN_EDIT_USERS) ? (
              <Tooltip title="Edit User">
                <IconButton
                  color="info"
                  onClick={() => handleOpenEdit(useParams.row, "Edit User")}
                >
                  <EditRounded />
                </IconButton>
              </Tooltip>
            ) : (
              <span>
                <IconButton disabled>
                  <EditRounded />
                </IconButton>
              </span>
            )}
            {/* -- delete -- */}
            {useParams.row.status === "Active" ? (
              <Tooltip title="Deactivate User">
                {!isDeveloper && can(Permissions.CAN_DEACTIVATE_USERS) ? (
                  <IconButton
                    color="error"
                    onClick={() =>
                      handleOpenDeactivate(useParams.row, "Deactivate User")
                    }
                  >
                    <Block />
                  </IconButton>
                ) : (
                  <span>
                    <IconButton disabled>
                      <Block />
                    </IconButton>
                  </span>
                )}
              </Tooltip>
            ) : (
              <Tooltip title="Reactivate User">
                {/* -- reactivate -- */}
                {can(Permissions.CAN_REACTIVATE_USERS) ? (
                  <IconButton
                    color="success"
                    onClick={() =>
                      handleOpenReactivate(useParams.row, "Reactivate User")
                    }
                  >
                    <CheckCircleOutline />
                  </IconButton>
                ) : (
                  <IconButton disabled>
                    <CheckCircleOutline />
                  </IconButton>
                )}
              </Tooltip>
            )}
          </Fragment>
        );
      },
      align: "center",
      flex: 1,
      headerAlign: "center",
    },
  ];

  return (
    <Fragment>
      <Box>
        <Box>
          <Paper sx={{ borderRadius: "20px" }}>
            <CustomToolbar>
              <Grid container spacing={1}>
                <Grid item xs={12} md={3} sm={2} lg={2}>
                  {/* -- add  -- */}
                  {can(Permissions.CAN_CREATE_USERS) ? (
                    <Button
                      color="info"
                      variant="contained"
                      onClick={() => handleOpenCreate("Add User")}
                      
                    >
                      <Add />
                      ADD USER
                    </Button>
                  ) : (
                    <Navigate to="/Unauthorized" />
                  )}
                </Grid>

                <Grid item xs={12} md={3} sm={7}></Grid>
                <Grid item xs={12} md={4} sm={7}></Grid>
                <Grid item xs={12} md={3} sm={2}>
                  {/* -- search -- */}
                  <TextField
                    value={searchValue}
                    onChange={handleSearchChange}
                    id="Search Users"
                    type="Search"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                    label="Search User"
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </CustomToolbar>
            <Paper sx={largePaperSize}>
              <DataGrid
                sx={usersDatagridSize}
                rows={users}
                columns={columns}
                getRowId={(rows) => rows.id}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                    },
                  },
                }}
                pageSizeOptions={[9]}
                disableRowSelectionOnClick
                loading={isLoading && !dataFetched}
                overlay={
                  isLoading &&
                  !dataFetched && <CircularProgress color="loading" />
                }
              />
            </Paper>
          </Paper>
        </Box>
      </Box>

      {/* -- dialog -- */}
      <DialogBox
        open={openDialogBox}
        maxWidth="md"
        onClose={handleClose}
        title={dialogType}
      >
        {dialogType == "Add User" ? (
          <CreateUserDialog
            snackBarData={handleSnackbar}
            onClose={handleClose}
          />
        ) : dialogType == "Edit User" ? (
          <EditUserDialog
            snackBarData={snackBarData}
            onClose={handleClose}
            selectedUser={selectedRow}
          />
        ) : dialogType == "Deactivate User" ? (
          <DeactivateUserDialog
            snackBarData={snackBarData}
            onClose={handleClose}
            selectedUser={selectedRow}
          />
        ) : (
          <ReactivateUserDialog
            snackBarData={snackBarData}
            onClose={handleClose}
            selectedUser={selectedRow}
          />
        )}
      </DialogBox>
      {/* -- snackbar -- */}
      <SnackBar
        open={snackBarInitialValue.openSnackbar}
        severity={snackBarInitialValue.snackbarSeverity}
        message={snackBarInitialValue.snackbarMessage}
      />
    </Fragment>
  );
};
export default Users;
