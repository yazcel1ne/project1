import React, { Fragment, useState, useEffect } from "react";
import { Button, CircularProgress, Grid, Typography } from "@mui/material";
import { hiddenOnDesktop, rightContents } from "./style";

const ConfirmationDialogBox = ({ onClose, save, loading }) => {
  return (
    <Fragment>
      <Grid container spacing={1} sx={rightContents}>
        <Grid item xs={12} md={9}>
          <Typography fontWeight={"Bold"}>Do you want to proceed?</Typography>
        </Grid>
        <Grid item xs={12} md={12} sx={hiddenOnDesktop}></Grid>
        <Grid item xs={4} md={1.5}>
          <Button
            fullWidth
            variant="contained"
            disabled={loading}
            onClick={onClose}
          >
            No
          </Button>
        </Grid>
        <Grid item xs={4} md={1.5}>
          <Button
            fullWidth
            variant="contained"
            color="success"
            disabled={loading}
            onClick={save}
          >
            Yes
          </Button>
        </Grid>
      </Grid>
    </Fragment>
  );
};
export default ConfirmationDialogBox;
