import {
  Grid,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import React, { Fragment, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { forgotPassword } from "../../config/api";
import SnackBar from "../../components/SnackBar";

const ForgotPassword = () => {
  const { csrfToken } = useAuth();
  //Snack Bar
  const [snackBarInitialValue, setSnackBarInitialValue] = useState({
    openSnackbar: false,
    snackbarSeverity: "success",
    snackbarMessage: "",
  });
  // loading
  const [isLoading, setIsLoading] = useState(false);
  // disable
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleCancel = () => {
    window.history.back();
  };

  const handleOpenSnackbar = (newValue) => {
    setSnackBarInitialValue((prevValue) => ({
      ...prevValue,
      openSnackbar: newValue,
    }));
  };

  const handleSnackbarSeverity = (newValue) => {
    setSnackBarInitialValue((prevValue) => ({
      ...prevValue,
      snackbarSeverity: newValue,
    }));
  };

  const handleSnackbarMessage = (newValue) => {
    setSnackBarInitialValue((prevValue) => ({
      ...prevValue,
      snackbarMessage: newValue,
    }));
  };

  const snackBarData = (open, severity, message) => {
    handleOpenSnackbar(open);
    handleSnackbarSeverity(severity);
    handleSnackbarMessage(message);
    setTimeout(() => {
      handleOpenSnackbar(false);
    }, 3000);
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .required("Email is required")
      .email("Invalid email address"),
  });
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: (values) => {
      //needed
      console.log(values);
    },
  });
  //handle the data when submitting
  const handleForgotPassword = async (event) => {
    event.preventDefault();

    await csrfToken();

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    const disableButton = () => {
      setIsButtonDisabled(true);
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 3000);
    };

    if (formik.values.email === "") {
      formik.setErrors({
        email: "Email is required",
      });
      formik.setTouched({
        email: true,
      });
      snackBarData(
        true,
        "error",
        "Please provide the required information in the form."
      );
      setIsLoading(false);
      return;
    }

    disableButton();

    const response = await forgotPassword({
      email: formik.values.email,
    });
    if (response.ok) {
      snackBarData(true, "success", response.data.message);
      setIsLoading(false);
    } else {
      snackBarData(true, "error", response.data.error);
      setIsLoading(false);
    }
  };

  return (
    <Fragment>
      <Grid
        container
        direction="column"
        justifyContent="center"
        minHeight={"100vh"}
        width={"30vw"}
        margin="auto"
      >
        <Paper elevation={12}>
          <Grid container spacing={1} padding={3} height={"40vh"}>
            <Grid item xs={12} md={12} lg={12}>
              <Typography variant="h4" textAlign="center">
                Forgot Password
              </Typography>
            </Grid>

            <Grid item xs={12} md={12} lg={12}>
              <TextField
                size="small"
                fullWidth
                name="email"
                autoComplete="email"
                label="Email"
                onClick={() => formik.setFieldTouched("email", true)}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                onChange={(e) => formik.setFieldValue("email", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={6}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleForgotPassword}
                disabled={
                  !formik.isValid ||
                  formik.isSubmitting ||
                  isLoading ||
                  isButtonDisabled
                }
              >
                {isLoading ? (
                  <CircularProgress color="inherit" size={24} /> // Show CircularProgress while loading
                ) : (
                  "Submit Email"
                )}
              </Button>
            </Grid>

            <Grid item xs={12} md={6} lg={6}>
              <Button fullWidth onClick={handleCancel}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      {/* -------------SNACKBAR-------------- */}
      <SnackBar
        open={snackBarInitialValue.openSnackbar}
        severity={snackBarInitialValue.snackbarSeverity}
        message={snackBarInitialValue.snackbarMessage}
      />
    </Fragment>
  );
};
export default ForgotPassword;
