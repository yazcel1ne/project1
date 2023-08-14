import { React, Fragment, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  Grid,
  Paper,
  TableContainer,
} from '@mui/material';
import Logo from "../../assets/nmsPurchaseOrder.jpg";
import {fetchPurchasesForRequests} from "../../config/api";
import { format } from "date-fns";
import { centerContents } from '../style';

function PrintPurchaseRequest() {
  const row = JSON.parse(localStorage.getItem('purchaseRequestRow'));
  const [totalAmount, setTotalAmount] = useState();
  const [purchases, setPurchases] = useState([]);

  //DATAGRID COLUMNS
  const OrderColumns = [
    {
      field: "item_name",
      headerName: "Item Name",
    },

    {
      field: "item_quantity",
      headerName: "Quantity",
    },

    {
      field: "category",
      headerName: "Sub-Category",
    },
    {
      field: "price",
      headerName: "Estimated Price",
    },

    {
      field: "amount",
      headerName: "Amount",
    },
  ];

  const fetchPurchases = async () => {
    const purchaseId = row.id;
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



  const tableHeadStyle = {
    backgroundColor: '#000000', color: '#b5bab6', fontWeight: 'bold',
    textAlign: 'center'

  };

  const tableFont = {
    color: '#000000', backgroundColor: '#ffffff'

  };
  const pageStyle = {
    height: '297mm',
    backgroundColor: '#ffffff',
    color: "#000000"
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

  return (
    <Fragment>
      <Box
        sx={pageStyle}
      >
        <Grid container spacing={1} padding={4}>
          <Grid item md={6} textAlign="left">
            <img
              width={250}
              src={Logo}
              alt={Logo}
            />
          </Grid>
          <Grid xs={12} item md={6} textAlign="right">
            <Typography fontWeight='bold'>New Media Services Pty Ltd</Typography>
            <Typography fontWeight='bold'>4 Loakan Grove
              Brgy. Loakan 2600</Typography>
          </Grid>
          <Grid container spacing={1} padding={1} marginBottom={1} marginTop={1}>
            <Grid item md={6}>
              <Typography variant="h5" fontWeight="bold">
                Purchase Request
              </Typography>
            </Grid>
          </Grid>

          <Grid container spacing={1} >
            <Grid sx={{ marginLeft: 'auto' }}>
              <Box >
                <Table size="small" border="1" >
                  <TableHead  >
                    <TableRow >
                      <TableCell sx={tableHeadStyle} >Date</TableCell>
                      <TableCell sx={tableHeadStyle}>P.R No.</TableCell>
                    </TableRow >
                  </TableHead>
                  <TableFooter sx={{ backgroundColor: '#f5f5f5' }} >
                    <TableRow>
                      <TableCell style={tableFont} > {format(new Date(row.updated_at), "MMMM dd, yyyy ")}</TableCell>
                      <TableCell sx={tableFont}>PR-{row.purchase_number}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ width: "100%", height: '2px', backgroundColor: '#000000' }} />

          <Grid container spacing={1} >
            <Grid item xs={6} md={6} lg={3}>
              <Typography marginTop={1}><b>Category:</b> {row.category}</Typography>
              <Typography ><b>Status:</b> {row.status} </Typography>
            </Grid>

            <Grid item xs={6} md={6} lg={3}>

              <Typography marginTop={1}><b>Requested By:</b> {row.requested_by}</Typography>
              <Typography ><b>Date Requested:</b> {format(new Date(row.created_at), "MMMM dd, yyyy ")}</Typography>
              <Typography ><b>Updated by:</b> {row.approved_by}</Typography>
            </Grid>

          </Grid>
          <Grid container spacing={1} marginTop={3}>
            <Grid item xs={12} md={12} >

              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} border="1" size="small">
                  <TableHead>
                    <TableRow>
                      {OrderColumns.map((columnHeader, index) => (
                        <TableCell key={index} sx={tableHeadStyle} >{columnHeader.headerName}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchases.map((row) => (
                      <TableRow key={row.purchaseId}>
                        <TableCell sx={tableFont} component="th" scope="row" align="left" >
                          {row.itemName}
                        </TableCell>
                        <TableCell sx={tableFont} align="left">{row.unit}</TableCell>
                        <TableCell sx={tableFont} align="left">{row.category}</TableCell>
                        <TableCell sx={tableFont} align="right">{formattedPrice(row.price)}</TableCell>
                        <TableCell sx={tableFont} align="right">{formattedAmount(row.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter sx={{ backgroundColor: '#f5f5f5' }} >
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell variant='h1' sx={{ fontWeight: "bold", color: "#000000", textAlign: 'right' }}>TOTAL</TableCell>
                      <TableCell variant='h1' sx={{ color: "#eb3f9e", fontWeight: "bold" }} align="right">{formattedCost}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Fragment>
  )
}

export default PrintPurchaseRequest