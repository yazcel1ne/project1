import React, { useState, Fragment, useEffect } from "react";
import {
  TextField,
  Box,
  InputAdornment,
  Tooltip,
  CircularProgress,
  IconButton,
  Paper,
  Grid,
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import SnackBar from "../../components/SnackBar";
import { Visibility, Search, Print } from "@mui/icons-material";
import {
  DataGrid,
} from "@mui/x-data-grid";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import UpdatePurchaseOrder from "../../components/PurchaseOrders/UpdatePurchaseOrder";
import DialogBox from "../../components/DialogBox";
import api, { fetchPurchaseOrders } from "../../config/api";
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
import ViewPurchaseOrders from '../../components/PurchaseOrders/ViewPurchaseOrders';

const PurchaseOrders = () => {
  // hooks states
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [openDialogBox, setOpenDialogBox] = useState(false); //Open DialogBox
  const [dialogType, setDialogType] = useState(); //set dialogBox type
  const [selectedRow, setSelectedRow] = useState([]); //set the selected row

  //Pagination
  const [totalPage, setTotalPage] = useState(null);
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
  const Navigate = useNavigate();
  let newWindow;

  const handlePrint = (row) => {
    localStorage.setItem('row', JSON.stringify(row));
    newWindow = window.open('./print-orders');
    if (newWindow) {
      newWindow.onload = function () {
        setTimeout(() => {
          newWindow.print();
        }, 1000);
      };
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearchItem(initialValue.searchValue);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [initialValue.searchValue]);

  //Loading state
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
  };

  const status = [
    { value: 1, label: "All Purchase" },
    { value: 2, label: "Approved" },
    { value: 3, label: "Completed" },
    { value: 4, label: "Canceled" },
  ];

  const handleOpenView = (row, type) => {
    setOpenDialogBox(true);
    setDialogType(type);
    localStorage.setItem('row', JSON.stringify(row));
  };

  const handleClose = () => {
    setOpenDialogBox(false);
    fetchOrdersData();
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

  const fetchOrdersData = async () => {
    const params = new URLSearchParams();

    params.append("page", initialValue.pagination.page + 1);
    params.append("perPage", initialValue.pagination.pageSize);
    params.append("search", initialValue.searchValue);
    params.append("status", initialValue.selectedStatus);

    const response = await fetchPurchaseOrders(params);
    if (response.ok) {
      setPurchaseOrders(response.data.orders.data);
      setTotalPage(response.data.orders.total);
      setDataFetched(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
    setDataFetched(false);
    setIsLoading(true);
  }, [
    initialValue.pagination.pageSize,
    initialValue.pagination.page,
    initialValue.selectedStatus,
    debouncedSearchItem,
  ]);

  //SEARCH FUNCTION
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
    if (params.row.order_status === "Approved") {
      handleOpenUpdate(params.row, "update");
    } else {
      //Open OrdersDataGrid
      handleOpenView(params.row, "view");
    }
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
        <ClickableCell
          value={"PO-" + params.value}
          onClick={() => handleCellClick(params)}
        />
      ),
    },
    {
      field: "order_status",
      headerName: "Status",
      headerClassName: "headercolor",
      align: "center",
      flex: 1,
      headerAlign: "center",
      renderCell: (params) => {
        const getStatusStyle = (status) => {
          switch (status.toLowerCase()) {
            case "completed":
              return {
                color: "#3498DB",
              };
            case "approved":
              return {
                color: "#28B463",
              };
            case "canceled":
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
      align: "center",
      flex: 1,
      headerAlign: "center",
    },
    {
      field: "cost",
      headerName: "Cost",
      headerClassName: "headercolor",
      align: "right",
      flex: 1,
      headerAlign: "center",
      renderCell: (params) => (
        <Fragment>{formattedAmount(params.value)}</Fragment>
      ),
    },
    {
      field: "requested_by",
      headerName: "Approved by",
      headerClassName: "headercolor",
      align: "left",
      flex: 1,
      headerAlign: "left",
    },
    {
      field: "approved_by",
      headerName: "Updated by",
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
          <>
            {useParams.row.order_status !== "Approved"
              ? <Fragment>
                <Tooltip title="Print">
                  <IconButton
                    color="info"
                    onClick={() => { handlePrint(useParams.row) }}
                  >
                    <Print />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View Items">
                  <IconButton
                    color="info"
                    onClick={() => {
                      if (useParams.row.order_status === "Approved") {
                        handleOpenUpdate(useParams.row, "update");
                      } else {
                        //Open OrdersDataGrid
                        handleOpenView(useParams.row, "View Purchase Order");
                      }
                    }}
                  >
                    <Visibility />
                  </IconButton>
                </Tooltip>
              </Fragment>
              :
              <Tooltip title="View">
                <IconButton
                  color="info"
                  onClick={() => {
                    if (useParams.row.order_status === "Approved") {
                      handleOpenUpdate(useParams.row, "update");
                    } else {
                      //Open OrdersDataGrid
                      handleOpenView(useParams.row, "view");
                    }
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>
            }
          </>
        );
      },
      align: "center",
      flex: 1,
      headerAlign: "center",
    },
  ];

  const formattedAmount = (cost) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(cost);
  };

  return (
    <Fragment>
      {/* --HEADER-- */}

      <Box>
        {can(Permissions.CAN_ACCESS_PURCHASE_ORDERS) ? (
          <Box>
            <Paper sx={{ borderRadius: '20px' }}>
            <CustomToolbar>
              <Grid container spacing={1} justifyContent="flex-end">
                <Grid item xs={12} md={4} lg={2} sx={hiddenOnMobile}>
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
                <Grid item xs={10} sm={11} md={4} lg={2}>
                  <TextField
                    value={initialValue.searchValue}
                    onChange={handleSearchChange}
                    id="Search Items"
                    type="Search"
                    fullWidth
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
                rows={purchaseOrders}
                columns={columns}
                getRowId={(rows) => rows.id}
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
                      rows={purchaseOrders}
                      columns={columns}
                      filename={"PurchaseOrders.csv"}
                    />
                  ),
                }}
                rowSelection={false}
              />
            </Paper>
            </Paper>
          </Box>
        ) : (
          <Navigate to="/Unauthorized" />
        )}

      </Box>


      {/* --DIALOG BOX--*/}
      <DialogBox open={openDialogBox} maxWidth="xl" onClose={handleClose} title={dialogType == "View Purchase Order" ? dialogType : ""}>
        {dialogType == "update" ? (
          <UpdatePurchaseOrder
            snackBarData={snackBarData}
            purchaseOrder={selectedRow}
            onClose={handleClose}
          />
        ) : (
          <ViewPurchaseOrders
            purchaseOrder={selectedRow}
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
  );
};
export default PurchaseOrders;
