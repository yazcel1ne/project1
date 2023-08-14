import {
  Button,
  TextField,
  DialogContent,
  DialogTitle,
  DialogActions,
  Autocomplete,
  Grid,
  CardMedia,
  Box,
  Typography,
} from "@mui/material";
import React, { useEffect, useState, Fragment } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchUnitsforItems, updateItemDetails } from "../../config/api";
import ConfirmationButtons from "../ConfirmationButtons";
import CloseIcon from "@mui/icons-material/Close";

const UpdateItemDialog = ({ onClose, cell, snackBarData }) => {
  const [unit, setUnit] = useState([]);
  const [updateName, setUpdateName] = useState("");
  const [updateUnitAbbreviation, setUpdateUnit] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateItem, setUpdateItem] = useState("");
  const [newImage, setNewImage] = useState("");
  const [image, setImage] = useState("");
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false); // set the loading state
  const [isImageUploaded, setIsImageUploaded] = useState(false);

  const validationSchema = Yup.object({
    updateName: Yup.string().required("Required"),
    updateUnitAbbreviation: Yup.string().required("Required"),
  });
  const formik = useFormik({
    initialValues: {
      updateName: cell.item_name || "",
      updateUnitAbbreviation: cell.unit_abbreviation || "",
      unit: unit.unit_abbreviation || "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {},
  });

  const fetchUnit = async () => {
    const response = await fetchUnitsforItems();
    if (response.ok) {
      setUnit(response.data.units);
    }
  };

  useEffect(() => {
    setUpdateItem(cell.id);
    setImage(cell.image);
    setUpdateName(cell.item_name);
    setUpdateUnit(cell.unit_abbreviation);
    setUpdateStatus(cell.status);
  }, [cell.id, cell.name, cell.unit_abbreviation, cell.status]);

  const handleConfirmation = () => {
    setConfirmationButtons(true);
  };

  const handleUpdateItem = async () => {
    setIsLoading(true);
    // Find the selected unit in the `unit` array
    const selectedUnit = unit.find(
      (option) =>
        option.unit_abbreviation === formik.values.updateUnitAbbreviation
    );

    const response = await updateItemDetails({
      id: updateItem,
      item_name: formik.values.updateName,
      unit_abbreviation: selectedUnit?.unit_abbreviation, // Send the unit abbreviation as a string
      status: updateStatus,
      image: newImage,
    });
    if (response.ok) {
      snackBarData(true, "success", response.data.message);
      onClose();
    } else {
      setConfirmationButtons(false);
      snackBarData(true, "error", response.data.error);
    }
  };

  useEffect(() => {
    fetchUnit();
  }, []);

  const changeHandler = (e) => {
    let file = e.target.files[0];
    let reader = new FileReader();
    let limit = 1024 * 1024 * 10; // 10MB
    if (!file.type.startsWith("image/")) {
      snackBarData(true, "error", "Please select an image file.");
      return;
    } else if (file.size > limit) {
      snackBarData(true, "error", "The image size limit is 10MB.");
      return;
    } else {
      reader.onloadend = () => {
        const value = reader.result;
        setNewImage(value);
        setIsImageUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Fragment>
      {/* <DialogTitle>Edit Item</DialogTitle> */}
      <DialogContent>
        <Grid container spacing={1} marginTop={1}>
          <Grid item xs={12} md={12}>
            <Typography textAlign="center" variant="h4">
              {cell.item_name}
            </Typography>
          </Grid>
          <Grid item xs={10} md={7.5}></Grid>
          <Grid item xs={2} md={2}>
            {isImageUploaded && (
              <CloseIcon
                sx={{
                  backgroundColor: "#424242",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setNewImage(null);
                  setIsImageUploaded(false);
                }}
              />
            )}
          </Grid>
          <Grid item xs={12} md={12}>
            <CardMedia
              component="img"
              src={newImage || cell.image}
              sx={{
                height: "200px",
                width: "200px",
                borderRadius: "20px",
                border: "1px solid white",
                display: "flex",
                margin: "auto",
              }}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <Box className="image_item-form" marginTop="5px" textAlign="center">
              <Button variant="contained" component="label" color="info">
                Update Image
                <input
                  type="file"
                  key={isImageUploaded ? "fileKey-1" : "fileKey-2"}
                  className="image_item-form--input"
                  onChange={(e) => changeHandler(e)}
                  style={{
                    display: "none",
                  }}
                />
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={12} marginTop={2}>
            <Autocomplete
              size="small"
              disablePortal
              disabled={cell.quantity != 0}
              // cell.quantity is where the item quantity
              id="combo-box-demo"
              value={
                unit.find(
                  (option) =>
                    option.unit_abbreviation ===
                    formik.values.updateUnitAbbreviation
                ) || null
              }
              onBlur={formik.handleBlur("updateUnitAbbreviation")}
              options={unit}
              sx={{ mb: 2 }}
              getOptionLabel={(option) => option.name}
              onChange={(event, value) => {
                if (value) {
                  formik.setFieldValue(
                    "updateUnitAbbreviation",
                    value.unit_abbreviation
                  );
                  setUpdateUnit(value.unit_abbreviation);
                } else {
                  formik.setFieldValue("updateUnitAbbreviation", "");
                  setUpdateUnit(" ");
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Unit"
                  error={
                    formik.touched.updateUnitAbbreviation &&
                    formik.errors.updateUnitAbbreviation
                  }
                  helperText={
                    formik.touched.updateUnitAbbreviation &&
                    formik.errors.updateUnitAbbreviation
                  }
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        {confirmationButtons ? (
          <ConfirmationButtons
            loading={isLoading}
            save={handleUpdateItem}
            onClose={() => setConfirmationButtons(false)}
          />
        ) : (
          <Button
            color="success"
            variant="contained"
            onClick={handleConfirmation}
          >
            Update
          </Button>
        )}
      </DialogActions>
    </Fragment>
  );
};
export default UpdateItemDialog;
