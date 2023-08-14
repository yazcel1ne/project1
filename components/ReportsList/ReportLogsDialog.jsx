import * as React from "react";
import {
  Autocomplete,
  CardMedia,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  Paper,
  Typography,
  TextField,
  Grid,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Box,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { Fragment, useState, useEffect } from "react";
import { fetchReportsList } from "../../config/api";
import { GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import Export from "../../components/Export";
import { reportDialogPaper } from "../CustomizedComponentStyle";

const Logs = (props) => {
  const [logs, setLogs] = useState([]);

  //Pagination
  const [totalItems, setTotalItems] = useState(null);
  const [initialValue, setInitialValue] = useState({
    searchValue: "",
    selectedTitle: "All Description",
    pagination: {
      page: 0,
      pageSize: 10,
    },
  });

  //spatie
  const { user } = useAuth();
  const can = (permission) => {
    return (user?.permissions || []).find(
      (givenPermission) => givenPermission == permission
    )
      ? true
      : false;
  };

  const ExportToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarExport
          printOptions={{
            hideFooter: true,
            hideToolbar: true,
          }}
          className="cancel"
          style={{ marginLeft: "auto" }}
        />
      </GridToolbarContainer>
    );
  };

  const columns = [
    {
      field: "updated_at",
      headerName: "Date Updated",
    },
    {
      field: "Description",
      headerName: "Description",
    },
    {
      field: "Field",
      headerName: "Field",
    },
    {
      field: "New",
      headerName: "New",
    },
    {
      field: "Old",
      headerName: "Old",
      headerClassName: "headercolor",
    },
    {
      field: "user_name",
      headerName: "Updated By",
    },
  ];

  const fetchLogsData = async () => {
    const params = new URLSearchParams();

    params.append("page", initialValue.pagination.page + 1);
    params.append("perPage", initialValue.pagination.pageSize);
    params.append("search", initialValue.searchValue);
    params.append("id", props.data.id);
    params.append("title", initialValue.selectedTitle);
    params.append("action", "movement");

    const response = await fetchReportsList(params);

    if (response.ok) {
      setLogs(response.data.logs.data);
      setTotalItems(response.data.logs.total);
    }
  };
  useEffect(() => {
    fetchLogsData();
  }, [initialValue]);

  const title = [
    { label: "All Description" },
    { label: "Reduced" },
    { label: "Purchased" },
  ];

  const handleSearchChange = (event) => {
    setInitialValue((prevValue) => ({
      ...prevValue,
      searchValue: event.target.value,
    }));
  };

  const handlePageClick = (page) => {
    setInitialValue({
      ...initialValue,
      pagination: {
        ...initialValue.pagination,
        page: page,
      },
    });
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = event.target.value;
    setInitialValue({
      ...initialValue,
      pagination: {
        ...initialValue.pagination,
        page: 0,
        pageSize: newRowsPerPage,
      },
    });
  };

  const handleFilterChange = (newFilter) => {
    setInitialValue((prevValue) => ({
      ...prevValue,
      selectedTitle: newFilter,
    }));
  };

  function handleChange(
    event,
    newValue,
    handleFilterChange,
    initialValue,
    title
  ) {
    if (newValue && newValue.label !== "All Description") {
      handleFilterChange(newValue.label);
    } else {
      handleFilterChange("All Description");
    }

    const selectedOption =
      initialValue.selectedTitle !== null
        ? title.find((option) => option.label === initialValue.selectedTitle)
        : null;

    return selectedOption;
  }

  return (
    <Fragment>
      <DialogTitle sx={{ display: "flex" }}></DialogTitle>
      <DialogContent>
        <Grid
          container
          justifyContent={"flex-end"}
          padding={"10px"}
          spacing={3}
          direction={"row"}
        >
          <Grid item xs={12} md={6}>
            <CardMedia
              className="reportsImg"
              component="img"
              height={50}
              sx={{ width: 50 }}
              src={props.data.image}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete
              options={title}
              getOptionLabel={(option) => option.label}
              onChange={(event, newValue) => {
                if (newValue && newValue.label !== "All Description") {
                  handleFilterChange(newValue.label);
                } else {
                  handleFilterChange("All Description");
                }
              }}
              value={
                initialValue.selectedTitle !== null
                  ? title.find(
                      (option) => option.label === initialValue.selectedTitle
                    )
                  : null
              }
              sx={{ width: 200, mr: "10px" }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Filter by Description"
                />
              )}
              disableClearable
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              size="small"
              variant="outlined"
              value={initialValue.searchValue}
              id="Search Logs"
              type="Search"
              placeholder="Search"
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <Paper sx={reportDialogPaper}>
          <Export
            rows={logs}
            columns={columns}
            filename={`${props.data.item_name}'s Log`}
          />
          <TableContainer component={Paper} sx={{ minWidth: "700px" }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  {columns.map((columnHeader, index) => (
                    <TableCell align="center" key={index}>
                      {columnHeader.headerName}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row" align="left">
                      {format(
                        new Date(row.updated_at),
                        "MMMM dd, yyyy - HH:mm:ss"
                      )}
                    </TableCell>
                    <TableCell align="left">
                      <Typography variant="body2">
                        {row.title} {row.item_name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <List>
                        {row.values.map((value, index) => (
                          <ListItem key={`${row.id}-${index}`}>
                            {value.field}
                          </ListItem>
                        ))}
                      </List>
                    </TableCell>
                    <TableCell align="right">
                      <List>
                        {row.values.map((value, index) => (
                          <ListItem
                            key={`${row.id}-${index}-new`}
                            sx={{ width: "80px" }}
                          >
                            {value.field === "Quantity"
                              ? `${value.new} ${props.data.unit_abbreviation}`
                              : value.new}
                          </ListItem>
                        ))}
                      </List>
                    </TableCell>
                    <TableCell align="right">
                      <List>
                        {row.values.map((value, index) => (
                          <ListItem
                            key={`${row.id}-${index}-old`}
                            sx={{ width: "80px" }}
                          >
                            {value.field === "Quantity"
                              ? `${value.old} ${props.data.unit_abbreviation}`
                              : value.old}
                          </ListItem>
                        ))}
                      </List>
                    </TableCell>
                    <TableCell align="right">{row.user_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <TablePagination
          component={Box}
          count={totalItems || 0}
          page={initialValue.pagination.page}
          onPageChange={(event, page) => handlePageClick(page)}
          rowsPerPage={initialValue.pagination.pageSize}
          onRowsPerPageChange={(event) => handleChangeRowsPerPage(event)}
          labelRowsPerPage="Per Page"
        />
      </DialogContent>
    </Fragment>
  );
};

export default Logs;
