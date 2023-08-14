import React from "react";
import ReactEcharts from 'echarts-for-react';
import { Box } from '@mui/material';

const LineChart = () => {
  const option = {
    
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['Admin', 'Clinic', 'Kitchen'],
    },
    xAxis: {
      type: 'category',
      data: ['January', 'February', 'March', 'April', 'May', 'June'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        color: '#ff4545',
        name: 'Admin',
        type: 'line',
        stack: 'total',
        data: [120, 132, 101, 134, 90, 230],
      },
      {
        color: '#6f2da8',
        name: 'Clinic',
        type: 'line',
        stack: 'total',
        data: [220, 182, 191, 234, 290, 330],
      },
      {
        color: '#ff7300',
        name: 'Kitchen',
        type: 'line',
        stack: 'total',
        data: [150, 232, 201, 154, 190, 330],
      },
    ],
  };

  return (
    <Box>
    <ReactEcharts
      option={option}
      className="line-chart"
    />
    </Box>
  );
};
export default LineChart;
