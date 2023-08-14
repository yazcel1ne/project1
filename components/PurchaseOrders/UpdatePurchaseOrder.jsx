import {
  Button,
  Grid,
  TextField,
  Typography,
  Autocomplete,
  FormHelperText,
  DialogContent,
  DialogTitle,
  Tooltip,
  IconButton,
  Popover,
  DialogActions,
  CardMedia,
  TablePagination,
  Box,
  Divider,
} from "@mui/material";
import ConfirmationDialogBox from "../ConfirmationDialogBox";
import ConfirmationButtons from "../ConfirmationButtons";
import React, { useEffect, useState, Fragment } from "react";
import {
  fetchItemsForPurchase,
  fetchUnitsForPurchase,
  fetchPurchaseOrderById,
  updatePurchaseOrder,
  cancelPurchaseOrder,
  fetchSubCategoriesList,
} from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";
import { Visibility, Receipt, Delete } from "@mui/icons-material";
import SnackBar from "../SnackBar";
import { format } from "date-fns";
import { centerContents, rightContents } from "../style";
import LoadingPage from "../../pages/LoadingPage/LoadingPage";
import { styled } from "@mui/system";
import CloseIcon from "@mui/icons-material/Close";

const UpdatePurchaseOrder = (props) => {
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [receipts, setReceipts] = useState([
    {
      image: null,
      invoiceNumber: "",
      supplier: "",
      paymentMethod: "",
      amount: "",
    },
  ]);
  //Open Confirmation
  const [openConfirmation, setConfirmation] = useState(false);
  const [save, setSave] = useState(false);
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false); // set the loading state
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const user = useAuth();

  const [remarks, setRemarks] = useState(""); // setting remarks
  const [id, setId] = useState(""); // setting the id for the icon button
  const [index, setIndex] = useState(); // setting index of an item to be deleted
  const [anchorEl, setAnchorEl] = useState(null); // for Popover

  const [openSnackbar, setOpenSnackbar] = useState(false); //Snack Bar
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(20);

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = event.target.value;
    setPerPage(newRowsPerPage);
    setCurrentPage(0);
  };

  const returnIndex = (index) => {
    return perPage * (currentPage + 1) - perPage + index;
  };

  //Snack Bar
  const snackBarData = (open, severity, message) => {
    setOpenSnackbar(open);
    setSnackbarSeverity(severity);
    setSnackbarMessage(message);
    setTimeout(() => {
      setOpenSnackbar(false);
    }, 3000);
  };

  const handleSetRemarks = (rem) => {
    const updatedPurchaseList = [...purchases];
    updatedPurchaseList[index] = {
      ...updatedPurchaseList[index],
      remarks: rem,
    };
    setPurchases(updatedPurchaseList);

    const updatedRemarks = [...remarks];
    updatedRemarks[index] = rem;
    setRemarks(updatedRemarks);
  };

  const handleClose = () => {
    props.onClose();
  };

  const handleComplete = () => {
    setConfirmationButtons(true);
    setSave(true);
    setId("");
  };

  const handleCancel = () => {
    setConfirmationButtons(true);
    setSave(false);
    setId("");
  };

  const handleCloseConfirmation = () => {
    setConfirmation(false);
    setAnchorEl(null);
  };

  const fetchItems = async () => {
    const response = await fetchItemsForPurchase();
    if (response.ok) {
      setItems(response.data.items);
      setIsLoading(false);
    }
  };

  const fetchUnits = async () => {
    const response = await fetchUnitsForPurchase();
    if (response.ok) {
      setUnits(response.data.units);
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    const response = await fetchSubCategoriesList();
    if (response.ok) {
      setCategories(response.data.categories);
      setIsLoading(false);
    }
  };

  const fetchPurchases = async () => {
    const purchaseId = props.purchaseOrder.id;
    const response = await fetchPurchaseOrderById(purchaseId);
    if (response) {
      const newPurchases = response.data.purchaseOrder.map((purchase) => ({
        purchaseId: purchase.id,
        itemId: purchase.item_id,
        itemName: purchase.item_name,
        price: purchase.price,
        unitId: purchase.unit_id,
        measurement: purchase.item_quantity || 0,
        categoryId: purchase.sub_category_id,
        quantity: purchase.quantity,
        status: false,
        remarks: "",
      }));

      setPurchases([...purchases, ...newPurchases]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchPurchases();
    fetchItems();
    fetchUnits();
    fetchCategories();
  }, []);

  useEffect(() => {
    totalAmount();
  }, [purchases]);

  const totalAmount = () => {
    let total = 0;
    purchases.map((purchase, index) => {
      if (purchase.status === false) {
        total += parseFloat((purchase.quantity * purchase.price).toFixed(2));
      }
    });
    return total.toFixed(2);
  };

  const handlePurchaseUpdate = (index, field, value) => {
    const updatedPurchase = {
      ...purchases[index],
      [field]:
        field === "itemName"
          ? value.replace(/\b\w/g, (c) => c.toUpperCase())
          : value,
    };
    const updatedPurchaseList = [...purchases];
    updatedPurchaseList[index] = updatedPurchase;
    setPurchases(updatedPurchaseList);
    handleCloseConfirmation();
  };

  const handleDelete = (index, icon) => {
    setConfirmation(true);
    setId(icon);
    setSave(true);
    setIndex(index);
  };
  const handleView = (event, icon, index) => {
    setAnchorEl(event.currentTarget);
    setId(icon);
    setIndex(index);
  };

  const open = Boolean(anchorEl);
  const idPopover = open ? "simple-popover" : undefined;

  const handleCompleteOrderClick = async (event) => {
    setIsLoading(true);
    const total = totalAmount();
    event.preventDefault();
    const purchaseOrderId = props.purchaseOrder.id;
    const response = await updatePurchaseOrder({
      purchases,
      purchaseOrderId,
      receipts,
      total,
    });
    if (response.ok) {
      props.snackBarData(true, "success", response.data.message);
      handleClose();
    } else {
      setIsLoading(false);
      props.snackBarData(true, "error", response.data.error);
      setConfirmationButtons(false);
    }
  };

  const handleCancelClick = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const purchaseOrderId = props.purchaseOrder.id;
    const response = await cancelPurchaseOrder({
      purchases,
      purchaseOrderId,
    });
    if (response.ok) {
      props.snackBarData(true, "info", response.data.message);
      handleClose();
    } else {
      setIsLoading(false);
      props.snackBarData(true, "info", response.data.error);
      setConfirmationButtons(false);
    }
  };

  const handleReceiptUpdate = (index, field, value) => {
    const updatedReceipt = {
      ...receipts[index],
      [field]: value,
    };
    const updatedReceiptList = [...receipts];
    updatedReceiptList[index] = updatedReceipt;
    setReceipts(updatedReceiptList);
  };
  const handleRemove = (index) => {
    const updatedReceiptsList = [...receipts];
    updatedReceiptsList.splice(index, 1);
    setReceipts(updatedReceiptsList);
  };
  const handleAddPurchase = () => {
    setReceipts([
      ...receipts,
      {
        image: null,
        invoiceNumber: "",
        supplier: "",
        paymentMethod: "",
        amount: "",
      },
    ]);
  };
  const changeHandler = (index, field, e) => {
    let file = e.target.files[0];
    let reader = new FileReader();
    let limit = 1024 * 1024 * 10; // 10MB
    if (!file.type.startsWith("image/")) {
      snackBarData(true, "error", "Please select an image file.");
      return;
    } else if (file.size > limit) {
      snackBarData(true, "error", "The image size limit is 10MB.");
      return;
    } else {
      reader.onloadend = () => {
        const value = reader.result;
        const updatedReceipt = {
          ...receipts[index],
          [field]: value,
        };
        const updatedReceiptList = [...receipts];
        updatedReceiptList[index] = updatedReceipt;
        setReceipts(updatedReceiptList);
        setIsImageUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Status color
  const StyledTypography = styled(Typography)(({ theme, status }) => ({
    color: getStatusColor(status),
    fontWeight: "bold",
  }));
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#28B463";
      case "Pending":
        return "#ff9800";
      case "Rejected":
        return "#E74C3C";
      default:
        return "";
    }
  };

  const formattedCost = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
  }).format(totalAmount());

  return (
    <Fragment>
      <DialogTitle>
        <Grid container spacing={1}>
          <Grid item xs={6} md={6}>
            Purchase Number: PO-{props.purchaseOrder.purchase_number}
            <Typography>Category: {props.purchaseOrder.category}</Typography>
            <Typography>
              Status:
              <StyledTypography
                display="inline"
                status={props.purchaseOrder.order_status}
              >
                {" "}
                {props.purchaseOrder.order_status}
              </StyledTypography>
            </Typography>
          </Grid>
          <Grid item xs={6} md={6} textAlign="right">
            <Typography>
              Date {props.purchaseOrder.order_status}:{" "}
              {format(
                new Date(props.purchaseOrder.created_at),
                "MMMM dd, yyyy"
              )}
            </Typography>
            <Typography>
              {props.purchaseOrder.order_status} By:{" "}
              {props.purchaseOrder.requested_by}
            </Typography>
          </Grid>
        </Grid>
        <Typography textAlign="right" marginTop="20px" fontWeight="bold">
          Total:{formattedCost}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <LoadingPage height={"20vh"} />
        ) : (
          purchases
            .slice(currentPage * perPage, (currentPage + 1) * perPage)
            .map((purchase, index) => (
              <Fragment key={index}>
               <Divider sx={{ my: 1, borderColor: 'white' }} />
                <Grid
                  container
                  spacing={1}
                  marginTop={1}
                  padding={1}
                  paddingBottom={0}
                >
                  <Grid item marginBottom={1} xs={12} md={6} lg={2.5}>
                    <Autocomplete
                      freeSolo
                      fullWidth
                      options={items}
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
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Item Name"
                          variant="outlined"
                        />
                      )}
                      disabled={true}
                    />
                  </Grid>

                  <Grid item marginBottom={1} xs={12} md={6} lg={1.5}>
                    <TextField
                      size="small"
                      label="Price"
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

                  <Grid item marginBottom={1} xs={12} md={6} lg={1.5}>
                    <TextField
                      size="small"
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
                      disabled={purchase.status}
                    />
                  </Grid>

                  <Grid item marginBottom={1} xs={12} md={6} lg={1.75}>
                    <Autocomplete
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
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label={"Unit"}
                          variant="outlined"
                        />
                      )}
                      disabled={true}
                    />
                    <FormHelperText>
                      Remaining Item {purchase.measurement}
                    </FormHelperText>
                  </Grid>

                  <Grid item marginBottom={1} xs={12} md={6} lg={2.5}>
                    <Autocomplete
                      options={categories}
                      fullWidth
                      getOptionLabel={(option) => option.name}
                      value={
                        categories.find(
                          (option) => option.id === purchase.categoryId
                        ) || { name: "", value: "" }
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label={"Category"}
                          variant="outlined"
                        />
                      )}
                      disabled={true}
                    />
                  </Grid>

                  <Grid
                    item
                    marginBottom={1}
                    xs={10}
                    sm={11}
                    md={5.25}
                    lg={1.5}
                  >
                    <TextField
                      size="small"
                      label="Amount"
                      value={(purchase.quantity * purchase.price).toFixed(2)}
                      fullWidth
                      disabled={true}
                    />
                  </Grid>

                  <Grid item marginBottom={1} xs={2} sm={1} md={0.75} lg={0.75}>
                    {purchase.status === false && (
                      <Tooltip title="Remove Item">
                        <IconButton
                          color="error"
                          onClick={() => {
                            handleDelete(returnIndex(index), "delete");
                          }}
                          style={{
                            visibility:
                              purchases.filter(
                                (purchase) => purchase.status === false
                              ).length === 1
                                ? "hidden"
                                : "visible",
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    )}
                    {purchase.status && (
                      <Tooltip title="View Remarks">
                        <IconButton
                          aria-describedby={idPopover}
                          variant="contained"
                          // onClick={handleView}
                          onClick={(e) => {
                            handleView(e, "view", returnIndex(index));
                          }}
                        >
                          <Visibility color="info" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Grid>
                </Grid>
              </Fragment>
            ))
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
        {receipts.map((receipt, index) => (
          <Fragment key={index}>
            <Grid container>
              <Grid
                container
                spacing={1}
                marginTop={1}
                borderRadius={"20px"}
                sx={centerContents}
                xs={12}
                md={12}
                lg={3}
              >
                <Grid item marginBottom={2}>
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      src={receipt.image}
                      sx={{
                        height: "200px",
                        width: "200px",
                        borderRadius: "20px",
                        border: "1px solid white",
                        margin: "auto",
                      }}
                    />
                    {isImageUploaded && (
                      <CloseIcon
                        sx={{
                          position: "absolute",
                          top: "1px",
                          right: "1px",
                          backgroundColor: "#424242",
                          cursor: "pointer",
                          zIndex: 1,
                        }}
                        onClick={() => {
                          setReceipts((prevReceipts) =>
                            prevReceipts.map((item, idx) =>
                              idx === index
                                ? {
                                    image: null,
                                    invoiceNumber: "",
                                    supplier: "",
                                    paymentMethod: "",
                                    amount: "",
                                  }
                                : item
                            )
                          );
                          setIsImageUploaded(false);
                        }}
                      />
                    )}
                  </Box>

                  <Box
                    className="image_item-form"
                    marginTop="5px"
                    textAlign="center"
                  >
                    <Button variant="contained" component="label" color="info">
                      Add Receipt
                      <input
                        type="file"
                        className="image_item-form--input"
                        key={isImageUploaded ? "fileKey-1" : "fileKey-2"}
                        onChange={(e) => changeHandler(index, "image", e)}
                        style={{
                          display: "none",
                        }}
                      />
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              <Grid container xs={12} md={12} lg={9} spacing={1} marginTop={3}>
                <Grid item xs={12} md={3} lg={5.75}>
                  <TextField
                    size="small"
                    label="Receipt Number"
                    variant="outlined"
                    fullWidth
                    value={receipt.invoiceNumber}
                    onChange={(e) =>
                      handleReceiptUpdate(
                        index,
                        "invoiceNumber",
                        e.target.value
                      )
                    }
                  ></TextField>
                </Grid>

                <Grid item xs={12} md={3} lg={5.75}>
                  <TextField
                    size="small"
                    label="Supplier (Optional)"
                    variant="outlined"
                    fullWidth
                    value={receipt.supplier}
                    onChange={(e) =>
                      handleReceiptUpdate(index, "supplier", e.target.value)
                    }
                  ></TextField>
                </Grid>

                <Grid item xs={12} md={3} lg={5.75}>
                  <TextField
                    size="small"
                    label="Payment Method"
                    variant="outlined"
                    fullWidth
                    value={receipt.paymentMethod}
                    onChange={(e) =>
                      handleReceiptUpdate(
                        index,
                        "paymentMethod",
                        e.target.value
                      )
                    }
                  ></TextField>
                </Grid>

                <Grid item xs={10} sm={11} md={2} lg={5.75}>
                  <TextField
                    size="small"
                    label="Amount"
                    variant="outlined"
                    fullWidth
                    value={receipt.amount}
                    onChange={(e) =>
                      handleReceiptUpdate(index, "amount", e.target.value)
                    }
                  ></TextField>
                </Grid>

                <Grid item xs={2} sm={1} md={1} lg={0.5}>
                  {receipts.length !== 1 && (
                    <Tooltip title="Remove Receipt">
                      <IconButton
                        color="error"
                        onClick={() => {
                          handleRemove(index);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Fragment>
        ))}
      </DialogContent>
      <DialogActions>
        <Button
          sx={{
            mr: "auto",
            whiteSpace: "nowrap",
          }}
          variant="contained"
          color="info"
          onClick={(e) => handleAddPurchase(e)}
        >
          <Receipt /> Add Receipt
        </Button>
        {confirmationButtons ? (
          <ConfirmationButtons
            loading={isLoading}
            save={
              save
                ? id === "delete"
                  ? () => handlePurchaseUpdate(index, "status", true)
                  : handleCompleteOrderClick
                : handleCancelClick
            }
            onClose={() => setConfirmationButtons(false)}
          />
        ) : (
          <Fragment>
            <Button
              variant="contained"
              color="success"
              onClick={handleComplete}
            >
              Complete Order
            </Button>
            <Button variant="contained" onClick={handleCancel}>
              Reject Order
            </Button>
          </Fragment>
        )}
      </DialogActions>

      {/* Popover for viewing remarks */}
      <Popover
        id={idPopover}
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseConfirmation}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Typography sx={{ p: 2 }}>Remarks: {remarks[index]}</Typography>
      </Popover>
      {/* Confirmation DIalog */}
      <ConfirmationDialogBox
        open={openConfirmation}
        onClose={handleCloseConfirmation}
        save={
          save
            ? id === "delete"
              ? () => handlePurchaseUpdate(index, "status", true)
              : handleCompleteOrderClick
            : handleCancelClick
        }
        id={id}
        value={handleSetRemarks}
      />
      <SnackBar
        open={openSnackbar}
        severity={snackbarSeverity}
        message={snackbarMessage}
      />
    </Fragment>
  );
};

export default UpdatePurchaseOrder;
