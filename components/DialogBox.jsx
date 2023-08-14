import React, { Fragment } from "react";
import {
  Dialog,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
const DialogBox = (props) => {
  return (
    <Fragment>
      <Dialog open={props.open} fullWidth maxWidth={props.maxWidth}>
        <DialogTitle justifyContent={"space-between"}>
          <Grid container>
            <Grid item xs={8} md={8}>
              <Typography fontWeight="bold"> {props.title}</Typography>
            </Grid>
            <Grid item xs={3.7} md={3.7}></Grid>
            <Grid item xs={0.3} md={0.3}>
              <IconButton onClick={props.onClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        {props.children}
        {props.content}
      </Dialog>
    </Fragment>
  );
};
export default DialogBox;
