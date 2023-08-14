import {
  Grid,
  Button,
  TextField,
  Typography,
  Paper,
  Box,
  CircularProgress,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import React, { Fragment, useState } from "react";
import { resetPassword } from "../../config/api";
import SnackBar from "../../components/SnackBar";

const ResetPassword = () => {
  //function
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  //Snack Bar
  const [snackBarInitialValue, setSnackBarInitialValue] = useState({
    openSnackbar: false,
    snackbarSeverity: "success",
    snackbarMessage: "",
  });
  // loading
  const [isLoading, setIsLoading] = useState(false);
  //disable
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

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
    password: Yup.string().required("Password is required"),
    confirmPassword: Yup.string().required("Confirm Password is required"),
  });
  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: (values) => {
      //needed
      console.log(values);
    },
  });

  //handle the data when submitting
  const handleResetPassword = async (event) => {
    event.preventDefault();

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

    if (formik.values.password === "" && formik.values.confirmPassword === "") {
      formik.setErrors({
        password: "Password is required",
        confirmPassword: "Confirm Password is required",
      });
      formik.setTouched({
        password: true,
        confirmPassword: true,
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

    if (formik.values.password !== formik.values.confirmPassword) {
      snackBarData(true, "error", "Passwords do not match");
      setIsLoading(false);
      return;
    }
    const response = await resetPassword({
      token,
      email,
      password: formik.values.password,
      confirmPassword: formik.values.confirmPassword,
    });
    if (response.ok) {
      snackBarData(true, "success", response.data.message);
      setIsLoading(false);
      setTimeout(() => {
        window.location.href = "/";
      }, 3500);
    } else {
      snackBarData(true, "error", response.data.error);
      setIsLoading(false);
    }
  };

  return (
    <Fragment>
      <Box sx={{ bgcolor: "#f5f5f5" }}>
        <Box sx={{ width: "30vw", margin: "auto" }}>
          <Grid
            container
            spacing={3}
            direction="column"
            justifyContent="center"
            sx={{ minHeight: "100vh" }}
          >
            <Paper elevation={12} sx={{ padding: 7 }}>
              <Grid container direction="column" spacing={2}>
                <Typography variant="h4" gutterBottom>
                  Reset Password
                </Typography>

                <Grid item>
                  <TextField
                    variant="outlined"
                    fullWidth
                    name="password"
                    label="New Password"
                    type="password"
                    onClick={() => formik.setFieldTouched("password", true)}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    error={
                      formik.touched.password && Boolean(formik.errors.password)
                    }
                    helperText={
                      formik.touched.password && formik.errors.password
                    }
                    onChange={(e) =>
                      formik.setFieldValue("password", e.target.value)
                    }
                  />
                </Grid>

                <Grid item>
                  <TextField
                    variant="outlined"
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    onClick={() => formik.setFieldTouched("password", true)}
                    onBlur={formik.handleBlur}
                    value={formik.values.confirmPassword}
                    error={
                      formik.touched.confirmPassword &&
                      Boolean(formik.errors.confirmPassword)
                    }
                    helperText={
                      formik.touched.confirmPassword &&
                      formik.errors.confirmPassword
                    }
                    onChange={(e) =>
                      formik.setFieldValue("confirmPassword", e.target.value)
                    }
                  />
                </Grid>

                <Grid item>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleResetPassword}
                    disabled={
                      !formik.isValid ||
                      formik.isSubmitting ||
                      isLoading ||
                      isButtonDisabled
                    }
                    sx={{
                      fontWeight: "bold",
                      bgcolor: "#7a0702",
                      ":hover": {
                        bgcolor: "#450c0a",
                        color: "white",
                      },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress color="inherit" size={24} /> // Show CircularProgress while loading
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Box>
      </Box>
      {/* -------------SNACKBAR-------------- */}
      <SnackBar
        open={snackBarInitialValue.openSnackbar}
        severity={snackBarInitialValue.snackbarSeverity}
        message={snackBarInitialValue.snackbarMessage}
      />
    </Fragment>
  );
};
export default ResetPassword;
