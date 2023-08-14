import React, { useState, useEffect, Fragment } from "react";
import {
  Grid,
  Box,
  Typography,
  Button,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  CardMedia,
  Autocomplete,
  TablePagination,
  Menu,
  MenuItem,
  ImageListItemBar,
} from "@mui/material";
import {
  getUser,
  fetchItemsList,
  fetchCategoriesList,
  fetchSubCategoriesList,
} from "../../config/api";
import UseMultipleDialog from "../../components/Items/UseMultipleDialog";
import SnackBar from "../../components/SnackBar";
import DialogBox from "../../components/DialogBox";
import { ArrowUpward, ArrowDownward, Search } from "@mui/icons-material";
import UseSingleItem from "../../components/Items/UseSingleItem";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { Permissions } from "../../constants/Permissions";
import CustomToolbar from "../../components/CustomToolbar";
import {
  hiddenOnMobile,
  hiddenOnDesktop,
  menuFilterListSize,
} from "../../components/style";
import LoadingPage from "../LoadingPage/LoadingPage";
import InfoIcon from "@mui/icons-material/Info";

export default function ItemPage() {
  const [items, setItems] = useState([]);
  const [openDialogBox, setOpenDialogBox] = useState(false); //Open DialogBox
  const [dialogType, setDialogType] = useState(); //set dialogBox type
  const [editItems, setEditItems] = useState([]); //set the selected cell
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(25);
  const [totalItem, setTotalItem] = useState(null);
  const [searchItem, setSearchItem] = useState("");
  const [anchorEl, setAnchorEl] = useState(null); //filter
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedSortBy, setSelectedSortBy] = useState("item_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(0);
  const [isLoading, setIsloading] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [debouncedSearchItem, setDebouncedSearchItem] = useState("");
  const [snackBarInitialValue, setSnackBarInitialValue] = useState({
    openSnackbar: false,
    snackbarSeverity: "success",
    snackbarMessage: "",
  });

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearchItem(searchItem);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchItem]);

  const { user } = useAuth();
  const can = (permission) => {
    return (user?.permissions || []).find(
      (givenPermission) => givenPermission == permission
    )
      ? true
      : false;
  };

  const sortBy = [
    { label: "Item Name", value: "item_name" },
    { label: "Quantity", value: "quantity" },
    { label: "Date Updated", value: "updated_at" },
  ];

  const handleMouseEnter = (item) => {
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const open = Boolean(anchorEl);
  const handleClickFilter = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = event.target.value;
    setPerPage(newRowsPerPage);
    setCurrentPage(0);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleUseMultiple = (type) => {
    setOpenDialogBox(true);
    setDialogType(type);
  };

  const handleUseSingle = (items, type) => {
    setEditItems(items);
    setOpenDialogBox(true);
    setDialogType(type);
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

  const handleClose = () => {
    setOpenDialogBox(false);
    fetchItemsData();
  };

  const fetchItemsData = async () => {
    const params = new URLSearchParams();

    params.append("page", currentPage + 1);
    params.append("perPage", perPage);
    params.append("search", searchItem);
    params.append("sortDirection", sortDirection);
    params.append("sortBy", selectedSortBy);
    params.append("category", selectedCategory);
    params.append("subCategory", selectedSubCategory);

    const response = await fetchItemsList(params);

    if (response.ok) {
      setIsloading(false);
      setItems(response.data.items.data);
      setTotalItem(response.data.items.total);
    } else {
    }
  };
  useEffect(() => {
    fetchItemsData();
    setIsloading(true);
  }, [
    currentPage,
    debouncedSearchItem,
    selectedCategory,
    selectedSubCategory,
    perPage,
    selectedSortBy,
    sortDirection,
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
  
            const subCategoryResponse = await fetchSubCategoriesList(
              matchingCategories[0].id
            );
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
    setCurrentPage(0);
    const selectedCategoryIds = subCategories.filter(
      (subCategory) => subCategory.parent_id === id
    );
    if (selectedCategoryIds) {
      setFilteredSubCategories(selectedCategoryIds);
    } else {
      setFilteredSubCategories([]);
    }
  };

  const handleSubCategoryChange = (id) => {
    setSelectedSubCategory(id);
    setCurrentPage(0);
  };

  const handleSortByChange = (value) => {
    setSelectedSortBy(value);
    setCurrentPage(0);
  };

  const handleSearchChange = (value) => {
    setSearchItem(value || "");
    setCurrentPage(0);
  };

  return (
    <Fragment>
      <Fragment>
        <Box>
          <Paper sx={{ borderRadius: '20px' }}>
            <CustomToolbar>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  {can(Permissions.CAN_USE_ITEMS_BULK) ? (
                    <Button
                     
                      color="info"
                      variant="contained"
                      onClick={() => handleUseMultiple("Update Multiple Items")}
                    >
                      Update Multiple Items
                    </Button>
                  ) : (
                    ""
                  )}
                </Grid>

                {selectedCategory !== 0 ? (
                  <Grid item xs={6} md={8} lg={1}></Grid>
                ) : (
                  <Grid item xs={6} md={8} lg={3}></Grid>
                )}

                <Grid item xs={6} md={3} lg={2} sx={hiddenOnMobile}>
                  <Autocomplete

                    options={categories}
                    getOptionLabel={(option) => option.name || ""}
                    value={categories.find(
                      (option) => option.id === selectedCategory
                    )}
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
                  <Grid item xs={6} md={3} lg={2} sx={hiddenOnMobile}>
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
                    // hidden={selectedCategory == 0}
                    />
                  </Grid>
                )}

                <Grid item xs={6} md={3} lg={2} sx={hiddenOnMobile}>
                  <Autocomplete
                    options={sortBy}
                    getOptionLabel={(option) => option.label || ""}
                    value={
                      selectedSortBy === "item_name"
                        ? { value: "item_name", label: "Item Name" }
                        : sortBy.find((option) => option.value === selectedSortBy)
                    }
                    onChange={(event, newValue) => {
                      handleSortByChange(newValue.value);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Sort By"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    disableClearable
                  />
                </Grid>
                <Grid item xs={10} sm={11} md={3} lg={2}>
                  <TextField

                    value={searchItem}
                    id="Search Request"
                    type="Search"

                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    onChange={(event) => {
                      handleSearchChange(event.target.value);
                    }}
                    variant="outlined"
                    label="Search Item"
                    size="small"
                    fullWidth
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
                  options={categories}
                  getOptionLabel={(option) => option.name || ""}
                  value={
                     categories.find(
                          (option) => option.id === selectedCategory
                        )
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
                      sx={menuFilterListSize}
                    />
                  )}
                  disableClearable
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
                      size="small"
                      label="Filter by Subcategory"
                      variant="outlined"
                      fullWidth
                      sx={menuFilterListSize}
                    />
                  )}
                  disableClearable
                />
              </MenuItem>

              <MenuItem>
                <Autocomplete
                  options={sortBy}
                  getOptionLabel={(option) => option.label || ""}
                  value={
                    selectedSortBy === "item_name"
                      ? { value: "item_name", label: "Item Name" }
                      : sortBy.find((option) => option.value === selectedSortBy)
                  }
                  onChange={(event, newValue) => {
                    handleSortByChange(newValue.value);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Sort By"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                  disableClearable
                  sx={menuFilterListSize}
                />
              </MenuItem>
            </Menu>
            <Box>
              <Paper
                elevation={3}
                sx={{
                  padding: 1,
                  height: "67vh",
                  overflow: "auto",
                  borderRadius: "10px",
                }}
              >
                {isLoading ? (
                  <LoadingPage />
                ) : (
                  <Grid container spacing={1}>
                    {items.map((item, index) => (
                      <Grid item xs={6} md={4} lg={2.4} key={index}>
                        <Box
                          position="relative"
                          onMouseEnter={() => handleMouseEnter(item)}
                          onMouseLeave={handleMouseLeave}
                          sx={{
                            "&:hover": {
                              cursor: "pointer",
                            },
                          }}
                          onClick={() => handleUseSingle(item, "Update Quantity")}
                        >
                          {can(Permissions.CAN_USE_ITEMS_SINGLE) && (
                            <CardMedia
                              className="itemCardMedia"
                              component="img"
                              src={item.image}
                              height="200"
                            />
                          )}

                          {hoveredItem === item &&
                            can(Permissions.CAN_USE_ITEMS_SINGLE) && (
                              <Box
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                backgroundColor="rgba(0, 0, 0, 0.6)"
                                borderRadius="10px"
                              >
                                <Typography variant="h6" color="white">
                                  Use Item
                                </Typography>
                              </Box>
                            )}

                          <ImageListItemBar
                            actionPosition="left"
                            title={` ${item.item_name}`}
                            subtitle={
                              <Fragment>
                                Quantity: {item.quantity} {item.unit_abbreviation}
                                <br />
                                Date:{" "}
                                {format(
                                  new Date(item.updated_at),
                                  "MMMM dd, yyyy"
                                )}
                              </Fragment>
                            }
                          ></ImageListItemBar>
                        </Box>
                      </Grid>
                    ))}
                    {items.length === 0 && (
                      <Typography variant="body1" sx={inventoryPaper}>
                        No available item
                      </Typography>
                    )}
                  </Grid>
                )}
              </Paper>

            </Box>
            </Paper>
        </Box>
        
        <Box>
          <TablePagination
            component={Box}
            count={totalItem || 0}
            page={currentPage}
            onPageChange={(event, page) => handlePageClick(page)}
            rowsPerPage={perPage}
            onRowsPerPageChange={(event) => handleChangeRowsPerPage(event)}
            labelRowsPerPage="Per Page"
          />
        </Box>
        <DialogBox open={openDialogBox} maxWidth="md" onClose={handleClose} title={dialogType}>
          {dialogType == "Update Multiple Items" ? (
            <UseMultipleDialog
              snackBarData={snackBarData}
              onClose={handleClose}
            />
          ) : (
            <UseSingleItem
              cell={editItems}
              snackBarData={snackBarData}
              onClose={handleClose}
            />
          )}
        </DialogBox>
      </Fragment>
      {/* {/ -------------SNACKBAR-------------- /} */}
      <SnackBar
        open={snackBarInitialValue.openSnackbar}
        severity={snackBarInitialValue.snackbarSeverity}
        message={snackBarInitialValue.snackbarMessage}
      />
    </Fragment>
  );
}
