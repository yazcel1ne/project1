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
  CardMedia,
  Button,
  Paper,
  TableContainer,
} from '@mui/material';
import Logo from "../../assets/nmsPurchaseOrder.jpg";
import { fetchPurchaseOrderList } from "../../config/api";
import { format } from "date-fns";

function PrintPurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const row = JSON.parse(localStorage.getItem('row'));
  const purchaseId = row.id;

  //DATAGRID COLUMNS
  const OrderColumns = [
    {
      field: "item_name",
      headerName: "Item Name",
    },
    {
      field: "price",
      headerName: "Price",
    },
    {
      field: "item_quantity",
      headerName: "Quantity",
    },
    {
      field: "unit",
      headerName: "Unit",
    },
    {
      field: "category",
      headerName: "Category",
    },
    {
      field: "status",
      headerName: "Status",
    },
    {
      field: "remarks",
      headerName: "Remarks",
    },
    {
      field: "amount",
      headerName: "Amount",
    },
  ];

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return {
          color: '#3498DB',
        };
      case 'approved':
        return {
          color: '#28B463',
        };
      case 'canceled':
        return {
          color: '#E74C3C',
        };
      default:
        return {};
    }
  };

  const fetchPurchases = async () => {
    const response = await fetchPurchaseOrderList(purchaseId);
    if (response.ok) {
      const newOrder = response.data.purchaseOrder.map((order) => ({
        ...order,
        amount: (order.item_quantity * order.price).toFixed(2),
      }));
      setPurchaseOrders(newOrder);
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
   width: '260mm',
    height: '297mm',
    backgroundColor: '#ffffff',
    color: "#000000"
  };


  const formattedCost = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP'
  }).format(row.cost);

  
  const formattedAmount = (price) => {
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
          <Grid items md={6} textAlign="left">
            <img
              width={250}
              src={Logo}
              alt={Logo}
            />
          </Grid>
          <Grid xs={12} items md={6} textAlign="right">
            <Typography fontWeight='bold'>New Media Services Pty Ltd</Typography>
            <Typography fontWeight='bold'>4 Loakan Grove
              Brgy. Loakan 2600</Typography>
          </Grid>
          <Grid container spacing={1} marginBottom={1} marginTop={1}>
            <Grid items md={6}>
              <Typography variant="h5" fontWeight="bold">
                Purchase Order
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
                      <TableCell sx={tableHeadStyle}>P.O No.</TableCell>
                    </TableRow >
                  </TableHead>
                  <TableFooter sx={{ backgroundColor: '#f5f5f5' }} >
                    <TableRow>
                      <TableCell style={tableFont} > {format(new Date(row.updated_at), "MMMM dd, yyyy ")}</TableCell>
                      <TableCell sx={tableFont}>PO-{row.purchase_number}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ width: "100%", height: '2px', backgroundColor: '#000000' }} />

          <Grid container spacing={1} >
            <Grid items xs={6} md={6} lg={3}>
              <Typography fontWeight="bold" marginTop={2}>Status:
                <Typography display={"inline"}>  {row.order_status}</Typography>
              </Typography>
              <Typography fontWeight="bold" >Completed Items:
                <Typography display={"inline"}>  {
                  purchaseOrders.filter((order) => order.status === "Completed")
                    .length
                }</Typography>
              </Typography>
              <Typography fontWeight="bold" >Canceled Items:
                <Typography display={"inline"}>  {purchaseOrders.filter((order) => order.status === "Canceled").length}
                </Typography>
              </Typography>
            </Grid>


            <Grid items xs={6} md={6} lg={3}>

              <Typography marginTop={2} fontWeight="bold">Approved By:
                <Typography display={"inline"}>  {row.requested_by}
                </Typography>
              </Typography>

              <Typography fontWeight="bold">Date Approved:
                <Typography display={"inline"}>  {format(new Date(row.updated_at), "MMMM dd, yyyy ")}
                </Typography>
              </Typography>

              <Typography fontWeight="bold">Completed By:

                <Typography display={"inline"}>  {row.approved_by}
                </Typography>
              </Typography>
            </Grid>

          </Grid>
          <Grid container spacing={1} marginTop={3}>
            <Grid items xs={12} md={12} >

              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} border="1" size="small">
                  <TableHead>
                    <TableRow>
                      {OrderColumns.map((columnHeader) => (
                        <TableCell sx={tableHeadStyle} >{columnHeader.headerName}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchaseOrders.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={tableFont} component="th" scope="row">
                          {row.item_name}
                        </TableCell>
                        <TableCell sx={tableFont} align="right">{formattedAmount(row.price)}</TableCell>
                        <TableCell sx={tableFont} align="right">{row.item_quantity}</TableCell>
                        <TableCell sx={tableFont} align="left">{row.unit}</TableCell>
                        <TableCell sx={tableFont} align="left">{row.category}</TableCell>
                        <TableCell sx={tableFont} align="center">
                          <Box
                            style={{
                              fontWeight: "bold",
                              color: getStatusStyle(row.status).color,
                            }}
                          >
                            {row.status}
                          </Box>
                        </TableCell>
                        <TableCell sx={tableFont} align="left">{row.remarks}</TableCell>
                        <TableCell sx={tableFont} align="right">{formattedAmount(row.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter sx={{ backgroundColor: '#f5f5f5' }} >
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell variant='h1' sx={{ fontWeight: "bold", color: "#000000", textAlign:'right' }}>TOTAL</TableCell>
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

export default PrintPurchaseOrders