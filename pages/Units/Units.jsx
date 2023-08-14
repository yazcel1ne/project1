import { React, Fragment } from "react";
import {
  Box,
  Toolbar,
  Button,
  IconButton,
  Tooltip,
  Grid,
  TextField,
  InputAdornment,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { EditRounded, Add, Search } from "@mui/icons-material";
import { useState } from "react";
import { useEffect } from "react";
import SnackBar from "../../components/SnackBar";
import api from "../../config/api";
import UpdateUnitDialog from "../../components/Units/UpdateUnitDialog";
import AddUnitDialog from "../../components/Units/AddUnitDialog";
import DialogBox from "../../components/DialogBox";
import { useAuth } from "../../contexts/AuthContext";
import { Permissions } from "../../constants/Permissions";
import CircularProgress from "@mui/material/CircularProgress";
import DatagridHeight from "../../components/DatagridHeight";
import CustomToolbar from "../../components/CustomToolbar";
import { useNavigate } from "react-router-dom";
import { fetchUnit } from "../../config/api";

const Units = () => {
  const [units, setUnits] = useState([]);
  const [openDialogBox, setOpenDialogBox] = useState(false); //Open DialogBox
  const [dialogType, setDialogType] = useState(); //set dialogBox type
  const [selectedRow, setSelectedRow] = useState([]); //set the selected row

  //Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);

  //Pagination
  const [totalItems, setTotalItems] = useState(null);
  const [initialValue, setInitialValue] = useState({
    searchValue: "",
    pagination: {
      page: 0,
      pageSize: 10,
    },
  });

  const [snackBarInitialValue, setSnackBarInitialValue] = useState({
    openSnackbar: false,
    snackbarSeverity: "success",
    snackbarMessage: "",
  });

  //spatie
  const { user } = useAuth();
  const can = (permission) => {
    return (user?.permissions || []).find(
      (givenPermission) => givenPermission == permission
    )
      ? true
      : false;
  };
  const [debouncedSearchItem, setDebouncedSearchItem] = useState("");

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearchItem(initialValue.searchValue);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [initialValue.searchValue]);

  const navigate = useNavigate();

  const notFound = () => {
    return navigate("*");
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

  //handleClick for Measurement
  const handleClickOpenMeasurement = (type) => {
    setOpenDialogBox(true);
    setDialogType(type);
  };

  const handleClose = () => {
    setOpenDialogBox(false);
    fetchUnitData();
  };

  const handleClickOpenEditMeasurement = (rowData, type) => {
    const editMeasure = [];

    const measurementId = rowData.row.id;
    editMeasure.measurementId = measurementId;

    const editMeasurement = rowData.row.name;
    editMeasure.editMeasurement = editMeasurement;

    const editUnit_abbreviation = rowData.row.unit_abbreviation;
    editMeasure.editUnit_abbreviation = editUnit_abbreviation;

    setSelectedRow(editMeasure);
    setOpenDialogBox(true);
    setDialogType(type);
  };

  //GET UNITS
  const fetchUnitData = async () => {
    const params = new URLSearchParams();

    params.set("page", initialValue.pagination.page + 1);
    params.set("perPage", initialValue.pagination.pageSize);
    params.set("search", initialValue.searchValue);

    const fetchUnitResponse = await fetchUnit(params);

    if (fetchUnitResponse.ok) {
      setUnits(fetchUnitResponse.data.units.data);
      setTotalItems(fetchUnitResponse.data.units.total);
      setDataFetched(true);
      setIsLoading(false);
    } else {
      notFound();
    }
  };

  useEffect(() => {
    fetchUnitData();
  }, [
    initialValue.pagination.pageSize,
    initialValue.pagination.page,
    debouncedSearchItem,
  ]);

  const handleSearchChange = (event) => {
    setInitialValue((prevValue) => ({
      ...prevValue,
      searchValue: event.target.value,
    }));
  };

  const handlePaginationModelChange = (newPagination) => {
    setInitialValue((prevValue) => ({
      ...prevValue,
      pagination: newPagination,
    }));
  };

  //UNITS COLUMNS
  const columnsMeasurement = [
    {
      field: "name",
      headerName: "Units Name",
      headerClassName: "headercolor",
      flex: 1,
      type: "text",
      headerAlign: "left",
      align: "left",
    },
    {
      field: "unit_abbreviation",
      headerName: "Units Abbreviation",
      headerClassName: "headercolor",
      flex: 1,
      align: "left",
      headerAlign: "left",
    },
  ];

  if (can(Permissions.CAN_UPDATE_UNITS)) {
    columnsMeasurement.push({
      field: "action",
      headerName: "Action",
      sortable: false,
      headerAlign: "center",
      headerClassName: "headercolor",
      flex: 1,
      renderCell: (cellValues) => {
        return (
          <Box sx={{ margin: "auto" }}>
            {can(Permissions.CAN_UPDATE_UNITS) ? (
              <Tooltip title="Update Unit">
                <IconButton
                  color="info"
                  onClick={(e) =>
                    handleClickOpenEditMeasurement(cellValues, "Update Units")
                  }
                >
                  <EditRounded />
                </IconButton>
              </Tooltip>
            ) : (
              ""
            )}
          </Box>
        );
      },
    });
  }

  return (
    <Fragment>
      {can(Permissions.CAN_ACCESS_UNITS) && (
        <Fragment>
          <Paper sx={{ borderRadius: '20px' }}>
          <CustomToolbar>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={2} lg={2}>
                {/* ----DIALOG ADD ITEM------------------- */}
                {can(Permissions.CAN_CREATE_UNITS) && (
                  <Button
                    color="info"
                    variant="contained"
                    onClick={() => handleClickOpenMeasurement("Add Units")}
               
                  >
                    <Add />
                    Add Unit
                  </Button>
                )}
              </Grid>
              <Grid item xs={12} sm={7} md={8}></Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  value={initialValue.searchValue}
                  onChange={handleSearchChange}
                  id="Search Units"
                  type="Search"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  variant="standard"
                />
              </Grid>
            </Grid>
          </CustomToolbar>

          <Paper sx={largePaperSize}>
            <DataGrid
              sx={{
                border: 0,
              }}
              rows={units}
              columns={columnsMeasurement}
              rowCount={totalItems || 0}
              paginationModel={initialValue.pagination}
              paginationMode="server"
              onPaginationModelChange={handlePaginationModelChange}
              pageSizeOptions={[10, 25, 50, 75, 100]}
              loading={isLoading && !dataFetched}
              overlay={isLoading && <CircularProgress color="loading" />}
            />
          </Paper>
          </Paper>
          {/* --DIALOG BOX--*/}
          <DialogBox open={openDialogBox} maxWidth="md" onClose={handleClose} title={dialogType}>
            {dialogType == "Add Units" ? (
              <AddUnitDialog
                snackBarData={snackBarData}
                onClose={handleClose}
              />
            ) : (
              <UpdateUnitDialog
                selectedMeasurement={selectedRow}
                snackBarData={snackBarData}
                onClose={handleClose}
              />
            )}
          </DialogBox>

          {/* -------------SNACKBAR-------------- */}
          <SnackBar
            open={snackBarInitialValue.openSnackbar}
            severity={snackBarInitialValue.snackbarSeverity}
            message={snackBarInitialValue.snackbarMessage}
          />
        </Fragment>
      )}
    </Fragment>
  );
};
export default Units;
