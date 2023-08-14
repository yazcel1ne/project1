import {
  Button,
  Grid,
  TextField,
  Autocomplete,
  Tooltip,
  IconButton,
  Typography,
  Box,
  Paper,
  TablePagination,
  Menu,
  MenuItem,
  Badge,
  FormHelperText,
  FormControl,
} from "@mui/material";
import React, { useEffect, useState, useRef, Fragment } from "react";
import api, {
  fetchItemsForPurchase,
  fetchUnitsForPurchase,
  createPurchaseRequest,
  fetchCategory,
  fetchSubCategoriesList,
  fetchCategoryForRepurchase,
  fetchPurchasesForRequests,
  fetchCategoriesList,
} from "../../config/api";
import { Delete, Add } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmationButtons from "../ConfirmationButtons";
import {
  centerContents,
  hiddenOnDesktop,
  hiddenOnMobile,
  marginTopInMobileAndPc,
  rightContents,
} from "../../components/style";
import SnackBar from "../SnackBar";
import { purchaseRequestPaper } from "../customizedComponentStyle";
import LoadingPage from "../../pages/LoadingPage/LoadingPage";
import { useFormik } from "formik";
import * as Yup from "yup";

const PurchaseRequest = ({ purchaseRowData }) => {
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false); // set the loading state
  const [mainCategory, setMainCategory] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(
    localStorage.getItem("categoryId") || ""
  );
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [purchaseDrafts, setPurchaseDrafts] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [save, setSave] = useState(false);
  const [isFormDirty, setFormDirty] = useState(false);
  const [purchases, setPurchases] = useState(
    JSON.parse(localStorage.getItem("purchase")) || []
  );

  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [selectedIndex, setSelectedIndex] = useState([
    {
      index: "",
      draftId: "",
    },
  ]);
  const open = Boolean(anchorEl);

  const handleClickListItem = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const resetPurchase = () => {
    setPurchases([
      {
        itemId: "",
        itemName: "",
        price: "",
        unitId: "",
        measurement: "",
        categoryId: "",
        quantity: "",
        status: false,
      },
    ]);
    localStorage.removeItem("purchase");
  };

  const handleMenuDateClick = async (event, index, draftId, categoryId) => {
    setAnchorEl(null);
    setSelectedIndex((prevValue) => ({
      ...prevValue,
      index: index,
      draftId: draftId,
    }));
    handleCategoryChange(categoryId, false, false);
    const response = await api.get("/api/get-draft-purchases-by-draft-id", {
      draftId,
    });
    console.log(response);
    if (response.ok) {
      const newPurchases = response.data.draftPurchase.map((purchase) => ({
        itemId: purchase.item_id,
        itemName: purchase.item_name,
        price: purchase.price,
        unitId: purchase.unit_id,
        measurement: purchase.item_quantity || 0,
        categoryId: purchase.sub_category_id,
        quantity: purchase.quantity,
        status: true,
      }));
      setPurchases(newPurchases);
    }
  };
  const handleMenuDeleteIconClick = () => {
    alert("hello");
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const validationSchema = Yup.object({
    itemName: Yup.string().required("Item name is required"),
  });

  const initialValues = {
    itemName: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = event.target.value;
    setPerPage(newRowsPerPage);
    setCurrentPage(0);
  };

  const handleCategoryChange = (id, resetDraftData, resetPurchaseData) => {
    setSelectedMainCategory(id);
    localStorage.setItem("categoryId", id);
    fetchItems(id);
    const selectedCategoryIds = categories.filter(
      (subCategory) => subCategory.parent_id === id
    );
    if (selectedCategoryIds) {
      setFilteredSubCategories(selectedCategoryIds);
    } else {
      setFilteredSubCategories([]);
    }
    if (resetDraftData) {
      resetSelectedDraftPurchase();
    }
    if (resetPurchaseData) {
      resetPurchase();
    }
  };

  const returnIndex = (index) => {
    return perPage * (currentPage + 1) - perPage + index;
  };

  const [snackBarInitialValue, setSnackBarInitialValue] = useState({
    openSnackbar: false,
    snackbarSeverity: "success",
    snackbarMessage: "",
  });

  const { user } = useAuth();

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

  const handleCreate = () => {
    setSave(true);
    setConfirmationButtons(true);
  };

  const handleSaveDraft = () => {
    setConfirmationButtons(true);
    setSave(false);
  };

  const fetchItems = async (id) => {
    const isCategoryId = id ? true : false;
    if (isCategoryId) {
      setIsLoading(true);
      const response = await fetchItemsForPurchase(id);
      if (response.ok) {
        const items = response.data.items;
        setItems(items);

        const filteredItems = items.slice(0, Math.min(items.length, 200));
        setFilteredItems(filteredItems);
        setIsLoading(false);
      }
    }
  };

  const fetchUnits = async () => {
    const response = await fetchUnitsForPurchase();
    if (response.ok) {
      setUnits(response.data.units);
    }
  };

  const fetchMainCategories = async () => {
    const categoryResponse = await fetchCategoriesList();
    if (categoryResponse.ok) {
      setMainCategory(categoryResponse.data.categories);
    }
  };

  const fetchSubCategories = async () => {
    const response = await fetchSubCategoriesList();
    if (response.ok) {
      setCategories(response.data.categories);
      fetchMainCategories();
    }
  };

  const fetchAllDataForRePurchase = async () => {
    const isCategoryId = purchaseRowData ? true : false;
    if (isCategoryId) {
      const id = purchaseRowData.category_id;
      fetchItems(id);
      setSelectedMainCategory(id);
      localStorage.setItem("categoryId", id);
      const response = await fetchCategoryForRepurchase(id);
      if (response.ok) {
        setFilteredSubCategories(response.data.categories);
        fetchPurchasesForRepurchase();
      }
    } else {
      const isCategoryId = localStorage.getItem("categoryId") ? true : false;
      if (isCategoryId) {
        const categoryId = localStorage.getItem("categoryId");
        fetchItems(categoryId);
        fetchMainCategories();
        const response = await fetchCategoryForRepurchase(categoryId);
        if (response.ok) {
          setFilteredSubCategories(response.data.categories);
        }
      } else {
        setIsLoading(false);
      }
    }
  };

  const setNewPurchase = (purchases) => {
    const newPurchases = purchases.map((purchase) => ({
      itemId: purchase.item_id,
      itemName: purchase.item_name,
      price: purchase.price,
      unitId: purchase.unit_id,
      measurement: purchase.item_quantity || 0,
      categoryId: purchase.sub_category_id,
      quantity: purchase.quantity,
      status: purchase.item_id ? true : false,
    }));
    return newPurchases;
  };

  const fetchPurchasesForRepurchase = async () => {
    const isPurchaseId = purchaseRowData ? true : false;
    if (isPurchaseId) {
      setIsLoading(true);
      const purchaseId = purchaseRowData.id;
      const response = await fetchPurchasesForRequests(purchaseId);
      if (response.ok) {
        setPurchases(setNewPurchase(response.data.purchaseRequest));
        setIsLoading(false);
      }
    }
  };

  const fetchDraftPurchases = async () => {
    const response = await api.get("api/get-all-draft-purchases");
    if (response.ok) {
      setPurchaseDrafts(response.data.draftPurchase);
    }
  };
  useEffect(() => {
    setIsLoading(true);
    fetchUnits();
    fetchSubCategories();
    fetchAllDataForRePurchase();
    fetchDraftPurchases();
  }, []);

  const handleAddClick = () => {
    setPurchases([
      ...purchases,
      {
        itemId: "",
        itemName: "",
        price: "",
        unitId: "",
        measurement: "",
        categoryId: "",
        quantity: "",
        status: false,
      },
    ]);
  };

  const handleRemoveClick = (index) => {
    const newPurchases = [...purchases];
    newPurchases.splice(index, 1);
    setPurchases(newPurchases);
  };

  const handlePurchaseUpdate = (index, field, value) => {
    const updatedPurchase = {
      ...purchases[index],
      [field]:
        field === "itemName"
          ? value.replace(/\b\w/g, (c) => c.toUpperCase())
          : value,
    };
    setFormDirty(true);

    // Update corresponding fields based on selected item
    if (field === "itemName") {
      const filteredItems = items
        .filter((item) =>
          item.item_name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 100);
      setFilteredItems(filteredItems);

      const selectedItem = filteredItems.find(
        (item) => item.item_name.toLowerCase() === value.toLowerCase()
      );
      
      if (selectedItem) {
        updatedPurchase.itemId = selectedItem.id;
        updatedPurchase.unitId = selectedItem.unit_id;
        updatedPurchase.measurement = selectedItem.quantity;
        updatedPurchase.categoryId = selectedItem.category_id;
        updatedPurchase.price = selectedItem.price;
        updatedPurchase.status = true;
        setFilteredItems(items.slice(0, 200));
      } else {
        updatedPurchase.itemId = "";
        updatedPurchase.measurement = "0";
        updatedPurchase.status = false;
      }
    
    }

    const updatedPurchaseList = [...purchases];
    updatedPurchaseList[index] = updatedPurchase;
    setPurchases(updatedPurchaseList);
    localStorage.setItem("purchase", JSON.stringify(updatedPurchaseList));
  };

  const handleSaveClick = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    const response = await createPurchaseRequest({
      purchases,
      selectedMainCategory,
    });
    if (!isFormDirty) {
      // No user input has been made, show an error message or take appropriate action
      snackBarData(true, "error", "Please make some changes before submitting");
      return;
    }
    if (response.ok) {
      setConfirmationButtons(false);
      snackBarData(true, "success", response.data.message);
      setIsLoading(false);
      fetchDraftPurchases();
      resetPurchase();
    } else {
      setIsLoading(false);
      setConfirmationButtons(false);
      snackBarData(true, "error", response.data.error);
    }
  };

  const handleSaveDraftClick = async () => {
    setIsLoading(true);
    const response = await api.post("/api/save-draft-purchase", {
      purchases,
      selectedMainCategory,
    });
    if (!isFormDirty) {
      // No user input has been made, show an error message or take appropriate action
      snackBarData(true, "error", "Please make some changes before submitting");
      return;
    }
    if (response.ok) {
      handleMenuDeleteIconClick("", selectedDraftPurchase.draftId, false);
      resetSelectedDraftPurchase();
      setConfirmationButtons(false);
      snackBarData(true, "success", response.data.message);
      setIsLoading(false);
      resetPurchase();
      fetchDraftPurchases();
      onClose();
    } else {
      setIsLoading(false);
      setConfirmationButtons(false);
      snackBarData(true, "error", response.data.error);
    }
  };

  useEffect(() => {
    totalAmount();
  }, [purchases]);

  const totalAmount = () => {
    let total = 0;
    purchases.map((purchase) => {
      total += parseFloat((purchase.quantity * purchase.price).toFixed(2));
    });
    return total.toFixed(2);
  };

  const formattedCost = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
  }).format(totalAmount());

  const formatUpdatedAt = (updatedAt) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(updatedAt).toLocaleDateString(undefined, options);
  };

  const paperRef = useRef(null);

  useEffect(() => {
    if (paperRef.current) {
      paperRef.current.scrollTop = paperRef.current.scrollHeight;
    }
  }, [purchases]);

  return (
    <Fragment>
      <Box sx={marginTopInMobileAndPc} padding={1}>
        <Paper sx={{ borderRadius: "20px" }}>
          <Grid container spacing={1} padding={1}>
            <Grid item xs={12} md={3}>
              {!purchaseRowData && (
                <Autocomplete
                  loading={isLoading}
                  options={mainCategory}
                  getOptionLabel={(option) => option.name}
                  value={
                    mainCategory.find(
                      (option) => option.id === selectedMainCategory
                    ) || { name: "", value: "" }
                  }
                  onChange={(event, newValue) => {
                    handleCategoryChange(newValue.id, true, true);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label={"Category"}
                      variant="outlined"
                    />
                  )}
                  disableClearable
                />
              )}
            </Grid>

            <Grid item xs={12} md={3} sx={centerContents}>
              {purchases.length == 0 && (
                <Typography>Please select a category first!</Typography>
              )}
            </Grid>
            <Grid item xs={12} md={3} sx={rightContents}>
              {purchaseDrafts.length != 0 && !purchaseRowData && (
                <Box textAlign={"center"}>
                  <Badge badgeContent={purchaseDrafts.length} color="secondary">
                    <Button onClick={handleClickListItem}>Drafts</Button>
                  </Badge>
                  {selectedDraftPurchase.draftId && (
                    <FormHelperText>
                      [{selectedDraftPurchase.index + 1}]{" "}
                      {formatUpdatedAt(
                        purchaseDrafts[selectedDraftPurchase.index]?.updated_at
                      )}
                    </FormHelperText>
                  )}
                </Box>
              )}
              <Menu
                id="lock-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "lock-button",
                  role: "listbox",
                }}
              >
                {purchaseDrafts.map((draft, index) => (
                  <MenuItem
                    sx={{ width: "200px" }}
                    key={index}
                    selected={index === selectedDraftPurchase.index}
                  >
                    <Grid container>
                      <Grid
                        item
                        xs={8}
                        md={8}
                        onClick={(event) =>
                          handleMenuDateClick(
                            event,
                            index,
                            draft.draft_id,
                            draft.category_id
                          )
                        }
                      >
                        {`[${index + 1}]  ${new Date(
                          draft.updated_at
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}`}
                      </Grid>
                      <Grid
                        item
                        xs={4}
                        md={4}
                        onClick={(event) =>
                          handleMenuDeleteIconClick(event, draft.draft_id, true)
                        }
                        sx={rightContents}
                      >
                        <Tooltip title="Remove Draft">
                          <Delete color="error" />
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </MenuItem>
                ))}
              </Menu>
            </Grid>
            <Grid item xs={12} md={3} sx={rightContents} padding={0}>
              <Typography textAlign="right">
                Estimated Total Price: {formattedCost}
              </Typography>
            </Grid>
          </Grid>
          {isLoading ? (
            <LoadingPage />
          ) : (
            <Paper sx={purchaseRequestPaper} ref={paperRef}>
              {purchases
                .slice(currentPage * perPage, (currentPage + 1) * perPage)
                .map((purchase, index) => (
                  <Fragment key={index}>
                    <Box
                      sx={{ ...centerContents, marginTop: index > 0 ? 2 : 0 }}
                    >
                      <Typography marginRight={1}>
                        {returnIndex(index + 1)}
                      </Typography>
                      <Paper
                        sx={{
                          width: "100%",
                          gap: "2",
                        }}
                      >
                        <Grid
                          container
                          marginTop={1}
                          padding={2}
                          paddingBottom={0}
                        >
                          <Grid
                            container
                            item
                            spacing={1}
                            xs={12}
                            md={11}
                            lg={11}
                          >
                            <Grid item marginBottom={1} xs={12} md={6} lg={4}>
                              <Autocomplete
                                loading={isLoading}
                                freeSolo
                                fullWidth
                                options={filteredItems}
                                getOptionDisabled={(option) =>
                                  purchases.some(
                                    (p) => p.itemName === option.item_name
                                  )
                                }
                                value={
                                  items.find(
                                    (option) =>
                                      option.item_name.toLowerCase() ===
                                      purchase.itemName.toLowerCase()
                                  ) || {
                                    item_name: purchase.itemName,
                                    value: purchase.itemName,
                                  }
                                }
                                getOptionLabel={(option) => option.item_name}
                                onChange={(event, newValue) => {
                                  handlePurchaseUpdate(
                                    returnIndex(index),
                                    "itemName",
                                    newValue.item_name
                                  );
                                }}
                                onInputChange={(event, newInputValue) => {
                                  handlePurchaseUpdate(
                                    returnIndex(index),
                                    "itemName",
                                    newInputValue
                                  );
                                }}
                                renderInput={(params) => (
                                  <Box>
                                    <TextField
                                      {...params}
                                      size="small"
                                      label="Item Name"
                                      variant="outlined"
                                      // {...formik.getFieldProps("itemName")}
                                      // onBlur={formik.handleBlur("itemName")}
                                      // error={
                                      //   formik.touched.itemName &&
                                      //   Boolean(formik.errors.itemName)
                                      // }
                                      // helperText={
                                      //   formik.touched.itemName &&
                                      //   formik.errors.itemName
                                      // }
                                    />
                                    {params.inputProps.value &&
                                      purchases.filter(
                                        (p) =>
                                          p.itemName === params.inputProps.value
                                      ).length > 1 && (
                                        <Typography
                                          color="error"
                                          variant="caption"
                                        >
                                          This item name is already taken.
                                        </Typography>
                                      )}
                                  </Box>
                                )}
                              />
                            </Grid>

                            <Grid item marginBottom={1} xs={12} md={6} lg={4}>
                              <Autocomplete
                                options={filteredSubCategories}
                                fullWidth
                                getOptionLabel={(option) => option.name}
                                value={
                                  filteredSubCategories.find(
                                    (option) =>
                                      option.id === purchase.categoryId
                                  ) || { name: "", value: "" }
                                }
                                onChange={(event, newValue) => {
                                  handlePurchaseUpdate(
                                    returnIndex(index),
                                    "categoryId",
                                    newValue ? newValue.id : ""
                                  );
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    label={"Category"}
                                    variant="outlined"
                                    {...formik.getFieldProps("itemName")}
                                    error={
                                      formik.touched.itemName &&
                                      formik.errors.itemName
                                    }
                                    helperText={
                                      formik.touched.itemName &&
                                      formik.errors.itemName
                                    }
                                  />
                                )}
                                disabled={purchase.status}
                              />
                            </Grid>

                            <Grid item marginBottom={1} xs={12} md={6} lg={4}>
                              <TextField
                                size="small"
                                label="Estimated Price"
                                value={purchase.price}
                                fullWidth
                                onChange={(e) =>
                                  handlePurchaseUpdate(
                                    returnIndex(index),
                                    "price",
                                    e.target.value
                                  )
                                }
                                disabled={purchase.status}
                              />
                            </Grid>

                            <Grid item marginBottom={1} xs={12} md={6} lg={4}>
                              <TextField
                                size="small"
                                helperText={`Remaining Item ${purchase.measurement}`}
                                label="Quantity"
                                value={purchase.quantity}
                                fullWidth
                                onChange={(e) =>
                                  handlePurchaseUpdate(
                                    returnIndex(index),
                                    "quantity",
                                    e.target.value
                                  )
                                }
                              />
                            </Grid>

                            <Grid item marginBottom={1} xs={12} md={6} lg={4}>
                              <Autocomplete
                                size="small"
                                fullWidth
                                options={units}
                                getOptionLabel={(option) => option.name}
                                value={
                                  units.find(
                                    (option) => option.id === purchase.unitId
                                  ) || {
                                    name: "",
                                    value: "",
                                  }
                                }
                                onChange={(event, newValue) => {
                                  handlePurchaseUpdate(
                                    returnIndex(index),
                                    "unitId",
                                    newValue ? newValue.id : ""
                                  );
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    label={"Unit"}
                                    variant="outlined"
                                  />
                                )}
                                disabled={
                                  purchase.status && purchase.measurement != 0
                                }
                              />
                            </Grid>

                            <Grid
                              item
                              marginBottom={1}
                              xs={10}
                              sm={11}
                              md={6}
                              lg={4}
                            >
                              <TextField
                                size="small"
                                label="Amount"
                                value={(
                                  purchase.price * purchase.quantity
                                ).toFixed(2)}
                                fullWidth
                                disabled={true}
                              />
                            </Grid>
                            <Grid
                              item
                              marginBottom={1}
                              xs={2}
                              sm={1}
                              md={6}
                              lg={4}
                              sx={hiddenOnDesktop}
                            >
                              <Tooltip title="Remove Item">
                                <IconButton
                                  color="error"
                                  onClick={() =>
                                    handleRemoveClick(returnIndex(index))
                                  }
                                  style={{
                                    visibility:
                                      purchases.length === 1
                                        ? "hidden"
                                        : "visible",
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Grid>
                          </Grid>

                          <Grid
                            container
                            alignItems={"center"}
                            item
                            xs={12}
                            md={11}
                            lg={1}
                          >
                            <Grid item xs={1} md={1} lg={5} sx={hiddenOnMobile}>
                              <Tooltip title="Remove Item">
                                <IconButton
                                  color="error"
                                  onClick={() =>
                                    handleRemoveClick(returnIndex(index))
                                  }
                                  style={{
                                    visibility:
                                      purchases.length === 1
                                        ? "hidden"
                                        : "visible",
                                  }}
                                  sx={{
                                    mb: 4,
                                    "&:hover": {
                                      background: "none",
                                    },
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Grid>

                            {returnIndex(index) === purchases.length - 1 && (
                              <Grid item xs={1} md={1} lg={6}>
                                <Tooltip title="Add Row">
                                  <Button
                                    size="small"
                                    color="info"
                                    variant="contained"
                                    onClick={handleAddClick}
                                    sx={{
                                      mb: 4,
                                      "&:hover": {
                                        background: "none",
                                      },
                                    }}
                                  >
                                    <Add />
                                  </Button>
                                </Tooltip>
                              </Grid>
                            )}
                          </Grid>
                        </Grid>
                      </Paper>
                    </Box>
                  </Fragment>
                ))}
              <Grid container spacing={1}></Grid>
            </Paper>
          )}
          <TablePagination
            component={Box}
            count={purchases.length || 0}
            page={currentPage}
            onPageChange={(event, page) => handlePageClick(page)}
            rowsPerPage={perPage}
            onRowsPerPageChange={(event) => handleChangeRowsPerPage(event)}
            labelRowsPerPage="Per Page"
            rowsPerPageOptions={[10, 20, 30]}
          />
        </Paper>
      </Box>
      <Grid container paddingLeft={1} paddingRight={1} paddingBottom={1}>
        <Grid item xs={12} md={6} sx={hiddenOnMobile}></Grid>
        <Grid item xs={6} md={6}>
          {confirmationButtons ? (
            <ConfirmationButtons
              loading={isLoading}
              save={save ? handleSaveClick : (event) => handleSaveDraftClick()}
              onClose={() => setConfirmationButtons(false)}
            />
          ) : (
            <Fragment>
              <Button
                color="success"
                variant="contained"
                onClick={handleCreate}
                disabled={!isFormDirty}
                sx={{ float: "right", marginLeft: "10px" }}
              >
                CREATE
              </Button>

              <Button
                color="success"
                variant="contained"
                onClick={handleSaveDraft}
                disabled={!isFormDirty}
                sx={{ float: "right", color: "#000000" }}
              >
                Save Draft
              </Button>
            </Fragment>
          )}
        </Grid>
      </Grid>
      {/* -------------SNACKBAR-------------- */}
      <SnackBar
        open={snackBarInitialValue.openSnackbar}
        severity={snackBarInitialValue.snackbarSeverity}
        message={snackBarInitialValue.snackbarMessage}
      />
    </Fragment>
  );
};

export default PurchaseRequest;
