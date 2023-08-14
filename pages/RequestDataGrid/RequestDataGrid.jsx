import React, { useState, Fragment } from 'react';
import {
  Toolbar,
  TextField,
  Box,
  Typography,
  Divider,
  InputAdornment,
} from '@mui/material';
import {Search} from '@mui/icons-material/Search';
import { DataGrid } from '@mui/x-data-grid';
import { SearchOffOutlined } from '@mui/icons-material';


const RequestDatagrid = () => {
  const [requests, setRequests] = useState([]);


 
  

  //DATAGRID COLUMNS
  const columns = [
    {
      field: "item_name",
      headerName: "Item Name",
      headerClassName: "headercolor",
      align: "left",
      flex: 1,
      headerAlign: "center",
    },
    {
      field: "quantity",
      headerName: "Quantity",
      headerClassName: "headercolor",
      align: "right",
      flex: 1,
      headerAlign: "center",
    },
    {
      field: "unit_abbreviation",
      headerName: "Unit",
      headerClassName: "headercolor",
      align: "center",
      flex: 1,
      headerAlign: "center",
    },
    {
      field: 'category',
      headerName: 'Category',
      headerClassName: 'headercolor',
      align: 'left',
      flex: 1,
      headerAlign: 'left'
    },
    {
      field: "status",
      headerName: "Request Status",
      headerClassName: "headercolor",
      align: "center",
      flex: 1,
      headerAlign: "center",
    },

  ];

  return (
    <Fragment>
      <Box>
        <Box>

          <Typography variant="h6" fontWeight="bold">
            Purchase Details
          </Typography>

          <Divider width="auto" />

          <Toolbar>
            {/* ------SEARCH ITEM------- */}
            <Box sx={{ marginLeft: 'auto' }}>

              <TextField
                id="Search Users"
                type="Search"
                placeholder="Search"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" >
                      <Search />
                    </InputAdornment>
                  ),
                }}
                variant="standard"
              />
            </Box>

          </Toolbar>

          <DataGrid sx={{
            border: 0,
          }}
            rows={requests}
            columns={columns}
            getRowId={(rows) => rows.id}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            pageSizeOptions={[9]}
            disableRowSelectionOnClick
            autoHeight={true}
            disableColumnMenu
          />

        </Box>
      </Box>
    </Fragment>
  );
};

export default RequestDatagrid;