import React, { useState, useEffect, Fragment } from "react";
import {
  Button,
  TextField,
  Box,
  InputAdornment,
  Tooltip,
  CircularProgress,
  IconButton,
  Paper,
  Grid,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import SnackBar from "../../components/SnackBar";
import DialogBox from "../../components/DialogBox";
import CreatePurchaseRequest from "../../components/PurchaseRequests/CreatePurchaseRequest";
import { DataGrid } from "@mui/x-data-grid";
import { useAuth } from "../../contexts/AuthContext";
import { Visibility, Search, Autorenew } from "@mui/icons-material";
import UpdatePurchaseRequest from "../../components/PurchaseRequests/UpdatePurchaseRequest";
import { fetchPurchaseRequests } from "../../config/api";
import { Permissions } from "../../constants/Permissions";
import DateFns from "../../components/DateFns";
import CustomToolbar from "../../components/CustomToolbar";
import {
  hiddenOnDesktop,
  hiddenOnMobile,
  largeDatagridSize,
  largePaperSize,
} from "../../components/style";
import ClickableCell from "../../components/clickableCell";
import Export from "../../components/Export";

const purchaseRequests = () => {
  // hooks states
  const [requests, setRequests] = useState([]);
  const [openDialogBox, setOpenDialogBox] = useState(false); //Open DialogBox
  const [dialogType, setDialogType] = useState(); //set dialogBox type
  const [selectedRow, setSelectedRow] = useState([]); //set the selected row

  //Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);

  //Pagination
  const [totalPage, setTotalPage] = useState(null);
  const [purchaseRowData, setPurchaseRowData] = useState([]);
  const [initialValue, setInitialValue] = useState({
    searchValue: "",
    selectedStatus: "All Purchase",
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

  const [debouncedSearchItem, setDebouncedSearchItem] = useState("");

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearchItem(initialValue.searchValue);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [initialValue.searchValue]);

  //spatie
  const { user } = useAuth();
  const can = (permission) => {
    return (user?.permissions || []).find(
      (givenPermission) => givenPermission == permission
    )
      ? true
      : false;
  };

  const status = [
    { value: 1, label: "All Purchase" },
    { value: 2, label: "Approved" },
    { value: 3, label: "Pending" },
    { value: 4, label: "Rejected" },
  ];

  const [anchorEl, setAnchorEl] = React.useState(null); //filter
  const open = Boolean(anchorEl);
  const handleClickFilter = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenUpdate = (row, type) => {
    setOpenDialogBox(true);
    setDialogType(type);
    setSelectedRow(row);
    localStorage.setItem('purchaseRequestRow', JSON.stringify(row));
  };

  const handleOpenCreateClick = (row,type) => {
    setPurchaseRowData(row);
    setOpenDialogBox(true);
    setDialogType(type);
  };

  const handleClose = () => {
    setOpenDialogBox(false);
    fetchRequestsData();
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

  const fetchRequestsData = async () => {
    setDataFetched(false);
    setIsLoading(true);

    const params = new URLSearchParams();

    params.append("page", initialValue.pagination.page + 1);
    params.append("perPage", initialValue.pagination.pageSize);
    params.append("search", initialValue.searchValue);
    params.append("status", initialValue.selectedStatus);

  const response = await fetchPurchaseRequests(params);

    if (response.ok) {
      setDataFetched(true);
      setIsLoading(false);
      setRequests(response.data.requests.data);
      setTotalPage(response.data.requests.total);
    } else {
    }
  };

  useEffect(() => {
    fetchRequestsData();
  }, [
    initialValue.pagination.pageSize,
    initialValue.pagination.page,
    initialValue.selectedStatus,
    debouncedSearchItem,
  ]);

  //Search
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

  const handleStatusChange = (event) => {
    const newValue = event.target.value;
    if (newValue && newValue !== "All Purchase") {
      setInitialValue((prevValue) => ({
        ...prevValue,
        selectedStatus: newValue,
      }));
    } else {
      setInitialValue((prevValue) => ({
        ...prevValue,
        selectedStatus: "All Purchase",
      }));
    }
  };

  const getStatusValue = () => {
    return initialValue.selectedStatus;
  };

  //Clickable Purchase Number
  const handleCellClick = (params) => {
    handleOpenUpdate(params.row, "update");
  };

  //DATAGRID COLUMNS
  const columns = [
    {
      field: "purchase_number",
      headerName: "Purchase Number",
      headerClassName: "headercolor",
      align: "right",
      flex: 1,
      headerAlign: "right",
      renderCell: (params) => (
        <>
          <ClickableCell
            value={"PR-" + params.value}
            onClick={() => handleCellClick(params)}
          />
        </>
      ),
    },
    {
      field: "status",
      headerName: "Request Status",
      headerClassName: "headercolor",
      align: "center",
      flex: 1,
      headerAlign: "center",
      renderCell: (params) => {
        const getStatusStyle = (status) => {
          switch (status.toLowerCase()) {
            case "pending":
              return {
                color: "#ff9800",
              };
            case "approved":
              return {
                color: "#28B463",
              };
            case "rejected":
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
      field: "category",
      headerName: "Category",
      headerClassName: "headercolor",
      align: "left",
      flex: 1,
      headerAlign: "left",
    },
    {
      field: "requested_by",
      headerName: "Requested By",
      headerClassName: "headercolor",
      align: "left",
      flex: 1,
      headerAlign: "left",
    },
    {
      field: "approved_by",
      headerName: "Approved By",
      headerClassName: "headercolor",
      align: "left",
      flex: 1,
      headerAlign: "left",
    },

    {
      field: "created_at",
      headerName: "Date Added",
      headerClassName: "headercolor",
      align: "left",
      flex: 1,
      headerAlign: "left",
      renderCell: (params) => <DateFns date={params.value} />,
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
        // Custom cell renderer that includes buttons
        return (
          <Fragment>
            <Tooltip title="View">
              {can(Permissions.CAN_UPDATE_PURCHASE_REQUESTS) ? (
                <Fragment>
                  <Tooltip title="Repurchase Items">
                    <IconButton
                      color="warning"
                      onClick={() => {
                        handleOpenCreateClick(useParams.row, "Repurchase");
                      }}
                    >
                      <Autorenew />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Items">
                  <IconButton
                    color="info"
                    onClick={() => {
                      handleOpenUpdate(useParams.row, "update");
                    }}
                  >
                    <Visibility />
                  </IconButton>
                  </Tooltip>
                </Fragment>
              ) : (
                ""
              )}
            </Tooltip>
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
      {/* --HEADER-- */}

      <Box>
        <Box>
          <Paper sx={{ borderRadius: '20px' }}>
            <CustomToolbar>
              {/* --Create Button--*/}
              <Grid container spacing={1}>
                <Grid item xs={12} md={4} lg={3}></Grid>
                <Grid item xs={12} md={2} lg={5}></Grid>
                <Grid item xs={12} md={3} lg={2} sx={hiddenOnMobile}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="status-label">Filter by Status</InputLabel>
                    <Select
                      labelId="status-label"
                      value={getStatusValue()}
                      onChange={handleStatusChange}
                    >
                      {status.map((option) => (
                        <MenuItem key={option.value} value={option.label}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={10} sm={11} md={3} lg={2}>
                  <TextField
                    fullWidth
                    value={initialValue.searchValue}
                    onChange={handleSearchChange}
                    id="Search Request"
                    type="Search"

                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                    label="Search"
                    size="small"
                  />
                </Grid>
                <Grid item xs={2} sm={1} sx={hiddenOnDesktop}>
                  <Button
                    id="menu-appbar"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleClickFilter}
                  >
                    Filter
                  </Button>
                </Grid>
              </Grid>
            </CustomToolbar>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              sx={hiddenOnDesktop}
            >
              <MenuItem>
                <FormControl fullWidth size="small">
                  <InputLabel id="status-label">Filter by Status</InputLabel>
                  <Select
                    labelId="status-label"
                    value={getStatusValue()}
                    onChange={handleStatusChange}
                  >
                    {status.map((option) => (
                      <MenuItem key={option.value} value={option.label}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </MenuItem>
            </Menu>
            <Paper sx={largePaperSize}>
              <DataGrid
                sx={largeDatagridSize}
                rows={requests}
                columns={columns}
                getRowId={(row) => row.id}
                rowCount={totalPage || 0}
                pageSizeOptions={[10, 25, 50, 75, 100]}
                paginationModel={initialValue.pagination}
                paginationMode="server"
                onPaginationModelChange={handlePaginationModelChange}
                loading={isLoading && !dataFetched}
                overlay={
                  isLoading &&
                  !dataFetched && <CircularProgress color="loading" />
                }
                slots={{
                  toolbar: () => (
                    <Export
                      rows={requests}
                      columns={columns}
                      filename={"PurchaseRequest.csv"}
                    />
                  ),
                }}
                rowSelection={false}
              />
            </Paper>
            </Paper>
        </Box>
      </Box>

      {/* --DIALOG BOX--*/}
      <DialogBox open={openDialogBox} maxWidth="xl" onClose={handleClose} title={dialogType == "Repurchase" ? dialogType : ""}>
        {dialogType == "update" ? (
          <UpdatePurchaseRequest
            purchaseRequest={selectedRow}
            snackBarData={snackBarData}
            onClose={handleClose}
          />
        ) : ( 
          <CreatePurchaseRequest
            snackBarData={snackBarData}
            onClose={handleClose}
            purchaseRowData = {purchaseRowData} /> // This is the Repurchase, the called the createPurchaseRequest again.
        )}
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
export default purchaseRequests;
