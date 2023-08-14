import { Card, CardContent, Grid, Typography, Box, Toolbar } from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import LineChart from "../../components/Charts/LineChart";
import BarGraph from "../../components/Charts/BarGraph";
import {
  fetchItemsOnStock,
  fetchItemsOutOfStock,
  fetchPendingRequests,
  fetchApprovedOrders,
} from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";
import { Permissions } from "../../constants/Permissions";
import { Navigate } from "react-router-dom";
import CustomCard from "../../components/CustomCard";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const Dashboard = () => {
  const [itemsOnStock, setItemsOnStock] = useState(0);
  const [itemsOutOfStock, setItemsOutOfStock] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [approvedOrders, setApprovedOrders] = useState(0);

  // spatie
  const { user } = useAuth();
  const can = (permission) => {
    return (user?.permissions || []).find(
      (givenPermission) => givenPermission == permission
    )
      ? true
      : false;
  };

  const fetchData = async () => {
    const [
      itemsOnStockResponse,
      itemsOutOfStockResponse,
      pendingRequestsResponse,
      approvedOrdersResponse,
    ] = await Promise.all([
      fetchItemsOnStock(),
      fetchItemsOutOfStock(),
      fetchPendingRequests(),
      fetchApprovedOrders(),
    ]);

    if (itemsOnStockResponse.ok) {
      setItemsOnStock(itemsOnStockResponse.data.count);
    }

    if (itemsOutOfStockResponse.ok) {
      setItemsOutOfStock(itemsOutOfStockResponse.data.count);
    }

    if (pendingRequestsResponse.ok) {
      setPendingRequests(pendingRequestsResponse.data);
    }

    if (approvedOrdersResponse.ok) {
      setApprovedOrders(approvedOrdersResponse.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Fragment>
      <Box
        sx={{
          marginTop: {
            xs: "70px",
            md: "0",
          },
        }}
      >
        <Typography fontWeight={"bold"} fontSize="large">
          Welcome, {user.name}!
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography>On Stock Items</Typography>
                <Typography variant="h4" textAlign="center">
                  {itemsOnStock}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography>Out of Stock Items</Typography>
                <Typography variant="h4" textAlign="center">
                  {itemsOutOfStock}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography>Pending Requests</Typography>
                <Typography variant="h4" textAlign="center">
                  {pendingRequests ? pendingRequests : 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} md={3}>
            <Card>
              <CardContent>
                <Typography>Orders to be Reviewed</Typography>
                <Typography variant="h4" textAlign="center">
                  {approvedOrders ? approvedOrders : 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomCard>
              <Typography fontWeight="bold" color="text.tertiary">
                Overall Spendings
              </Typography>
              {/* <PieChart /> */}
              <BarGraph />
            </CustomCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomCard>
              <Typography fontWeight="bold" color="text.tertiary">Stacked Line Graph</Typography>
              <Toolbar >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Toolbar
                    sx={{
                      width: '200px',
                      height: '15px',
                      border: 'none',
                    }}
                  >
                    <DatePicker
                      disableToolbar
                      variant="inline"
                      
                    />
                  </Toolbar>
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Toolbar
                    sx={{
                      width: '200px',
                      height: '15px',
                      border: 'none',
                    }}
                  >
                    <DatePicker
                      disableToolbar
                      variant="inline"
                      
                    />
                  </Toolbar>
                </LocalizationProvider>
              </Toolbar>
              <LineChart />
            </CustomCard>
          </Grid>
        </Grid>
      </Box>
    </Fragment>
  );
};
export default Dashboard;
