import {
  DialogContent,
  DialogTitle,
  Box,
  DialogActions,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
} from "@mui/material";
import { GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import SnackBar from "../../components/SnackBar";
import React, { Fragment, useEffect, useState } from "react";
import {
  fetchPurchasesForRequests,
  updatePurchaseRequest,
  rejectPurchaseRequest,
} from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmationButtons from "../ConfirmationButtons";
import { Permissions } from "../../constants/Permissions";
import { styled } from "@mui/system";
import { purchaseDialogPaper } from "../customizedComponentStyle";
import { centerContents } from "../style";
import { rightContents } from "../style";
import PrintPurchaseRequest from "./PrintPurchaseRequest";

function UpdatePurchaseRequest(props) {
  const [totalAmount, setTotalAmount] = useState();
  const [purchases, setPurchases] = useState([]);
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false); // set the loading state
  const [save, setSave] = useState(false);

  const user = useAuth();
  const can = (permission) => {
    return (user.user.permissions || []).find(
      (givenPermission) => givenPermission == permission
    )
      ? true
      : false;
  };

  const columns = [
    {
      field: "unit",
      headerName: "Quantity",
      align: "right",
    },
    {
      field: "itemName",
      headerName: "Item Name",
      align: "left",
    },
    {
      field: "category",
      headerName: "Sub Category",
      align: "left",
    },
    {
      field: "price",
      headerName: "Estimated Price",
      align: "right",
    },
    {
      field: "amount",
      headerName: "Amount",
      align: "right",
    },
  ];

  const handleApprove = () => {
    setSave(true);
    setConfirmationButtons(true);
  };

  const handleReject = () => {
    setSave(false);
    setConfirmationButtons(true);
  };

  const fetchPurchases = async () => {
    const purchaseId = props.purchaseRequest.id;
    const response = await fetchPurchasesForRequests(purchaseId);
    if (response.ok) {
      const totalAmount = [
        ...purchases,
        ...response.data.purchaseRequest,
      ].reduce(
        (total, purchase) => total + purchase.quantity * purchase.price,
        0
      );
      const newPurchases = response.data.purchaseRequest.map((purchase) => ({
        purchaseId: purchase.id,
        itemId: purchase.item_id,
        itemName: purchase.item_name,
        unitId: purchase.unit_id,
        measurement: purchase.item_quantity || 0,
        categoryId: purchase.sub_category_id,
        category: purchase.category,
        quantity: purchase.quantity,
        amount: (purchase.quantity * purchase.price).toFixed(2),
        price: purchase.price,
        unit: purchase.quantity + " " + purchase.unit,
      }));

      // Add the new purchases to the existing purchases and set the state
      setPurchases([...purchases, ...newPurchases]);

      // Set the total amount state
      setTotalAmount(totalAmount.toFixed(2));
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleApproveClick = async () => {
    setIsLoading(true);
    const purchaseRequestId = props.purchaseRequest.id;
    const response = await updatePurchaseRequest({
      purchases,
      purchaseRequestId,
    });
    if (response.ok) {
      props.snackBarData(true, "success", response.data.message);
      props.onClose();
    } else {
      setConfirmationButtons(false);
      props.snackBarData(response.data.error);
    }
  };

  const handleRejectClick = async () => {
    setIsLoading(true);
    const purchaseRequestId = props.purchaseRequest.id;
    const response = await rejectPurchaseRequest({
      purchases,
      purchaseRequestId,
    });
    if (response.ok) {
      props.snackBarData(true, "info", response.data.message);
      props.onClose();
    } else {
      setConfirmationButtons(false);
      alert(response.data.error);
    }
  };

  // Status Color
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


  const formattedCost = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP'
  }).format(totalAmount);

  const formattedAmount = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };
  const formattedPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  let newWindow;

  const handlePrint = (row) => {
    localStorage.setItem('row', JSON.stringify(row));
    newWindow = window.open('./print-purchase-request');
    if (newWindow) {
      newWindow.onload = function () {
        setTimeout(() => {
          newWindow.print();
        }, 1000);
      };
    }
  }

  return (
    <Fragment>
      <Box>
        <DialogTitle>
          <Grid container spacing={1}>
            <Grid item xs={6} md={6}>
              Purchase Number: PR-{props.purchaseRequest.purchase_number}
              <Typography>
                Category: {props.purchaseRequest.category}
              </Typography>
              <Typography>
                Status:
                <StyledTypography
                  display="inline"
                  status={props.purchaseRequest.status}
                >
                  {" "}
                  {props.purchaseRequest.status}
                </StyledTypography>
                <Typography>
                  {props.purchaseRequest.status != "Pending" && (
                    <Typography>
                      Date {props.purchaseRequest.status}:{" "}
                      {format(
                        new Date(props.purchaseRequest.updated_at),
                        "MMMM dd, yyyy "
                      )}
                    </Typography>
                  )}
                </Typography>
              </Typography>
            </Grid>
            <Grid item xs={6} md={6} textAlign="right">
              <Typography>
                Requested By: {props.purchaseRequest.requested_by}
              </Typography>
              <Typography display="inline">
                Date Requested:{" "}
                {format(
                  new Date(props.purchaseRequest.created_at),
                  "MMMM dd, yyyy "
                )}
              </Typography>
              {props.purchaseRequest.status != "Pending" && (
                <Typography>
                  Updated By: {props.purchaseRequest.approved_by}
                </Typography>
              )}
              <Typography textAlign="right" marginTop="20px" fontWeight="bold">
                Estimated Total Price:  {formattedCost}
              </Typography>
            </Grid>
          </Grid>
        </DialogTitle>

        <DialogContent>
          <Paper sx={purchaseDialogPaper}>
            <Export
              rows={purchases}
              columns={columns}
              filename={`PR-${props.purchaseRequest.purchase_number}`}
              type = "updatePurchaseRequest"
              status={props.purchaseRequest.status}
            />
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    {columns.map((columnHeader) => (
                      <TableCell align={columnHeader.align}>
                        {columnHeader.headerName}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchases.map((row) => (
                    <TableRow key={row.purchaseId}>
                      <TableCell component="th" scope="row" align="right">
                        {row.unit}
                      </TableCell>
                      <TableCell align="left">{row.itemName}</TableCell>
                      <TableCell align="left">{row.category}</TableCell>
                      <TableCell align="right">{formattedPrice(row.price)}</TableCell>
                      <TableCell align="right">{formattedAmount(row.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </DialogContent>

        <DialogActions>
          <Grid container>
            <Grid item xs={12} md={12} lg={2}>
              <Button
                variant="contained"
                color="info"
                onClick={() => { handlePrint(purchases) }}
              >
                Print
              </Button>
            </Grid>
            <Grid item xs={12} md={12} lg={4}></Grid>
            <Grid item xs={12} md={12} lg={6} sx={rightContents}>
              {props.purchaseRequest.status === "Pending" &&
                (confirmationButtons ? (
                  <ConfirmationButtons
                    loading={isLoading}
                    save={save ? handleApproveClick : handleRejectClick}
                    onClose={() => setConfirmationButtons(false)}
                  />
                ) : (
                  <Fragment>
                    {can(Permissions.CAN_APPROVE_PURCHASE_REQUESTS) ? (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleApprove}
                      >
                        Approve Request
                      </Button>
                    ) : (
                      ""
                    )}
                    {can(Permissions.CAN_REJECT_PURCHASE_REQUESTS) ? (
                      <Button sx={{ml:1}} variant="contained" onClick={handleReject}>
                        Reject Request
                      </Button>
                    ) : (
                      ""
                    )}
                  </Fragment>
                ))}
            </Grid>
          </Grid>
        </DialogActions>
      </Box>
    </Fragment>
  );
}

export default UpdatePurchaseRequest;
