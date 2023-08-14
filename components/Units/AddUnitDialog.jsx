import * as React from "react";
import {
  Button,
  TextField,
  DialogActions,
  Grid,
  Box,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState, Fragment } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createUnit } from "../../config/api";
import ConfirmationButtons from "../ConfirmationButtons";

const AddUnitDialog = ({ snackBarData, onClose }) => {
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false);// set the loading state

  const validationSchema = Yup.object({
    measurement: Yup.string().required("Measurement is required"),
    unit_abbreviation: Yup.string()
      .required("Measurement unit abbreviation is required"),
  });
  const formik = useFormik({
    initialValues: {
      measurement: "",
      unit_abbreviation: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setIsLoading(true);
      //error message when button is clicked w/o user input
      if (formik.isValid) {
        const response = await createUnit({
          name: values.measurement,
          unit_abbreviation: values.unit_abbreviation,
        });
        if (response.ok) {
          snackBarData(true, "success", response.data.message);
          onClose();
        } else {
          setIsLoading(false);
          setConfirmationButtons(false);
          snackBarData(true, "error", response.data.error);
        }
      } else {
        snackBarData(true, "error", "Please fill in all required fields.");
      }
      setSubmitting(false);
    },
  });
  const handleConfirmation = () => {
    setConfirmationButtons(true);
  };

  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
  };

  const handleSubmitCreateUnitOfMeasurement = async () => {
    formik.handleSubmit();
  };


  return (
    <Fragment>

      <DialogContent>
        <Grid container direction={"column"} spacing={3}>
          <Grid item>
            <TextField
              id="measurement"
              name="measurement"
              label="Enter new measurement"
              variant="outlined"
              size="small"
              fullWidth
              value={formik.values.measurement}
              onBlur={formik.handleBlur}
              onClick={() => formik.setFieldTouched('measurement', true)}
              error={
                formik.touched.measurement && Boolean(formik.errors.measurement)
              }
              helperText={
                formik.touched.measurement && formik.errors.measurement
              }
              onChange={(e) =>
                formik.setFieldValue("measurement", e.target.value)
              }
            />
          </Grid>
          <Grid item>
            <Grid item>
              <TextField
                id="unit_abbreviation"
                name="unit_abbreviation"
                label="Enter measurement unit abbreviation"
                variant="outlined"
                size="small"
                fullWidth
                value={formik.values.unit_abbreviation}
                onBlur={formik.handleBlur}
                error={Boolean(formik.errors.unit_abbreviation)}
                helperText={formik.errors.unit_abbreviation}
                onClick={() => formik.setFieldTouched('unit_abbreviation', true)}
                onChange={(e) =>
                  formik.setFieldValue("unit_abbreviation", e.target.value)
                }
              />
            </Grid>
            <Grid item></Grid>
          </Grid>
        </Grid>
        <DialogActions>
          {confirmationButtons ?
            <ConfirmationButtons
              loading={isLoading}
              save={handleSubmitCreateUnitOfMeasurement}
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
              disabled={!formik.isValid}
            >
              Create
            </Button>
          }
        </DialogActions>
      </DialogContent>
    </Fragment>
  );
};
export default AddUnitDialog;
