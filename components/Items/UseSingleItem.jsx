import {
  Button,
  TextField,
  DialogContent,
  DialogTitle,
  DialogActions,
  Grid,
  Divider,
  CardMedia,
} from "@mui/material";
import React, { useEffect, useState, Fragment } from "react";
import { updateItemQuantity } from "../../config/api";
import ConfirmationButtons from '../ConfirmationButtons'
import { useFormik } from "formik";
import * as Yup from "yup";

const UseSingleItem = ({ onClose, cell, snackBarData }) => {
  const [useItemId, setUseItemId] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false);// set the loading state

  const validationSchema = Yup.object({
    useItem: Yup.number()
      .required("Quantity is required")
      .positive("Must be a positive number")
      .typeError("Must be a number")
  });

  const formik = useFormik({
    initialValues: {
      useItem: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
    },
  });

  const handleConfirmation = () => {
    if (!formik.dirty) {
      snackBarData(true, "error", "No changes made");
    } else if (!formik.isValid) {
      snackBarData(true, "error", "Please fill in all the required field")
    } else {
      setConfirmationButtons(true);
    }
  };

  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
  };

  useEffect(() => {
    setUseItemId(cell.id);
    setName(cell.item_name);
    setQuantity(cell.quantity);
    setUnit(cell.unit_abbreviation);
  }, [cell.id, cell.name, cell.quantity,]);

  const updateQuantity = async () => {
    setIsLoading(true);
    const response = await updateItemQuantity({
      id: useItemId,
      quantity: formik.values.useItem,

    });
    if (response.ok) {
      snackBarData(true, "success", response.data.message);
      onClose();
    } else {
      setConfirmationButtons(false);
      setIsLoading(false);
      snackBarData(true, "error", response.data.error);
    }
  };

  const isOutOfStock = parseInt(quantity) <= parseInt(formik.values.useItem);
  const exceedsQuantity =
    parseInt(formik.values.useItem) > parseInt(quantity);

  let helperText = "";
  if (exceedsQuantity) {
    helperText = "Quantity exceeds available stock";
  } else if (isOutOfStock) {
    helperText = "Item is out of stock";
  } else {
    helperText = `Item remaining will be ${quantity - formik.values.useItem
      } ${unit}`;
  }

  return (
    <Fragment>
      <Divider />
      <DialogContent>
        <Grid container direction={"row"} spacing={1} padding={1}>
          <Grid item xs={3} sm={1.5} md={1} marginTop={1}>
            <CardMedia
              component="img"
              src={cell.image}
              sx={{
                height: 60,
                width: 60,
                borderRadius: "20px",
                border: "1px solid white",
                marginRight: "10px"
              }}
            />
          </Grid>
          <Grid item xs={12} sm={10.5} md={4} marginTop={1}>
            <TextField size="small" fullWidth label="Item Name" value={name} disabled></TextField>
          </Grid>
          <Grid item xs={12} md={3} marginTop={1}>
            <TextField size="small"  label="Quantity" fullWidth value={`${cell.quantity} ${unit}`} disabled></TextField>
          </Grid>

          <Grid item xs={12} md={4} marginTop={1}>
            <TextField
            size="small" 
              fullWidth
              label="Quantity to be reduced"
              value={formik.values.useItem}
              onBlur={formik.handleBlur}
              onClick={() => formik.setFieldTouched('useItem', true)}
              error={formik.touched.useItem && Boolean(formik.errors.useItem)}
              helperText={
                formik.touched.useItem && formik.errors.useItem
                  ? formik.errors.useItem
                  : helperText
              }
              onChange={(e) => {
                formik.handleChange(e);
                formik.setFieldValue("useItem", e.target.value);
              }}
            ></TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions >
        {confirmationButtons ?
          <ConfirmationButtons
            loading={isLoading}
            save={updateQuantity}
            onClose={() => setConfirmationButtons(false)}
          />
          :
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmation}
            disabled={!formik.dirty || !formik.isValid || exceedsQuantity}
          >
            Update
          </Button>
        }
      </DialogActions>
    </Fragment>
  );
};
export default UseSingleItem;
