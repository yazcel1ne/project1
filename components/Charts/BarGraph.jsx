import React, { useEffect, useState } from "react";
import ReactEcharts from "echarts-for-react";
import { Button, Box, Grid, Typography } from "@mui/material";
import { buttonRightBarGraph } from "../style";
import api from "../../config/api";

const BarGraph = () => {
  const [categoryWeeklyCost, setCategoryWeeklyCost] = useState([]);
  const [categoryMonthlyCost, setCategoryMonthlyCost] = useState([]);
  const [categoryWAnnualyCost, setCategoryAnnualyCost] = useState([]);

  const weeklyData = {
    categories: categoryWeeklyCost.map((category) => category.name),
    series: [
      {
        data: categoryWeeklyCost.map((item) => item.total_cost),
      },
    ],
  };

  const monthlyData = {
    categories: categoryMonthlyCost.map((category) => category.name),
    series: [
      {
        data: categoryMonthlyCost.map((item) => item.total_cost),
      },
    ],
  };

  const annualData = {
    categories: categoryWAnnualyCost.map((category) => category.name),
    series: [
      {
        data: categoryWAnnualyCost.map((item) => item.total_cost),
      },
    ],
  };

  //Get Categories Weekly Cost
  const getCategoryWeeklyCost = async () => {
    const response = await api.get("/api/category/weekly/cost");
    if (response.ok) {
      setCategoryWeeklyCost(response.data.categoryWeekly);
    }
  };

  //Get Categories Monthly Cost
  const getCategoryMonthlyCost = async () => {
    const response = await api.get("/api/category/monthly/cost");
    if (response.ok) {
      setCategoryMonthlyCost(response.data.categoryMonthly);
    }
  };

  //Get Categories Annualy Cost
  const getCategoryAnnualyCost = async () => {
    const response = await api.get("/api/category/annualy/cost");
    if (response.ok) {
      setCategoryAnnualyCost(response.data.categoryAnnualy);
    }
  };

  useEffect(() => {
    getCategoryWeeklyCost();
    getCategoryMonthlyCost();
    getCategoryAnnualyCost();
  }, []);

  const [selectedFilter, setSelectedFilter] = useState("weekly");
  const selectedData =
    selectedFilter === "weekly"
      ? weeklyData
      : selectedFilter === "monthly"
      ? monthlyData
      : annualData;

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  const options = {
    color: ["#ff4545"],
    xAxis: {
      type: "category",
      data: selectedData.categories,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "₱ {value}", //added peso sign
      },
    },
    series: selectedData.series.map((s) => ({
      name: s.name,
      type: "bar",
      data: s.data,
    })),
  };

  return (
    <Box sx={buttonRightBarGraph}>
      <Grid container spacing={1} justifyContent="flex-end">
        <Grid item>
          <Button
            variant={selectedFilter === "weekly" ? "contained" : "outlined"}
            onClick={() => handleFilterChange("weekly")}
          >
            Weekly
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant={selectedFilter === "monthly" ? "contained" : "outlined"}
            onClick={() => handleFilterChange("monthly")}
          >
            Monthly
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant={selectedFilter === "annual" ? "contained" : "outlined"}
            onClick={() => handleFilterChange("annual")}
          >
            Annual
          </Button>
        </Grid>
      </Grid>
      <ReactEcharts option={options} />
    </Box>
  );
};
export default BarGraph;
