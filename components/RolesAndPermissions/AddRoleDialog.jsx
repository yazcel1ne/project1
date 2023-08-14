import React, {useState, Fragment } from "react";
import {
  Button,
  TextField,
  DialogActions,
  Grid,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { createRole } from "../../config/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import ConfirmationButtons from "../ConfirmationButtons";

const AddRoleDialog = ({ snackBarData, onClose }) => {
  const [confirmationButtons, setConfirmationButtons] = useState(false); // set the confirmation buttons
  const [isLoading, setIsLoading] = useState(false);// set the loading state

  const validationSchema = Yup.object({
    role: Yup.string().required("Role is required")
    .matches(/^[a-zA-Z\s]+$/, 'Special characters and numbers are not allowed'),

  });
  const formik = useFormik({
    initialValues: {
      role: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      if (!values.role) {
        formik.setFieldError("role", "Role is required");
      }
      else {
        console.log(values);
        handleSubmitCreateRole();
      }
      setSubmitting(false);
    },
  });

  const handleSubmitCreateRole = async () => {
    setIsLoading(true);
    createRole({ name: formik.values.role }, async (response) => {
      if (response.ok) {
        snackBarData(true, "success", response.data.message);
        onClose();
      }
      else {
        if (response.problem) {
          setIsLoading(false);
          setConfirmationButtons(false)
          response.data.errors.message = "Role name is Invalid"
          snackBarData(true, "error", response.data.errors.message);
        }
      }
    });
  };

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
                id="role"
                name="role"
                label="Enter New Role"
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => formik.setFieldTouched("role", true)}
                value={formik.values.role}
                onChange={formik.handleChange}
                error={formik.touched.role && Boolean(formik.errors.role)}
                helperText={formik.touched.role && formik.errors.role}
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
    </Fragment>
  );
}
export default AddRoleDialog;
