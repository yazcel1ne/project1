import {
  Grid,
  Button,
  TextField,
  Typography,
  Paper,
  CardMedia,
  CircularProgress,
} from "@mui/material";
import { Link, Navigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import React, { Fragment, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import SnackBar from "../../components/SnackBar";
import Logo from "../../assets/nms-logo.png";
import { login } from "../../config/api";

const Login = () => {
  // Function
  const { setUser, csrfToken } = useAuth();
  // snackbar
  const [snackBarInitialValue, setSnackBarInitialValue] = useState({
    openSnackbar: false,
    snackbarSeverity: "success",
    snackbarMessage: "",
  });
  // loading
  const [isLoading, setIsLoading] = useState(false);

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
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
  });

  // Handle the data when submitting
  const handleLogin = async (event) => {
    event.preventDefault();

    await csrfToken();

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    if (formik.values.email === "" && formik.values.password === "") {
      formik.setErrors({
        email: "Email is required",
        password: "Password is required",
      });
      formik.setTouched({
        email: true,
        password: true,
      });
      snackBarData(
        true,
        "error",
        "Please provide the required information in the form."
      );
      setIsLoading(false);
      return;
    }

    login(formik.values, async (response) => {
      if (response.ok) {
        setUser(response.data.user);
        return <Navigate to="/dashboard" />;
      } else {
        if (response.problem) {
          response.data.message = "Email or Password is incorrect";
          snackBarData(true, "error", response.data.message);
          setIsLoading(false);
        }
      }
      setIsLoading(false);
    });
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleLogin(event);
    }
  };

  return (
    <Fragment>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Paper elevation={12}>
          <Grid width={400} container spacing={2} padding={3}>
            <Grid item xs={12} md={12} align="center">
              <Typography variant="h4" gutterBottom>
                Welcome to
              </Typography>
              <Typography variant="subtitle1" gutterBottom color="primary">
                NMS Inventory System
              </Typography>
              <CardMedia
                sx={{ width: 130, height: 55 }}
                image={Logo}
                alt={Logo}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
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
            <Grid item xs={12} md={12}>
              <TextField
                variant="outlined"
                fullWidth
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                onClick={() => formik.setFieldTouched("password", true)}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
                onChange={(e) =>
                  formik.setFieldValue("password", e.target.value)
                }
                onKeyPress={handleKeyPress} // Handle "Enter" key press
              />
              <Typography textAlign="right" marginTop={1}>
                <Link to="/forgot-password">Forgot Password</Link>
              </Typography>
            </Grid>

            <Grid item xs={12} md={12}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleLogin}
                disabled={!formik.isValid || formik.isSubmitting || isLoading}
              >
                {isLoading ? (
                  <CircularProgress color="inherit" size={24} />
                ) : (
                  "Login"
                )}
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

export default Login;
