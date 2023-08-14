import React, { useState, useEffect } from "react";
import ReactEcharts from 'echarts-for-react';
import { fetchCategorizedData } from "../../config/api";

const PieChart = () => {
  const [pieChartData, setPieChartData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await fetchCategorizedData();
    if (response.ok) {
      setPieChartData(response.data);
    } else {
    }
  };

  const getOption = () => {
    const data = pieChartData.map(item => ({
      value: item.total_quantity,
      item_count: item.item_count,
      name: item.category,
    }));

    const totalItemCount = pieChartData.reduce(
      (total, item) => total + item.item_count,
      0
    );

    let displayCount = totalItemCount;

    if (totalItemCount >= 1000 && totalItemCount < 10000) {
      displayCount = (totalItemCount / 1000).toFixed(1) + 'k';
    } else if (totalItemCount >= 10000) {
      displayCount = (totalItemCount / 1000).toFixed(0) + 'k';
    }

    return {
      title: {
        text: [
          '{a|Total Items}',
          `{b|${displayCount}}`

        ].join('\n'),
        left: 'center',
        top: 'middle',
        textStyle: {
          fontWeight: 'bold',
          textAlign: 'center',
          rich: {
            a: {
              fontSize: 23,
            },
            b: {
              fontWeight: 'bold',
              fontSize: 50,
            }
          }
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: 'Total Qty: {c} ({d}%)',
      },
      series: [
        {
          backgroundColor: '#ffffff',
          name: 'Data',
          type: 'pie',
          radius: ['55%', '70%'],
          data: data,
          label: {
            show: true,
            position: 'outside',
            alignTo: 'labelLine',
            margin: '5%',
            fontSize: 20,
            formatter: function (params) {
              const { name } = params;
              const item_count = params.data.item_count;
              return `${name}\n${item_count} Items`;
            },
            rich: {
              item_count: {
                fontSize: 50,
                lineHeight: 700,
              },
            },
          },
          labelLine: {
            show: true,
            length: 10,
            length2: 30,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
        },
      ],
    };
  };
  return <ReactEcharts option={getOption()} style={{ height: '330px' }} />;
};

export default PieChart;
