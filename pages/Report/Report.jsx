import React, { useState, useEffect, Fragment } from "react";
import {
  Toolbar,
  TextField,
  Box,
  Typography,
  InputAdornment,
  Autocomplete,
  Tooltip,
  CircularProgress,
  IconButton,
  CardMedia,
  Grid,
  Paper,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import { History, Search, Edit } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { fetchSubCategoriesList, fetchItemsList } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";
import DialogBox from "../../components/DialogBox";
import SnackBar from "../../components/SnackBar";
import ReportLogsDialog from "../../components/ReportsList/ReportLogsDialog";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import UpdateItemDialog from "../../components/ReportsList/UpdateItemDialog";
import CustomToolbar from "../../components/CustomToolbar";
import {
  hiddenOnDesktop,
  hiddenOnMobile,
  imageEnlargement,
  largeDatagridSize,
  largePaperSize,
  menuFilterListSize,
} from "../../components/style";
import { fetchCategoriesList } from "../../config/api";
import Export from "../../components/Export";
import ViewImage from "../../components/ViewImage";
import { Permissions } from "../../constants/Permissions";

const Report = () => {
  //FETCHING HOOKS
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [openDialogBox, setOpenDialogBox] = useState(false); //Open DialogBox
  const [dialogType, setDialogType] = useState(); //set dialogBox type
  const [selectedRow, setSelectedRow] = useState([]); //set the selected row
  const [totalPage, setTotalPage] = useState(null);
  const [searchItem, setSearchItem] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  const [snackBarInitialValue, setSnackBarInitialValue] = useState({
    openSnackbar: false,
    snackbarSeverity: "success",
    snackbarMessage: "",
  });

  const [debouncedSearchItem, setDebouncedSearchItem] = useState("");
  // const [openDialogImageEnlarge, setOpenDialogImageEnlarge] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearchItem(searchItem);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchItem]);

  const [anchorEl, setAnchorEl] = useState(null); //filter
  const open = Boolean(anchorEl);

  const handleImageClick = (imageUrl, type) => {
    setSelectedImage(imageUrl);
    setOpenDialogBox(true);
    setDialogType(type);
  };

  const handleClickFilter = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleClickOpenDialog = (row, type) => {
    setOpenDialogBox(true);
    setDialogType(row.item_name);
    setSelectedRow(row);
  };

  const handleClose = () => {
    setOpenDialogBox(false);
    fetchItems();
  };

  const handleEdit = (items, type) => {
    setOpenDialogBox(true);
    setDialogType(type);
    setSelectedRow(items);
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

  //SPATIE
  const { user } = useAuth();
  const can = (permission) => {
    return (user?.permissions || []).find(
      (givenPermission) => givenPermission == permission
    )
      ? true
      : false;
  };

  //FETCH ALL ITEMS
  const fetchItems = async () => {
    setDataFetched(false);
    setIsLoading(true);
    const params = new URLSearchParams();

    params.append("page", paginationModel.page + 1);
    params.append("perPage", paginationModel.pageSize);
    params.append("search", searchItem);
    params.append("category", selectedCategory);
    params.append("subCategory", selectedSubCategory);

    const response = await fetchItemsList(params);
    if (response.ok) {
      setDataFetched(true);
      setIsLoading(false);
      setTotalPage(response.data.items.total);
      setItems(response.data.items.data);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [
    debouncedSearchItem,
    paginationModel,
    selectedCategory,
    selectedSubCategory,
  ]);

  useEffect(() => {
    const fetchCategoriesData = async () => {
      const userResponse = await getUser();
      if (userResponse.ok) {
        const userData = userResponse.data.data;
        const userCategories = userData.categories;
  
        const categoryResponse = await fetchCategoriesList();
        if (categoryResponse.ok) {
          const fullCategories = categoryResponse.data.categories;
  
          const matchingCategories = fullCategories.filter((fullCategories) =>
            userCategories.some((userCategories) => userCategories.id === fullCategories.id)
          );
  
          setCategories(matchingCategories);
  
          if (matchingCategories.length > 0) {
            setSelectedCategory(matchingCategories[0].id);
  
            const subCategoryResponse = await fetchSubCategoriesList(selectedCategory);
            setSubCategories(subCategoryResponse.data.categories);
          }
        } else {
          // Handle error
        }
      } else {
        // Handle error
      }
    };
    fetchCategoriesData();
  }, []);

  const handleCategoryChange = (id) => {
    setSelectedCategory(id);
    setSelectedSubCategory(0);
    const selectedCategoryIds = subCategories.filter(
      (subCategory) => subCategory.parent_id === id
    );
    if (selectedCategoryIds) {
      setFilteredSubCategories(selectedCategoryIds);
    } else {
      setFilteredSubCategories([]);
    }
    setPaginationModel(...paginationModel, page, 0);
  };

  const handleSubCategoryChange = (id) => {
    setSelectedSubCategory(id);
    setPaginationModel(...paginationModel, page, 0);
  };

  const handleSearchChange = (value) => {
    setSearchItem(value || "");
    setPaginationModel(...paginationModel, page, 0);
  };

  //DATAGRID COLUMNS
  const columns = [
    {
      field: "image",
      headerName: "Image",
      headerClassName: "headercolor",
      renderCell: (cellValues) => {
        // CELL RENDERER FOR IMAGE
        return (
          <CardMedia
            component="img"
            src={cellValues.row.image}
            onClick={() => handleImageClick(cellValues.row.image, "View Image")}
            sx={{
              height: 50,
              width: 50,
              borderRadius: "20px",
              border: "1px solid white",
            }}
          />
        );
      },
      align: "center",
      flex: 1,
      headerAlign: "center",
    },
    {
      field: "item_name",
      headerName: "Item Name",
      headerClassName: "headercolor",
      align: "left",
      flex: 1,
      headerAlign: "left",
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
      field: "sub_category_id",
      headerName: "Sub Category",
      headerClassName: "headercolor",
      align: "left",
      flex: 1,
      headerAlign: "left",
    },
    {
      field: "price",
      headerName: "Price",
      headerClassName: "headercolor",
      align: "right",
      flex: 1,
      headerAlign: "right",
      renderCell: (params) => (
        <Fragment>{formattedAmount(params.value)}</Fragment>
      ),
    },
    {
      field: "quantity",
      headerName: "Quantity",
      headerClassName: "headercolor",
      align: "right",
      flex: 1,
      headerAlign: "right",
    },
    {
      field: "unit_abbreviation",
      headerName: "Unit",
      headerClassName: "headercolor",
      align: "right",
      flex: 1,
      headerAlign: "right",
    },
    {
      field: "created_at",
      headerName: "Date Added",
      headerClassName: "headercolor",
      align: "right",
      flex: 1,
      headerAlign: "right",
      valueFormatter: (params) => {
        const formattedDate = format(new Date(params.value), "MMMM dd, yyyy");
        return formattedDate;
      },
    },
    {
      field: "updated_at",
      headerName: "Date Updated",
      headerClassName: "headercolor",
      align: "right",
      flex: 1,
      headerAlign: "right",
      valueFormatter: (params) => {
        const formattedDate = format(new Date(params.value), "MMMM dd, yyyy");
        return formattedDate;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      headerClassName: "headercolor",
      renderCell: (cellValues) => {
        //CELL RENDERER FOR BUTTONS
        return (
          <Fragment>
            {can(Permissions.CAN_EDIT_REPORTS) ? (
              <Tooltip title="Edit">
                <IconButton
                  color="info"
                  onClick={() => handleEdit(cellValues.row, "Edit Item")}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
            ) : (
              ""
            )}
            <Tooltip title="View item history">
              <IconButton
                color="info"
                onClick={(e) => {
                  handleClickOpenDialog(cellValues.row);
                }}
              >
                <History />
              </IconButton>
            </Tooltip>
          </Fragment>
        );
      },
      align: "center",
      flex: 1,
      headerAlign: "center",
    },
  ];

  const formattedAmount = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  return (
    <Fragment>
      {/* --HEADER-- */}
      <Box>
        <Paper sx={{ borderRadius: "20px" }}>
          <CustomToolbar>
            <Grid container spacing={1} justifyContent="flex-end">
              <Grid item xs={12} md={4} lg={2} sx={hiddenOnMobile}>
                <Autocomplete
                  options={categories}
                  getOptionLabel={(option) => option.name || ""}
                  value={
                    categories.find(
                      (option) => option.id === selectedCategory
                    ) || ""
                  }
                  onChange={(event, newValue) => {
                    handleCategoryChange(newValue.id);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Filter by Category"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                  disableClearable
                />
              </Grid>

              {selectedCategory !== 0 && (
                <Grid item xs={12} md={4} lg={2} sx={hiddenOnMobile}>
                  <Autocomplete
                    options={filteredSubCategories}
                    getOptionLabel={(option) => option.name || ""}
                    value={
                      filteredSubCategories.find(
                        (option) => option.id === selectedSubCategory
                      ) || ""
                    }
                    onChange={(event, newValue) => {
                      handleSubCategoryChange(newValue.id);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Filter by Subcategory"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    disableClearable
                  />
                </Grid>
              )}

              <Grid item xs={10} sm={11} md={4} lg={2}>
                <TextField
                  value={searchItem}
                  onChange={(event) => {
                    handleSearchChange(event.target.value);
                  }}
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
                  label="Search Item"
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
              <Autocomplete
                sx={{ marginLeft: "auto" }}
                options={categories}
                getOptionLabel={(option) => option.name || ""}
                onChange={(event, newValue) => {
                  handleCategoryChange(newValue.id);
                }}
                value={
                  selectedCategory === 0
                    ? { id: 0, name: "All Items" }
                    : categories.find(
                        (option) => option.id === selectedCategory
                      )
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    size="small"
                    label="Filter by Category"
                    variant="outlined"
                    sx={menuFilterListSize}
                  />
                )}
                disableClearable
                isOptionEqualToValue={(option, value) =>
                  option.id === value.id && option.name === value.name
                }
              />
            </MenuItem>
            <MenuItem>
              <Autocomplete
                options={filteredSubCategories}
                getOptionLabel={(option) => option.name || ""}
                value={
                  filteredSubCategories.find(
                    (option) => option.id === selectedSubCategory
                  ) || ""
                }
                onChange={(event, newValue) => {
                  handleSubCategoryChange(newValue.id);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    size="small"
                    label="Filter by Subcategory"
                    variant="outlined"
                    sx={menuFilterListSize}
                  />
                )}
                disableClearable
              />
            </MenuItem>
          </Menu>
          <Paper sx={largePaperSize}>
            <DataGrid
              sx={largeDatagridSize}
              rows={items}
              columns={columns}
              getRowId={(row) => row.id}
              rowCount={parseInt(totalPage, 10) || 0}
              pageSizeOptions={[10, 25, 50, 75, 100]}
              paginationModel={paginationModel}
              paginationMode="server"
              onPaginationModelChange={setPaginationModel}
              loading={isLoading && !dataFetched}
              overlay={
                isLoading &&
                !dataFetched && <CircularProgress color="loading" />
              }
              slots={{
                toolbar: () => (
                  <Export
                    rows={items}
                    columns={columns}
                    filename={"Reports.csv"}
                  />
                ),
              }}
              rowSelection={false}
            />
          </Paper>
        </Paper>
      </Box>

      {/* --DIALOG BOX-- */}
      <DialogBox
        open={openDialogBox}
        maxWidth="md"
        onClose={handleClose}
        title={dialogType}
      >
        {dialogType == "Edit Item" ? (
          <UpdateItemDialog
            cell={selectedRow}
            snackBarData={snackBarData}
            onClose={handleClose}
          />
        ) : dialogType == "View Image" ? (
          <ViewImage onClose={handleClose} source={selectedImage} />
        ) : (
          <ReportLogsDialog onClose={handleClose} data={selectedRow} />
        )}
      </DialogBox>
      {/* {/ -------------SNACKBAR-------------- /} */}
      <SnackBar
        open={snackBarInitialValue.openSnackbar}
        severity={snackBarInitialValue.snackbarSeverity}
        message={snackBarInitialValue.snackbarMessage}
      />
    </Fragment>
  );
};
export default Report;
