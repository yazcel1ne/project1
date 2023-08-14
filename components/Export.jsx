import React, { Fragment, useState } from "react";
import { CSVLink } from "react-csv";
import { Box, Button} from "@mui/material";
import { rightContents } from "./style";

const ExportableDataGrid = ({ rows, columns, filename, type, status }) => {
  const handleExportCSV = () => {
    const excludedColumnNames = ["actions", "image"];
    const filteredColumns = columns.filter(
      (column) => !excludedColumnNames.includes(column.field)
    );

    const filteredRows = rows.map((row) => {
      const filteredRow = {};
      filteredColumns.forEach((column) => {
        filteredRow[column.field] = row[column.field];
      });
      return filteredRow;
    });

    const csvData = [
      filteredColumns.map((column) => column.headerName),
      ...filteredRows.map((row) =>
        filteredColumns.map((column) => {
          const cellValue = row[column.field];
          return column.field === "purchase_number"
            ? `PR-${String(cellValue).padStart(9, "0")}`
            : cellValue;
        })
      ),
    ];

    const csvOptions = { filename: filename };
    return (
      <CSVLink data={csvData} {...csvOptions}>
        <Button>Export CSV</Button>
      </CSVLink>
    );
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  let newWindow;

  // const handlePrint = () => {
  //   const columnWidth = 16;
  //   const printableColumns = columns.filter(
  //     (column) => column.field !== "actions" && column.field !== "image"
  //   );

  //   const columnNames = printableColumns
  //     .map((column) =>
  //       column.headerName.slice(0, columnWidth).padEnd(columnWidth)
  //     )
  //     .join("\t");
  //   const rowData = rows
  //     .map((row) =>
  //       printableColumns
  //         .map((column) =>
  //           String(row[column.field]).slice(0, columnWidth).padEnd(columnWidth)
  //         )
  //         .join("\t")
  //     )
  //     .join("\n");

  //   const printContent = `\n${columnNames}\n\n${rowData}`;

  //   const printWindow = window.open("", "NMS");
  //   printWindow.document.open();
  //   printWindow.document.write("<pre>" + printContent + "</pre>");
  //   printWindow.document.close();
  //   printWindow.print();
  //   printWindow.close();
  // };

  const handlePrintPurchaseRequest = () => {
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
    <Box sx={rightContents}>
      {handleExportCSV()}
      {status == 'Approved'
        ? <Button
          onClick={
            type == 'updatePurchaseRequest'
              ? handlePrintPurchaseRequest
              : handlePrint}
        >
          Print
        </Button>
        : ""
      }
    </Box>
  );
};

export default ExportableDataGrid;
