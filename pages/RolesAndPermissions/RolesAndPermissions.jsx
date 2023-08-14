import React, { useState, useEffect, Fragment } from "react";
import {
  Box,
  Typography,
  Switch,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Paper,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Add, Search, Clear } from "@mui/icons-material";
import {
  fetchPermissions as fetchPermissionsApi,
  fetchRoleWithPermissions as fetchRoleWithPermissionsApi,
  insertPermission,
  revokePermission,
} from "../../config/api";
import { DataGrid } from "@mui/x-data-grid";
import { useAuth } from "../../contexts/AuthContext";
import { Permissions } from "../../constants/Permissions";
import CustomToolbar from "../../components/CustomToolbar";
import SnackBar from "../../components/SnackBar";

//dialogs
import DialogBox from "../../components/DialogBox";
import AddRoleDialog from "../../components/RolesAndPermissions/AddRoleDialog";
import AddPermissionDialog from "../../components/RolesAndPermissions/AddPermissionDialog";

const RolesAndPermissions = () => {
  //hooks
  const [rolePermissionsColumn, setRolePermissionsColumn] = useState([]);
  const [originalRolePermissionsColumn, setOriginalRolePermissionsColumn] =
    useState([]);
  const [permissionsRow, setPermissionsRow] = useState([]);
  const [originalPermissionsRow, setOriginalPermissionsRow] = useState([]);
  useState([]);
  //dialogbox
  const [openDialogBox, setOpenDialogBox] = useState(false);
  const [dialogType, setDialogType] = useState(); //set dialogBox type
  //snackbar
  const [snackBarInitialValue, setSnackBarInitialValue] = useState({
    openSnackbar: false,
    snackbarSeverity: "success",
    snackbarMessage: "",
  });
  //search
  const [searchValuePermission, setSearchValuePermission] = useState("");
  const [searchValueRole, setSearchValueRole] = useState("");
  // loading state
  const [isLoading, setIsLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);

  //spatie
  const { user } = useAuth();
  const can = (permission) => {
    return (user?.permissions || []).find(
      (givenPermission) => givenPermission == permission
    )
      ? true
      : false;
  };

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

  //debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  //dialog boxes
  const handleOpenCreateRole = (type) => {
    setOpenDialogBox(true);
    setDialogType(type);
  };

  const handleOpenCreatePermission = (type) => {
    setOpenDialogBox(true);
    setDialogType(type);
  };

  const handleClose = () => {
    setOpenDialogBox(false);
    fetchRoleWithPermissions();
  };

  //insert
  const handleInsertSwitch = async (permissionName, roleName) => {
    const response = await insertPermission({
      role: roleName,
      permission: permissionName,
    });
    setIsLoading(true);
    if (response.ok) {
      setIsLoading(false);
      snackBarData(true, "success", response.data.message);
      handleClose();
    } else {
      setIsLoading(false);
      snackBarData(true, "error", response.data.error);
    }
  };

  //revoke
  const handleRevokeSwitch = async (permissionName, roleName) => {
    const response = await revokePermission({
      role: roleName,
      permission: permissionName,
    });
    setIsLoading(true);
    if (response.ok) {
      setIsLoading(false);
      snackBarData(true, "success", response.data.message);
      handleClose();
    } else {
      setIsLoading(false);
      snackBarData(true, "error", response.data.error);
    }
  };

  //switch actions
  const handleSwitchChange = (status, permissionName, roleName) => {
    if (status) {
      handleInsertSwitch(permissionName, roleName);
    } else {
      handleRevokeSwitch(permissionName, roleName);
    }
  };

  //search input actions
  const handleSearchChangePermission = (event) => {
    const inputValuePermission = event.target.value;
    setSearchValuePermission(inputValuePermission);
  };

  const handleSearchChangeRole = (event) => {
    const inputValueRole = event.target.value;
    setSearchValueRole(inputValueRole);
  };

  //search clear functions
  const handleClearSearchPermission = () => {
    setSearchValuePermission('');
    setRolePermissionsColumn(originalRolePermissionsColumn);
    setPermissionsRow(originalPermissionsRow);
  }

  const handleClearSearchRole = () => {
    setSearchValueRole('');
    setRolePermissionsColumn(originalRolePermissionsColumn);
    setPermissionsRow(originalPermissionsRow);
  }

  //data grid insertion
  const fetchRoleWithPermissions = async () => {
    //role columns
    const response = await fetchRoleWithPermissionsApi();
    if (response.ok) {
      setDataFetched(true);
      setIsLoading(false);
      const rolesWPermissions = response.data;
      const columns = rolesWPermissions.map((role) => {
        return {
          id: role.role_id,
          field: role.role_name,
          headerName: role.role_name,
          headerClassName: "headercolor",
          minWidth: 150,
          renderCell: (params) => {
            return (
              <Box>
                <Switch
                  size="small"
                  defaultChecked={role.permission.includes(params.row.name)}
                  onChange={(event) => {
                    handleSwitchChange(
                      event.target.checked,
                      params.row.name,
                      role.role_name
                    );
                  }}
                  disabled={role.role_name === "Developer"}
                />
              </Box>
            );
          },
        };
      });
      const permissionColumn = {
        id: 0,
        field: "name",
        headerName: "Permission",
        headerClassName: "headercolor",
        minWidth: 250,
      };
      columns.unshift(permissionColumn);
      setRolePermissionsColumn(columns);
      setOriginalRolePermissionsColumn(columns);
    }
  };

  const fetchPermissions = async () => {
    const response = await fetchPermissionsApi();
    if (response.ok) {
      const permissions = response.data.permission;
      const rows = permissions.map((permission, index) => ({
        id: index + 1,
        name: permission,
      }));
      setPermissionsRow(rows);
      setOriginalPermissionsRow(rows);
    }
  };

  useEffect(() => {
    fetchRoleWithPermissions();
    fetchPermissions();
  }, []);

  //search permission
  const handleSearchKeyDownPermission = debounce(() => {
    if (searchValuePermission === "") {
      setPermissionsRow(originalPermissionsRow);
    } else {
      setIsLoading(true);
      const filteredPermissions = originalPermissionsRow.filter(
        (permission) => {
          return (
            permission.name &&
            permission.name
              .toLowerCase()
              .includes(searchValuePermission.toLowerCase())
          );
        }
      );
      setPermissionsRow(filteredPermissions);
      setIsLoading(false);
    }
  }, 500);

  //search role
  const handleSearchKeyDownRole = debounce(() => {
    if (searchValueRole === "") {
      setRolePermissionsColumn(originalRolePermissionsColumn);
    } else {
      setIsLoading(true);
      const filteredRoles = originalRolePermissionsColumn
        .slice(1)
        .filter((role) => {
          return (
            role.field &&
            role.field.toLowerCase().includes(searchValueRole.toLowerCase())
          );
        });
      setRolePermissionsColumn([
        originalRolePermissionsColumn[0],
        ...filteredRoles,
      ]);
      setIsLoading(false);
    }
  }, 500);

  return (
    <Fragment>
      <Box>

        <Fragment>
          Hello {user.name}! Your role is{" "}
          <Typography display={"inline"} color="primary" fontWeight="bold">
            {user.role}
          </Typography>
          .
        </Fragment>
        <Paper sx={{ borderRadius: '20px' }}>
          <CustomToolbar>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6} md={2} lg={1.4}>
                {/* -- create role -- */}
                {can(Permissions.CAN_CREATE_ROLES) ? (
                  <Button
                    color="info"
                    variant="contained"
                    onClick={() => handleOpenCreateRole("Add Roles")}
                  
                  >
                    <Add />
                    ADD ROLE
                  </Button>
                ) : (
                  ""
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={2} lg={2}>
                {/* -- create permission -- */}
                {can(Permissions.CAN_CREATE_PERMISSIONS) ? (
                  <Button
                    color="info"
                    variant="contained"
                    onClick={() => handleOpenCreatePermission("Add Permission")}
               
                  >
                    <Add />
                    ADD PERMISSION
                  </Button>
                ) : (
                  ""
                )}
              </Grid>
              <Grid item xs={12} sm={12} md={4} lg={4.5}></Grid>
              <Grid item xs={6} sm={6} md={2}>
                {/* -- search role -- */}
                <TextField
                  fullWidth
                  value={searchValueRole}
                  onChange={handleSearchChangeRole}
                  onKeyDown={handleSearchKeyDownRole}
                  id="Search Role"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      searchValueRole && (
                        <InputAdornment position="end">
                          <IconButton onClick={handleClearSearchRole}>
                            <Clear color="primary" />
                          </IconButton>
                        </InputAdornment>
                      )
                    ),
                  }}
                  variant="outlined"
                  label="Search Roles"
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={6} md={2}>
                {/* -- search permission -- */}
                <TextField
                  fullWidth
                  value={searchValuePermission}
                  onChange={handleSearchChangePermission}
                  onKeyDown={handleSearchKeyDownPermission}
                  id="Search Permission"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      searchValuePermission && (
                        <InputAdornment position="end">
                          <IconButton onClick={handleClearSearchPermission}>
                            <Clear color="primary" />
                          </IconButton>
                        </InputAdornment>
                      )
                    ),
                  }}
                  variant="outlined"
                  size="small"
                  label="Search Permissions"
                />
              </Grid>
            </Grid>
          </CustomToolbar>
          <Paper
            sx={{
              height: "70vh",
              padding: "10px",
              borderRadius: "20px",
              overflow: "auto",
            }}
          >
            <DataGrid
              sx={{ border: 0 }}
              rows={permissionsRow}
              columns={rolePermissionsColumn}
              pageSize={1}
              disableSelectionOnClick
              loading={isLoading}
              overlay={
                isLoading && !dataFetched && <CircularProgress color="loading" />
              }
            />
          </Paper>
        </Paper>
      </Box>

      {/* -- dialog -- */}
      <DialogBox open={openDialogBox} maxWidth="md" onClose={handleClose} title={dialogType}>
        {dialogType == "Add Roles" ? (
          <AddRoleDialog snackBarData={handleSnackbar} onClose={handleClose} />
        ) : (
          <AddPermissionDialog
            snackBarData={snackBarData}
            onClose={handleClose}
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
export default RolesAndPermissions;
