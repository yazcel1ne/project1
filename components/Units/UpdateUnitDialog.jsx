import * as React from "react";
import {
  Box,
  Button,
  TextField,
  Divider,
  DialogActions,
  Grid,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState, useEffect, Fragment } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateUnit } from "../../config/api";
import ConfirmationButtons from "../ConfirmationButtons";

const UpdateMeasurementDialog = ({
  selectedMeasurement,
  snackBarData,
  onClose,
}) => {
  const [measurementId, setMeasurementId] = useState("");
  const [editMeasurement, setEditMeasurement] = useState("");
  const [editUnit_abbreviation, setEditUnit] = useState("");
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false);// set the loading state

  const validationSchema = Yup.object({
    editMeasurement: Yup.string().required("Measuerement is required"),
    editUnit_abbreviation: Yup.string().required("Measurement unit abbreviation is required"),
  });

  const formik = useFormik({
    initialValues: {
      editMeasurement: selectedMeasurement.editMeasurement || "",
      editUnit_abbreviation: selectedMeasurement.editUnit_abbreviation || "",
    },
    validationSchema,
    onSubmit: (values) => {
      handleUnitOfMeasurement(values);
    },
  });



  const handleConfirmation = () => {
    if (!formik.dirty) {
      snackBarData(true, "error", "No changes made.")
    } else if (!formik.isValid) {
      snackBarData(true, "error", "Please fill in all the required fields.")
    } else {
      setConfirmationButtons(true);
    }
  };

  const handleUnitOfMeasurement = async (values) => {
    setIsLoading(true);
    const response = await updateUnit({
      id: measurementId,
      name: values.editMeasurement,
      unit_abbreviation: values.editUnit_abbreviation,
    });
    if (response.ok) {
      snackBarData(true, "success", response.data.message);
      onClose();
    } else {
      setIsLoading(false);
      setConfirmationButtons(false);
      snackBarData(true, "error", response.data.error);
    }
  };

  useEffect(() => {
    setMeasurementId(selectedMeasurement.measurementId);
    setEditMeasurement(selectedMeasurement.editMeasurement);
    setEditUnit(selectedMeasurement.editUnit_abbreviation);
  }, [
    selectedMeasurement.measurementId,
    selectedMeasurement.editMeasurement,
    selectedMeasurement.editUnit_abbreviation,
  ]);

  return (
    <Fragment>

      <DialogContent>
        <Grid container direction={"column"} spacing={3}>
          <Grid item>
            <TextField
              id="editMeasurement"
              name="editMeasurement"
              label="Enter new measurement"
              variant="outlined"
              size="small"
              margin="dense"
              fullWidth
              value={formik.values.editMeasurement}
              onClick={() => formik.setFieldTouched('editMeasurement', true)}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.editMeasurement && Boolean(formik.errors.editMeasurement)}
              helperText={formik.touched.editMeasurement && formik.errors.editMeasurement}
            />
          </Grid>
          <Grid item>
            <Grid item>
              <TextField
                id="editUnit_abbreviation"
                name="editUnit_abbreviation"
                label="Enter measurement unit abbreviation"
                variant="outlined"
                size="small"
                margin="dense"
                fullWidth
                value={formik.values.editUnit_abbreviation}
                onClick={() => formik.setFieldTouched('editUnit_abbreviation', true)}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.editUnit_abbreviation && Boolean(formik.errors.editUnit_abbreviation)}
                helperText={formik.touched.editUnit_abbreviation && formik.errors.editUnit_abbreviation}
              />
            </Grid>
            <Grid item></Grid>
          </Grid>
        </Grid>
        <DialogActions>
          {confirmationButtons ?
            <ConfirmationButtons
              loading={isLoading}
              save={formik.handleSubmit}
              onClose={() => setConfirmationButtons(false)}
            />
            :
            <Button
              color="success"
              variant="contained"
              sx={{
                mr: 1
              }}
              onClick={handleConfirmation}
              disabled={!formik.dirty || !formik.isValid}
            >
              Save Changes
            </Button>
          }
        </DialogActions>
      </DialogContent>
    </Fragment>
  );
};
export default UpdateMeasurementDialog;