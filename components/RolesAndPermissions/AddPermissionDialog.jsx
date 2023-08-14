import React, {useState, Fragment } from "react";
import {
  Button,
  TextField,
  DialogActions,
  Grid,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { createPermission } from "../../config/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import ConfirmationButtons from "../ConfirmationButtons";

const AddPermissionDialog = ({ snackBarData, onClose }) => {
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false);// set the loading state

  const validationSchema = Yup.object({
    permission: Yup.string()
      .required("Permission is required")
      .matches(/^[\w]+$/, "Permission must use underscores instead of spaces"),
  });

  const formik = useFormik({
    initialValues: {
      permission: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      if (!values.permission) {
        formik.setFieldError("permission", "Permission is required");
      }
      else {
        console.log(values);
        handleSubmitCreatePermission();
      }
      setSubmitting(false);
    },
  });

  const handleSubmitCreatePermission = async () => {
    setIsLoading(true);
    createPermission({ name: formik.values.permission }, async (response) => {
      if (response.ok) {
        snackBarData(true, "success", response.data.message);
        onClose();
      }
      else {
        if (response.problem) {
          setIsLoading(false);
          setConfirmationButtons(false);
          response.data.errors.message = "Permission name is Invalid"
          snackBarData(true, "error", response.data.errors.message);
        }
      }
    });
  }

  return (
    <Fragment>

      <DialogContent>
        <Grid
          container
          direction={"column"}
          marginTop="10px"
          marginBottom={2}
        >
          <Grid item>
            <Grid item>
              <TextField
                id="permission"
                name="permission"
                label="Enter New Permission"
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => formik.setFieldTouched("permission", true)}
                value={formik.values.permission}
                onChange={formik.handleChange}
                error={formik.touched.permission && Boolean(formik.errors.permission)}
                helperText={formik.touched.permission && formik.errors.permission}
                onBlur={formik.handleBlur}
              />
            </Grid>
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
              onClick={() => setConfirmationButtons(true)}
              disabled={!formik.isValid}
            >
              Create
            </Button>
          }
        </DialogActions>
      </DialogContent>
    </Fragment >
  );
};
export default AddPermissionDialog;
