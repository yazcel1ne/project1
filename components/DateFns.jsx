import { format, isValid } from "date-fns";
import React from "react";
import { Box } from "@mui/material";

const DateFns = ({ date }) => {
  const isValidDate = isValid(new Date(date));

  if (!isValidDate) {
    return <Box>Invalid Date</Box>;
  }

  const formattedDate = format(new Date(date), "MMMM dd, yyyy");
  return <Box>{formattedDate}</Box>;
};

export default DateFns;